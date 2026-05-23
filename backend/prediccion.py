import pandas as pd
import numpy as np
from sklearn.linear_model import BayesianRidge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import mean_absolute_error

# Carga y preparación
df = pd.read_excel('Calificaciones.xlsx')
df.columns = df.columns.str.strip()

df['SUSPENSOS']  = df['PRESENTADOS'] - df['APROBADOS']
df['PENDIENTES'] = df['SUSPENSOS'] + df['NP']

def n_convocatoria(fila):
    if fila['SEMESTRE'] % 2 == 0:
        return {'JUNIO': 'PRIMERA', 'SEPTIEMBRE': 'SEGUNDA',
                'ENERO': 'TERCERA', 'FEBRERO': 'TERCERA'}[fila['CONVOCATORIA']]
    else:
        return {'ENERO': 'PRIMERA', 'FEBRERO': 'PRIMERA',
                'JUNIO': 'SEGUNDA', 'SEPTIEMBRE': 'TERCERA'}[fila['CONVOCATORIA']]

def conv_orden(fila):
    if fila['SEMESTRE'] % 2 == 0:
        return {'JUNIO': 1, 'SEPTIEMBRE': 2, 'ENERO': 3, 'FEBRERO': 3}[fila['CONVOCATORIA']]
    else:
        return {'ENERO': 1, 'FEBRERO': 1, 'JUNIO': 2, 'SEPTIEMBRE': 3}[fila['CONVOCATORIA']]

df['PERIODO']    = df.apply(n_convocatoria, axis=1)
df['CONV_ORDER'] = df.apply(conv_orden, axis=1)
df = df.sort_values(['ASIGNATURA', 'CURSO', 'CONV_ORDER']).reset_index(drop=True)

df['PENDIENTES_PREV'] = df.groupby('ASIGNATURA')['PENDIENTES'].shift(1)
df['CURSO_NORM']      = df['CURSO'] - df['CURSO'].min()

# Dataset de entrenamiento
df_ml = df.dropna(subset=['PENDIENTES_PREV']).reset_index(drop=True)

dummies = pd.get_dummies(df_ml[['PERIODO', 'ASIGNATURA']], drop_first=True, dtype=int)
X = pd.concat([df_ml[['PENDIENTES_PREV', 'CURSO_NORM']], dummies], axis=1)

# Crear interacciones dinámicamente para cada dummy de asignatura
asignatura_dummy_cols = [c for c in dummies.columns if c.startswith('ASIGNATURA_')]
for col in asignatura_dummy_cols:
    suffix = col.replace('ASIGNATURA_', '')
    X[f'PEND_x_{suffix}']     = X['PENDIENTES_PREV'] * X[col]
    X[f'PERIODO2_x_{suffix}'] = X['PERIODO_SEGUNDA']  * X[col]
    X[f'PERIODO3_x_{suffix}'] = X['PERIODO_TERCERA']  * X[col]

y = df_ml['PRESENTADOS']

# Entrenamiento
model = Pipeline([
    ('scaler', StandardScaler()),
    ('br',     BayesianRidge()),
])
model.fit(X, y)

# Validación 
y_loo = cross_val_predict(model, X, y, cv=LeaveOneOut())

mae  = mean_absolute_error(y, y_loo)
rmse = np.sqrt(np.mean((y - y_loo) ** 2))
mape = np.mean(np.abs((y - y_loo) / y)) * 100

print('Validación:')
print(f'  MAE global : {mae:.1f} alumnos')
print(f'  RMSE global: {rmse:.1f} alumnos')
print(f'  MAPE global: {mape:.1f}%')
for asig in df_ml['ASIGNATURA'].unique():
    mask = (df_ml['ASIGNATURA'] == asig).values
    try:
        val = mean_absolute_error(y[mask], y_loo[mask])
    except Exception:
        val = float('nan')
    print(f'  MAE asig {asig}: {val:.1f} alumnos')

# PREDICCIONES
curso_norm_2026 = 2026 - df['CURSO'].min()
scaler = model.named_steps['scaler']
modelo = model.named_steps['br']

# Ejemplo: generar predicciones para las dos primeras asignaturas únicas
unique_asigs = list(df_ml['ASIGNATURA'].unique())[:2]
entradas = []
for asig in unique_asigs:
    # tomar el último PENDIENTES disponible para la asignatura
    ult = df[df.ASIGNATURA == asig]['PENDIENTES'].dropna()
    pend_prev = int(ult.iloc[-1]) if len(ult) > 0 else 0
    entradas.append({
        'ASIGNATURA': asig,
        'PENDIENTES_PREV': pend_prev,
        'PERIODO_SEGUNDA': 0,
        'PERIODO_TERCERA': 0,
    })

resultados = []
Xcols = X.columns
asignatura_dummy_cols = [c for c in Xcols if c.startswith('ASIGNATURA_')]
pend_x_cols = [c for c in Xcols if c.startswith('PEND_x_')]
per2_x_cols = [c for c in Xcols if c.startswith('PERIODO2_x_')]
per3_x_cols = [c for c in Xcols if c.startswith('PERIODO3_x_')]

for p in entradas:
    pend = p['PENDIENTES_PREV']
    seg = p.get('PERIODO_SEGUNDA', 0)
    ter = p.get('PERIODO_TERCERA', 0)
    asignatura_val = p['ASIGNATURA']
    periodo_label = 'SEGUNDA' if seg else ('TERCERA' if ter else 'PRIMERA')

    row = {col: 0 for col in Xcols}
    row['PENDIENTES_PREV'] = pend
    row['CURSO_NORM'] = curso_norm_2026
    if 'PERIODO_SEGUNDA' in row:
        row['PERIODO_SEGUNDA'] = seg
    if 'PERIODO_TERCERA' in row:
        row['PERIODO_TERCERA'] = ter

    for col in asignatura_dummy_cols:
        cat = col.replace('ASIGNATURA_', '')
        row[col] = 1 if cat == asignatura_val else 0

    for col in pend_x_cols:
        suffix = col.replace('PEND_x_', '')
        row[col] = pend * (1 if suffix == asignatura_val else 0)
    for col in per2_x_cols:
        suffix = col.replace('PERIODO2_x_', '')
        row[col] = seg * (1 if suffix == asignatura_val else 0)
    for col in per3_x_cols:
        suffix = col.replace('PERIODO3_x_', '')
        row[col] = ter * (1 if suffix == asignatura_val else 0)

    fila = pd.DataFrame([row])[Xcols]
    pred, std = modelo.predict(scaler.transform(fila), return_std=True)
    ic_low = max(0, pred[0] - 1.96 * std[0])
    ic_high = pred[0] + 1.96 * std[0]

    resultados.append({
        'Asignatura': p['ASIGNATURA'],
        'Pred': round(pred[0]),
        'IClow': round(ic_low),
        'IChigh': round(ic_high),
    })
    historico = df[(df.ASIGNATURA == p['ASIGNATURA']) & (df.PERIODO == periodo_label)]['PRESENTADOS'].tolist()
    print(f'  Asig {p["ASIGNATURA"]} (Junio = {periodo_label}): '
          f'{pred[0]:.0f} presentados  '
          f'(IC 95%: {ic_low:.0f} – {ic_high:.0f})  '
          f'|  Histórico {periodo_label}: {historico}')

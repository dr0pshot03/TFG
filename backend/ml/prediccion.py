"""
Copiado desde backend/prediccion.py para que el contexto de build de Docker exista.
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import BayesianRidge
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import mean_absolute_error

# (Contenido idéntico al original prediccion.py)

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

df_ml = df.dropna(subset=['PENDIENTES_PREV']).reset_index(drop=True)

dummies = pd.get_dummies(df_ml[['PERIODO', 'ASIGNATURA']], drop_first=True, dtype=int)
X = pd.concat([df_ml[['PENDIENTES_PREV', 'CURSO_NORM']], dummies], axis=1)

asignatura_dummy_cols = [c for c in dummies.columns if c.startswith('ASIGNATURA_')]
for col in asignatura_dummy_cols:
    suffix = col.replace('ASIGNATURA_', '')
    X[f'PEND_x_{suffix}']     = X['PENDIENTES_PREV'] * X[col]
    X[f'PERIODO2_x_{suffix}'] = X['PERIODO_SEGUNDA']  * X[col]
    X[f'PERIODO3_x_{suffix}'] = X['PERIODO_TERCERA']  * X[col]

y = df_ml['PRESENTADOS']

model = Pipeline([
    ('scaler', StandardScaler()),
    ('br',     BayesianRidge()),
])
model.fit(X, y)

y_loo = cross_val_predict(model, X, y, cv=LeaveOneOut())

mae  = mean_absolute_error(y, y_loo)
rmse = np.sqrt(np.mean((y - y_loo) ** 2))
mape = np.mean(np.abs((y - y_loo) / y)) * 100

print('Validación:')
print(f'  MAE global : {mae:.1f} alumnos')
print(f'  RMSE global: {rmse:.1f} alumnos')
print(f'  MAPE global: {mape:.1f}%')

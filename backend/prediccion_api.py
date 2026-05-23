#!/usr/bin/env python3
import sys
import json
import os
import io
import warnings
import pandas as pd
import re
import pickle

warnings.filterwarnings("ignore")

# Cambia al directorio del script para asegurar rutas relativas
base_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(base_dir)

# Importa el módulo principal de predicción pero suprimiendo salidas
old_stdout = sys.stdout
sys.stdout = io.StringIO()
try:
    import prediccion as mod
finally:
    sys.stdout = old_stdout

# referencias al scaler y modelo entrenados dentro de prediccion.py
scaler = getattr(mod, 'scaler', None)
modelo = getattr(mod, 'modelo', None)

def build_row_from_input(p, Xcols, curso_norm_2026):
    # valores base
    pend = float(p.get('PENDIENTES_PREV', 0))
    seg = int(p.get('PERIODO_SEGUNDA', 0))
    ter = int(p.get('PERIODO_TERCERA', 0))
    asignatura_val = str(p.get('ASIGNATURA', ''))

    # identificar columnas dinámicas
    asignatura_dummy_cols = [c for c in Xcols if c.startswith('ASIGNATURA_')]
    pend_x_cols = [c for c in Xcols if c.startswith('PEND_x_')]
    per2_x_cols = [c for c in Xcols if c.startswith('PERIODO2_x_')]
    per3_x_cols = [c for c in Xcols if c.startswith('PERIODO3_x_')]

    # construir fila inicializada a 0
    row = {col: 0 for col in Xcols}
    if 'PENDIENTES_PREV' in row:
        row['PENDIENTES_PREV'] = pend
    if 'CURSO_NORM' in row:
        row['CURSO_NORM'] = curso_norm_2026
    if 'PERIODO_SEGUNDA' in row:
        row['PERIODO_SEGUNDA'] = seg
    if 'PERIODO_TERCERA' in row:
        row['PERIODO_TERCERA'] = ter

    # asignatura dummies
    for col in asignatura_dummy_cols:
        cat = col.replace('ASIGNATURA_', '')
        row[col] = 1 if cat == asignatura_val else 0

    # interacciones
    for col in pend_x_cols:
        suffix = col.replace('PEND_x_', '')
        row[col] = pend * (1 if suffix == asignatura_val else 0)
    for col in per2_x_cols:
        suffix = col.replace('PERIODO2_x_', '')
        row[col] = seg * (1 if suffix == asignatura_val else 0)
    for col in per3_x_cols:
        suffix = col.replace('PERIODO3_x_', '')
        row[col] = ter * (1 if suffix == asignatura_val else 0)

    return row


def compute_with_model(model, scaler, df_reference, entradas, caps=None):
    Xcols = list(model['Xcols'])
    curso_norm_2026 = 2026 - df_reference['CURSO'].min()

    resultados = []
    for p in entradas:
        row = build_row_from_input(p, Xcols, curso_norm_2026)
        fila = pd.DataFrame([row])[Xcols]
        pred, std = model['br'].predict(scaler.transform(fila), return_std=True)
        # pred here is a rate (may be slightly outside [0,1]); clip it for counts
        rate = float(pred[0])
        rate_clipped = max(0.0, min(rate, 1.0))
        ic_low = max(0.0, rate_clipped - 1.96 * std[0])
        ic_high = min(1.0, rate_clipped + 1.96 * std[0])

        cap = None
        if caps is not None and len(caps) > 0:
            try:
                cap = caps.pop(0)
            except Exception:
                cap = None

        if cap is not None and cap is not False:
            try:
                capv = int(cap)
            except Exception:
                capv = None
        else:
            capv = None

        pred_count = None
        ic_low_count = None
        ic_high_count = None

        # Blend model rate with historical average per-asignatura to avoid extreme extrapolations.
        asig = p.get('ASIGNATURA', None)
        hist_rate = None
        n_asig = 0
        if asig is not None:
            df_asig = df_reference[df_reference['ASIGNATURA'] == asig]
            n_asig = int(df_asig.shape[0])
            total_mat = int(df_asig['N_MATRICULADOS'].sum()) if df_asig.shape[0] > 0 else 0
            total_pres = int(df_asig['PRESENTADOS'].sum()) if df_asig.shape[0] > 0 else 0
            if total_mat > 0:
                hist_rate = max(0.0, min(1.0, total_pres / total_mat))

        # global fallback rate if no hist per-asig
        total_mat_all = int(df_reference['N_MATRICULADOS'].sum()) if df_reference.shape[0] > 0 else 0
        total_pres_all = int(df_reference['PRESENTADOS'].sum()) if df_reference.shape[0] > 0 else 0
        global_rate = (max(0.0, min(1.0, total_pres_all / total_mat_all)) if total_mat_all > 0 else 0.5)

        # weight by number of records and confidence (std). more records -> more trust in model
        base_weight = min(1.0, n_asig / 10.0)
        STD_THRESHOLD = 0.5
        std_val = float(std[0])
        std_factor = max(0.0, 1.0 - (std_val / STD_THRESHOLD))
        model_weight = base_weight * std_factor

        # If predicted rate is extremely high, reduce trust in the model
        if rate_clipped >= 0.95:
            model_weight = min(model_weight, 0.5)

        # If very few records, fallback to historical completely
        if n_asig < 3 and hist_rate is not None:
            model_weight = 0.0

        fallback_rate = hist_rate if hist_rate is not None else global_rate
        final_rate = model_weight * rate_clipped + (1.0 - model_weight) * fallback_rate
        final_rate = max(0.0, min(final_rate, 1.0))

        if capv is not None and capv > 0:
            pred_count = int(round(final_rate * capv))
            ic_low_count = int(round(max(0.0, min(ic_low, 1.0)) * capv))
            ic_high_count = int(round(max(0.0, min(ic_high, 1.0)) * capv))

        resultados.append({
            'Asignatura': p.get('ASIGNATURA', None),
            'Pred': pred_count if pred_count is not None else int(round(float(rate_clipped))),
            'IClow': ic_low_count if ic_low_count is not None else int(round(ic_low)),
            'IChigh': ic_high_count if ic_high_count is not None else int(round(ic_high)),
            'pred_mean': float(rate_clipped),
            'std': float(std[0])
        })

    return resultados


def train_and_predict(train_rows, entradas, caps=None):
    # construir dataframe desde train_rows (espera campos similares a historico)
    def parse_curso(val):
        if val is None:
            return 0
        if isinstance(val, int):
            return int(val)
        s = str(val).strip()
        # si es directamente digitos
        if s.isdigit():
            v = int(s)
            # si viene como '25' asumimos 2025
            if v < 100:
                return 2000 + v
            return v
        # formatos tipo '25/26' o '2025/26' o '2025-26'
        if '/' in s or '-' in s:
            sep = '/' if '/' in s else '-'
            first = s.split(sep)[0]
            digits = re.sub(r'[^0-9]', '', first)
            if digits:
                v = int(digits)
                if v < 100:
                    return 2000 + v
                return v
        # intentar extraer primer número
        m = re.search(r'(20\d{2}|\d{2,4})', s)
        if m:
            v = int(m.group(0))
            if v < 100:
                return 2000 + v
            return v
        return 0

    df = pd.DataFrame([{
        'ASIGNATURA': str(r.get('id_asignatura') or r.get('ASIGNATURA') or ''),
        'CURSO': parse_curso(r.get('curso')),
        'N_MATRICULADOS': int(r.get('n_matriculados') or 0),
        'PRESENTADOS': int(r.get('n_presentados') or r.get('PRESENTADOS') or 0),
        'NP': int((r.get('n_matriculados') or 0) - (r.get('n_presentados') or 0)),
        'porcentaje_aprobados': float(r.get('porcentaje_aprobados') or 0),
        'CONVOCATORIA': str(r.get('convocatoria') or r.get('CONVOCATORIA') or '').strip(),
        'SEMESTRE': int(r.get('semestre')) if r.get('semestre') is not None else None,
    } for r in train_rows])

    df.columns = df.columns.str.strip()
    df['APROBADOS'] = (df['PRESENTADOS'] * df['porcentaje_aprobados'].fillna(0)).round().astype(int)
    df['SUSPENSOS'] = df['PRESENTADOS'] - df['APROBADOS']
    df['PENDIENTES'] = df['SUSPENSOS'] + df['NP']

    def n_convocatoria(fila):
        if fila['SEMESTRE'] is None:
            semestre = 1
        else:
            semestre = int(fila['SEMESTRE'])
        if semestre % 2 == 0:
            return {'JUNIO': 'PRIMERA', 'SEPTIEMBRE': 'SEGUNDA', 'ENERO': 'TERCERA', 'FEBRERO': 'TERCERA'}.get(fila['CONVOCATORIA'], 'PRIMERA')
        else:
            return {'ENERO': 'PRIMERA', 'FEBRERO': 'PRIMERA', 'JUNIO': 'SEGUNDA', 'SEPTIEMBRE': 'TERCERA'}.get(fila['CONVOCATORIA'], 'PRIMERA')

    def conv_orden(fila):
        if fila['SEMESTRE'] is None:
            semestre = 1
        else:
            semestre = int(fila['SEMESTRE'])
        if semestre % 2 == 0:
            return {'JUNIO': 1, 'SEPTIEMBRE': 2, 'ENERO': 3, 'FEBRERO': 3}.get(fila['CONVOCATORIA'], 1)
        else:
            return {'ENERO': 1, 'FEBRERO': 1, 'JUNIO': 2, 'SEPTIEMBRE': 3}.get(fila['CONVOCATORIA'], 1)

    df['PERIODO'] = df.apply(n_convocatoria, axis=1)
    df['CONV_ORDER'] = df.apply(conv_orden, axis=1)
    df = df.sort_values(['ASIGNATURA', 'CURSO', 'CONV_ORDER']).reset_index(drop=True)
    df['PENDIENTES_PREV'] = df.groupby('ASIGNATURA')['PENDIENTES'].shift(1)
    df['CURSO_NORM'] = df['CURSO'] - df['CURSO'].min()

    df_ml = df.dropna(subset=['PENDIENTES_PREV']).reset_index(drop=True)
    if df_ml.shape[0] == 0:
        raise ValueError('Train dataset vacío después de preparar features')

    dummies = pd.get_dummies(df_ml[['PERIODO', 'ASIGNATURA']], drop_first=True, dtype=int)
    X = pd.concat([df_ml[['PENDIENTES_PREV', 'CURSO_NORM']], dummies], axis=1)

    asignatura_dummy_cols = [c for c in dummies.columns if c.startswith('ASIGNATURA_')]
    for col in asignatura_dummy_cols:
        suffix = col.replace('ASIGNATURA_', '')
        X[f'PEND_x_{suffix}']     = X['PENDIENTES_PREV'] * X[col]
        X[f'PERIODO2_x_{suffix}'] = X.get('PERIODO_SEGUNDA', 0) * X[col]
        X[f'PERIODO3_x_{suffix}'] = X.get('PERIODO_TERCERA', 0) * X[col]

    # target: tasa de presentación (presentados / n_matriculados) para que el modelo aprenda proporciones
    df_ml['RATE'] = df_ml.apply(lambda r: (r['PRESENTADOS'] / r['N_MATRICULADOS']) if (r['N_MATRICULADOS'] and r['N_MATRICULADOS']>0) else 0.0, axis=1)
    # asegurar que la tasa está en [0,1]
    df_ml['RATE'] = df_ml['RATE'].clip(lower=0.0, upper=1.0)
    y = df_ml['RATE']

    from sklearn.linear_model import BayesianRidge
    from sklearn.preprocessing import StandardScaler
    from sklearn.pipeline import Pipeline
    import os

    MODELS_DIR = os.path.join(base_dir, 'models')
    os.makedirs(MODELS_DIR, exist_ok=True)

    scaler = StandardScaler()
    br = BayesianRidge()
    Xs = scaler.fit_transform(X)
    br.fit(Xs, y)

    model = { 'br': br, 'scaler': scaler, 'Xcols': list(X.columns), 'df': df }

    # persistir modelo global
    try:
        global_path = os.path.join(MODELS_DIR, 'global_model.pkl')
        with open(global_path, 'wb') as f:
            pickle.dump(model, f)
    except Exception:
        pass

    # entrenar y persistir modelos por-asignatura si hay suficientes datos
    MIN_PER_ASIG = 8
    try:
        for asig, group in df_ml.groupby('ASIGNATURA'):
            if group.shape[0] >= MIN_PER_ASIG:
                # construir dummies y X para este grupo
                dummies_a = pd.get_dummies(group[['PERIODO', 'ASIGNATURA']], drop_first=True, dtype=int)
                Xa = pd.concat([group[['PENDIENTES_PREV', 'CURSO_NORM']], dummies_a], axis=1)
                # crear interacciones
                for col in [c for c in dummies_a.columns if c.startswith('ASIGNATURA_')]:
                    suffix = col.replace('ASIGNATURA_', '')
                    Xa[f'PEND_x_{suffix}'] = Xa['PENDIENTES_PREV'] * Xa[col]
                    Xa[f'PERIODO2_x_{suffix}'] = Xa.get('PERIODO_SEGUNDA', 0) * Xa[col]
                    Xa[f'PERIODO3_x_{suffix}'] = Xa.get('PERIODO_TERCERA', 0) * Xa[col]

                ya = group['RATE']
                scaler_a = StandardScaler()
                br_a = BayesianRidge()
                Xsa = scaler_a.fit_transform(Xa)
                br_a.fit(Xsa, ya)
                model_a = {'br': br_a, 'scaler': scaler_a, 'Xcols': list(Xa.columns), 'df': group}
                try:
                    path_a = os.path.join(MODELS_DIR, f'model_{asig}.pkl')
                    with open(path_a, 'wb') as f:
                        pickle.dump(model_a, f)
                except Exception:
                    pass
    except Exception:
        pass

    # ahora, para cada entrada, preferir modelo por-asignatura si existe
    resultados_all = []
    for idx, p in enumerate(entradas):
        asig = p.get('ASIGNATURA', None)
        model_to_use = None
        df_ref = df
        try:
            if asig:
                path_a = os.path.join(MODELS_DIR, f'model_{asig}.pkl')
                if os.path.exists(path_a):
                    with open(path_a, 'rb') as f:
                        model_to_use = pickle.load(f)
                        df_ref = model_to_use.get('df', df)
        except Exception:
            model_to_use = None

        if model_to_use is None:
            model_to_use = model

        cap_list = None
        if caps is not None:
            # pass only the corresponding cap for this entrada
            cap_val = caps[idx] if idx < len(caps) else None
            cap_list = [cap_val] if cap_val is not None else []

        res = compute_with_model(model_to_use, model_to_use['scaler'], df_ref, [p], caps=cap_list)
        if isinstance(res, list) and len(res) > 0:
            resultados_all.extend(res)

    return resultados_all


def main():
    try:
        data = sys.stdin.read()
        if not data:
            entradas = []
        else:
            payload = json.loads(data)
            # compat: si viene un array, es solo entradas
            if isinstance(payload, list):
                entradas = payload
                # intentar usar módulo cargado inicialmente
                if modelo is not None and scaler is not None and hasattr(mod, 'X'):
                    res = compute_with_model({'br': modelo, 'Xcols': list(mod.X.columns)}, scaler, mod.df, entradas)
                else:
                    # fallback vacío
                    res = []
            else:
                train = payload.get('train')
                entradas = payload.get('entradas', [])
                if train:
                    caps = payload.get('caps', None)
                    res = train_and_predict(train, entradas, caps=caps)
                else:
                    # si no hay train, usar módulo existente si es posible
                    if modelo is not None and scaler is not None and hasattr(mod, 'X'):
                        res = compute_with_model({'br': modelo, 'Xcols': list(mod.X.columns)}, scaler, mod.df, entradas)
                    else:
                        res = []

        print(json.dumps(res))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()

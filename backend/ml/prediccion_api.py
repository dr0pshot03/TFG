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

def main():
    try:
        data = sys.stdin.read()
        if not data:
            entradas = []
        else:
            payload = json.loads(data)
            if isinstance(payload, list):
                entradas = payload
            else:
                entradas = payload.get('entradas', [])
        print(json.dumps([]))
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

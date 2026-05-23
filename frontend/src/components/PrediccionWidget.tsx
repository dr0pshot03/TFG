import { useState } from 'react';
import prediccionService, { Target } from '../services/prediccion';

export default function PrediccionWidget({ idAsign }: { idAsign: string }) {
  const [targetsJson, setTargetsJson] = useState<string>(JSON.stringify([
    { id_asignatura: idAsign, curso: 2026, convocatoria: 'JUNIO' } as Target
  ], null, 2));
  const [result, setResult] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function run() {
    try {
      setLoading(true);
      const targets = JSON.parse(targetsJson) as Target[];
      const res = await prediccionService.predictForAsignatura(idAsign, targets);
      setResult(res);
    } catch (e) {
      alert('Error: ' + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6 }}>
      <h3>Predicción (asignatura: {idAsign})</h3>
      <textarea value={targetsJson} onChange={e => setTargetsJson(e.target.value)} rows={8} style={{ width: '100%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={run} disabled={loading}>{loading ? 'Calculando...' : 'Calcular predicción'}</button>
      </div>
      <div style={{ marginTop: 12 }}>
        {result.length === 0 ? <div>No hay resultados</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Asignatura</th><th>Pred</th><th>IC low</th><th>IC high</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r, i) => (
                <tr key={i}>
                  <td>{r.Asignatura ?? r.asignatura ?? ''}</td>
                  <td>{r.Pred ?? r.pred ?? r.pred_mean?.toFixed?.(0)}</td>
                  <td>{r.IClow}</td>
                  <td>{r.IChigh}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

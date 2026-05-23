export type Target = {
  id_asignatura: string;
  curso: number;
  convocatoria: string; // 'JUNIO' | 'SEPTIEMBRE' | 'ENERO' | 'FEBRERO'
};

export type HistRow = {
  id?: string;
  id_asignatura: string;
  curso: string | number;
  n_matriculados: number;
  n_presentados: number;
  porcentaje_aprobados: number;
  convocatoria: string;
};

async function handleRes(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = body?.error ?? body ?? `HTTP ${res.status}`;
    throw new Error(err);
  }
  return res.json();
}

export async function predictForAsignatura(idAsign: string, targets: Target[]) {
  if (!idAsign) throw new Error('idAsign required');
  if (!Array.isArray(targets) || targets.length === 0) throw new Error('targets required');

  const res = await fetch(`/api/prediccion/for-asignatura/${encodeURIComponent(idAsign)}`, {
  const res = await fetch(`/api/prediccion/asignatura/${encodeURIComponent(idAsign)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targets }),
  });

  return handleRes(res);
}

export async function predictFromHistorial(historial: HistRow[], targets?: Target[]) {
  if (!Array.isArray(historial) || historial.length === 0) throw new Error('historial required');
  const res = await fetch('/api/prediccion/from-historial', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ historial, targets }),
  });
  return handleRes(res);
}

export default { predictForAsignatura, predictFromHistorial };

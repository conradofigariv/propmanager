export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    // Acepta ?months=N (default 3). Clamp entre 1 y 24.
    const months = Math.min(24, Math.max(1, parseInt(req.query.months) || 3));

    const today = new Date().toISOString().slice(0, 10);
    const dFrom = new Date();
    dFrom.setMonth(dFrom.getMonth() - months);
    const desde = dFrom.toISOString().slice(0, 10);

    const [iclRes, ipcRes] = await Promise.all([
      fetch(`https://api.argly.com.ar/api/icl/range?desde=${desde}&hasta=${today}`),
      fetch('https://api.argly.com.ar/api/ipc'),
    ]);

    const iclJson = await iclRes.json();
    const ipcJson = await ipcRes.json();

    function toISO(s) { const [d, m, y] = s.split('/'); return `${y}-${m}-${d}`; }

    const iclData = (iclJson.data || [])
      .map(r => ({ date: toISO(r.fecha), value: parseFloat(r.valor) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const iclNow  = iclData[iclData.length - 1]?.value;
    const iclLast = iclData[iclData.length - 1]?.date;
    const iclRef  = iclData[0]?.value; // primer valor del período pedido

    const iclVar = (iclNow && iclRef) ? ((iclNow - iclRef) / iclRef * 100).toFixed(2) : null;

    // IPC — variación compuesta para N meses
    const ipcRate = ipcJson.data?.indice_ipc;
    const ipcVar  = ipcRate != null
      ? ((Math.pow(1 + ipcRate / 100, months) - 1) * 100).toFixed(2)
      : null;
    const ipcLastMonth = ipcJson.data ? `${ipcJson.data.nombre_mes} ${ipcJson.data.anio}` : null;

    res.status(200).json({
      months,
      icl: { variation: iclVar, lastMonth: iclLast },
      ipc: { variation: ipcVar, lastMonth: ipcLastMonth },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const today = new Date().toISOString().slice(0, 10);
    const d6 = new Date(); d6.setMonth(d6.getMonth() - 6);
    const desde = d6.toISOString().slice(0, 10);

    const [iclRes, ipcRes] = await Promise.all([
      fetch(`https://api.argly.com.ar/api/icl/range?desde=${desde}&hasta=${today}`),
      fetch('https://api.argly.com.ar/api/ipc'),
    ]);

    const iclJson = await iclRes.json();
    const ipcJson = await ipcRes.json();

    // ICL — convertir DD/MM/YYYY a YYYY-MM-DD y ordenar
    function toISO(s) { const [d, m, y] = s.split('/'); return `${y}-${m}-${d}`; }

    const iclData = (iclJson.data || [])
      .map(r => ({ date: toISO(r.fecha), value: parseFloat(r.valor) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const iclNow  = iclData[iclData.length - 1]?.value;
    const iclLast = iclData[iclData.length - 1]?.date;

    // Buscar valor más cercano a 3 meses atrás
    const d3str = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString().slice(0, 10);
    const icl3ref = iclData.find(r => r.date >= d3str)?.value ?? iclData[0]?.value;
    const icl6ref = iclData[0]?.value;

    const iclM3 = icl3ref ? ((iclNow - icl3ref) / icl3ref * 100).toFixed(2) : null;
    const iclM6 = icl6ref ? ((iclNow - icl6ref) / icl6ref * 100).toFixed(2) : null;

    // IPC — solo tenemos la variación mensual actual, aproximamos con interés compuesto
    const ipcRate    = ipcJson.data?.indice_ipc;
    const ipcM3      = ipcRate != null ? ((Math.pow(1 + ipcRate / 100, 3) - 1) * 100).toFixed(2) : null;
    const ipcM6      = ipcRate != null ? ((Math.pow(1 + ipcRate / 100, 6) - 1) * 100).toFixed(2) : null;
    const ipcLastMonth = ipcJson.data ? `${ipcJson.data.nombre_mes} ${ipcJson.data.anio}` : null;

    res.status(200).json({
      icl: { m3: iclM3, m6: iclM6, lastMonth: iclLast },
      ipc: { m3: ipcM3, m6: ipcM6, lastMonth: ipcLastMonth },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

// Maneja dos formatos:
//
// Modo A — RentCalcModal:
//   POST { initialRent, startDate, adjustmentDate, rate }
//   → { success, pct, newRent, ratio, startIndex, currentIndex, rate }
//
// Modo B — NotificationBell:
//   POST { amount, date, months, rate }
//   → { success, data: [{ amount, dif }] }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const body = req.body;

    function toISO(s) { const [d, m, y] = s.split('/'); return `${y}-${m}-${d}`; }

    function monthsBetween(dateA, dateB) {
      const a = new Date(dateA + 'T12:00:00');
      const b = new Date(dateB + 'T12:00:00');
      return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
    }

    async function getICLRange(desde, hasta) {
      const r = await fetch(`https://api.argly.com.ar/api/icl/range?desde=${desde}&hasta=${hasta}`);
      const json = await r.json();
      return (json.data || [])
        .map(d => ({ date: toISO(d.fecha), value: parseFloat(d.valor) }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }

    async function getIPCRate() {
      const r = await fetch('https://api.argly.com.ar/api/ipc');
      const json = await r.json();
      return json.data?.indice_ipc; // variación mensual en %
    }

    // ── MODO A: RentCalcModal ──────────────────────────────────
    if (body.initialRent !== undefined) {
      const { initialRent, startDate, adjustmentDate, rate } = body;

      if (rate === 'icl') {
        const data = await getICLRange(startDate, adjustmentDate);
        if (!data.length) throw new Error('Sin datos ICL para ese rango de fechas');

        const startVal = data[0];
        const endVal   = data[data.length - 1];
        const ratio    = endVal.value / startVal.value;
        const newRent  = Math.round(initialRent * ratio);
        const pct      = ((ratio - 1) * 100).toFixed(2);

        return res.status(200).json({
          success: true, pct, newRent, ratio,
          startIndex:   { value: startVal.value, date: startVal.date },
          currentIndex: { value: endVal.value,   date: endVal.date },
          rate: 'icl',
        });
      }

      if (rate === 'ipc') {
        const monthlyRate = await getIPCRate();
        if (monthlyRate == null) throw new Error('Sin datos IPC');

        const months = monthsBetween(startDate, adjustmentDate);
        const ratio   = Math.pow(1 + monthlyRate / 100, months);
        const newRent = Math.round(initialRent * ratio);
        const pct     = ((ratio - 1) * 100).toFixed(2);

        return res.status(200).json({
          success: true, pct, newRent, ratio,
          startIndex:   { value: monthlyRate, date: startDate },
          currentIndex: { value: monthlyRate, date: adjustmentDate },
          rate: 'ipc',
        });
      }
    }

    // ── MODO B: NotificationBell ──────────────────────────────
    if (body.amount !== undefined) {
      const { amount, date, months, rate } = body;
      const today = new Date().toISOString().slice(0, 10);

      if (rate === 'icl') {
        const data = await getICLRange(date, today);
        if (!data.length) throw new Error('Sin datos ICL');

        const startVal = data[0].value;
        const endVal   = data[data.length - 1].value;
        const ratio    = endVal / startVal;
        const newAmount = Math.round(amount * ratio);
        const dif = (ratio - 1) * 100;

        return res.status(200).json({ success: true, data: [{ amount: newAmount, dif }] });
      }

      if (rate === 'ipc') {
        const monthlyRate = await getIPCRate();
        if (monthlyRate == null) throw new Error('Sin datos IPC');

        const ratio     = Math.pow(1 + monthlyRate / 100, parseInt(months));
        const newAmount = Math.round(amount * ratio);
        const dif = (ratio - 1) * 100;

        return res.status(200).json({ success: true, data: [{ amount: newAmount, dif }] });
      }
    }

    throw new Error('Parámetros inválidos');
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

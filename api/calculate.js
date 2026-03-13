// Soporta tres modos:
//
// Modo A — RentCalcModal:
//   POST { initialRent, startDate, adjustmentDate, rate }
//   → { success, pct, newRent, ratio, startIndex, currentIndex, rate }
//
// Modo B — NotificationBell:
//   POST { amount, date, months, rate }
//   → { success, data: [{ amount, dif }] }
//
// Modo C — Calculadora (multi-período):
//   POST { mode:"multi", initialRent, startDate, freqMonths, rate, today }
//   → { success, periods: [{ date, idxVal, aumento, valor }] }

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    const body = req.body;

    function toISO(s) { const [d, m, y] = s.split('/'); return `${y}-${m}-${d}`; }

    function addMonths(iso, n) {
      const d = new Date(iso + 'T12:00:00');
      d.setMonth(d.getMonth() + n);
      return d.toISOString().slice(0, 10);
    }

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

    function findClosest(data, target) {
      let res = null;
      for (const r of data) { if (r.date <= target) res = r; else break; }
      return res;
    }

    async function getIPCRate() {
      const r = await fetch('https://api.argly.com.ar/api/ipc');
      const json = await r.json();
      return json.data?.indice_ipc;
    }

    // ── MODO C: Calculadora multi-período ─────────────────────
    if (body.mode === 'multi') {
      const { initialRent, startDate, freqMonths, rate, today } = body;
      const endDate = today || new Date().toISOString().slice(0, 10);
      const freq = parseInt(freqMonths);

      if (rate === 'icl') {
        const iclData = await getICLRange(startDate, endDate);
        if (!iclData.length) throw new Error('Sin datos ICL para ese rango de fechas');

        const iclStart = findClosest(iclData, startDate);
        if (!iclStart) throw new Error(`Sin datos ICL para la fecha ${startDate}`);

        const periods = [];
        let n = 0, date = startDate;
        while (date <= endDate) {
          const icl = findClosest(iclData, date);
          if (!icl) break;
          const coef = icl.value / iclStart.value;
          periods.push({
            date,
            idxVal: icl.value,
            aumento: n === 0 ? 0 : (coef - 1) * 100,
            valor: Math.round(initialRent * coef),
          });
          n++;
          date = addMonths(startDate, n * freq);
        }

        return res.status(200).json({ success: true, periods });
      }

      if (rate === 'ipc') {
        const monthlyRate = await getIPCRate();
        if (monthlyRate == null) throw new Error('Sin datos IPC');

        const periods = [];
        let n = 0, date = startDate;
        while (date <= endDate) {
          const coef = Math.pow(1 + monthlyRate / 100, n * freq);
          periods.push({
            date,
            idxVal: monthlyRate,
            aumento: n === 0 ? 0 : (coef - 1) * 100,
            valor: Math.round(initialRent * coef),
          });
          n++;
          date = addMonths(startDate, n * freq);
        }

        return res.status(200).json({ success: true, periods });
      }
    }

    // ── MODO A: RentCalcModal ──────────────────────────────────
    if (body.initialRent !== undefined && body.mode !== 'multi') {
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

        const startVal  = data[0].value;
        const endVal    = data[data.length - 1].value;
        const ratio     = endVal / startVal;
        const newAmount = Math.round(amount * ratio);
        const dif       = (ratio - 1) * 100;

        return res.status(200).json({ success: true, data: [{ amount: newAmount, dif }] });
      }

      if (rate === 'ipc') {
        const monthlyRate = await getIPCRate();
        if (monthlyRate == null) throw new Error('Sin datos IPC');

        const ratio     = Math.pow(1 + monthlyRate / 100, parseInt(months));
        const newAmount = Math.round(amount * ratio);
        const dif       = (ratio - 1) * 100;

        return res.status(200).json({ success: true, data: [{ amount: newAmount, dif }] });
      }
    }

    throw new Error('Parámetros inválidos');
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

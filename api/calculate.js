// api/calculate.js — Node.js runtime (no edge: xlsx needs Buffer)
import * as XLSX from "xlsx";

const ICL_URL =
  "https://www.bcra.gob.ar/Pdfs/PublicacionesEstadisticas/diar_icl.xls";
const IPC_API =
  "https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&format=json&limit=5000";

/* ── Date helpers ─────────────────────────────────────── */

/** Convert an Excel serial number to YYYY-MM-DD */
const excelSerialToISO = (serial) => {
  // Excel epoch = 1899-12-30; adjust for leap-year bug (serial > 60)
  const ms = (serial - 25569) * 86400 * 1000;
  return new Date(ms).toISOString().split("T")[0];
};

/** Parse whatever date format BCRA uses into YYYY-MM-DD */
const parseRowDate = (raw) => {
  if (typeof raw === "number") return excelSerialToISO(raw);
  if (typeof raw === "string") {
    const s = raw.trim();
    // DD/MM/YYYY
    const slash = s.split("/");
    if (slash.length === 3)
      return `${slash[2]}-${slash[1].padStart(2, "0")}-${slash[0].padStart(2, "0")}`;
    // Already ISO
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  }
  return null;
};

/* ── Data fetchers ────────────────────────────────────── */

/**
 * Fetches ICL from BCRA XLS.
 * Returns array sorted ascending: [{ date: "YYYY-MM-DD", value: number }, ...]
 */
async function fetchICL() {
  const res = await fetch(ICL_URL, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`BCRA HTTP ${res.status}`);

  const buf = await res.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: "array", raw: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  const data = [];
  for (const row of rows) {
    const iclVal = parseFloat(row[1]);
    if (!row[0] || isNaN(iclVal) || iclVal <= 0) continue;
    const date = parseRowDate(row[0]);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      data.push({ date, value: iclVal });
    }
  }
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fetches IPC from INDEC via datos.gob.ar.
 * Series 148.3_INIVELNAL_DICI_M_26 — IPC nivel general, mensual.
 * Dates normalized to first day of month (YYYY-MM-01).
 */
async function fetchIPC() {
  const res = await fetch(IPC_API, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`INDEC HTTP ${res.status}`);
  const json = await res.json();

  if (!Array.isArray(json.data)) throw new Error("Formato inesperado INDEC");

  return json.data
    .map(([date, value]) => ({
      date: date.slice(0, 7) + "-01", // normalize to month start
      value: parseFloat(value),
    }))
    .filter((r) => !isNaN(r.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ── Lookup ──────────────────────────────────────────── */

/**
 * Returns the last entry whose date is <= targetDate.
 * Assumes series is sorted ascending.
 */
function findClosest(series, targetDate) {
  let best = null;
  for (const item of series) {
    if (item.date <= targetDate) best = item;
    else break;
  }
  return best;
}

/* ── Handler ─────────────────────────────────────────── */

export default async function handler(req) {
  if (req.method !== "POST")
    return new Response("Method not allowed", { status: 405 });

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  // Accept both naming conventions (old RentCalcModal & NotificationBell)
  const amount    = parseFloat(body.amount ?? body.initialRent);
  const startDate = body.startDate ?? body.date;
  const today     = new Date().toISOString().split("T")[0];
  const adjDate   = body.adjustmentDate ?? today;
  const rate      = (body.rate ?? "icl").toLowerCase();

  if (!amount || isNaN(amount) || !startDate) {
    return json({ success: false, error: "Faltan parámetros: amount/initialRent y startDate son requeridos." }, 400);
  }

  try {
    const series = rate === "icl" ? await fetchICL() : await fetchIPC();

    const startItem   = findClosest(series, startDate);
    const currentItem = findClosest(series, adjDate);

    if (!startItem) {
      return json({ success: false, error: `Sin datos de ${rate.toUpperCase()} para la fecha de inicio (${startDate}).` });
    }
    if (!currentItem) {
      return json({ success: false, error: `Sin datos de ${rate.toUpperCase()} para la fecha de ajuste (${adjDate}).` });
    }

    const ratio   = currentItem.value / startItem.value;
    const newRent = Math.round(amount * ratio);
    const pct     = parseFloat(((ratio - 1) * 100).toFixed(2));

    return json({
      success: true,
      rate,
      startIndex:   { date: startItem.date,   value: startItem.value },
      currentIndex: { date: currentItem.date, value: currentItem.value },
      ratio,
      pct,
      newRent,
    });
  } catch (e) {
    console.error("[calculate]", e);
    return json({ success: false, error: e.message }, 500);
  }
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "s-maxage=1800, stale-while-revalidate=300",
    },
  });

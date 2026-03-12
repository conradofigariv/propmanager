// api/indices.js — Node.js runtime
export const config = { maxDuration: 30 }; // Vercel: allow up to 30s (Pro) or 10s (Hobby)
import * as XLSX from "xlsx";

const ICL_URL =
  "https://www.bcra.gob.ar/Pdfs/PublicacionesEstadisticas/diar_icl.xls";
const IPC_API =
  "https://apis.datos.gob.ar/series/api/series/?ids=148.3_INIVELNAL_DICI_M_26&format=json&limit=5000";

const MONTHS_ES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmtMes = (date) => {
  const [y, m] = date.split("-");
  return `${MONTHS_ES[parseInt(m) - 1]} ${y}`;
};

/* ── Date helpers ─────────────────────────────────────── */

const excelSerialToISO = (serial) =>
  new Date((serial - 25569) * 86400 * 1000).toISOString().split("T")[0];

const parseRowDate = (raw) => {
  if (typeof raw === "number") return excelSerialToISO(raw);
  if (typeof raw === "string") {
    const s = raw.trim();
    const slash = s.split("/");
    if (slash.length === 3)
      return `${slash[2]}-${slash[1].padStart(2, "0")}-${slash[0].padStart(2, "0")}`;
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  }
  return null;
};

/** Subtract N months from a YYYY-MM-DD string */
const subtractMonths = (dateStr, n) => {
  const d = new Date(dateStr + "T12:00:00");
  d.setMonth(d.getMonth() - n);
  return d.toISOString().split("T")[0];
};

/* ── Data fetchers ────────────────────────────────────── */

async function fetchICL() {
  const res = await fetch(ICL_URL, { signal: AbortSignal.timeout(12000) });
  if (!res.ok) throw new Error(`BCRA HTTP ${res.status}`);

  const buf = await res.arrayBuffer();
  const wb  = XLSX.read(new Uint8Array(buf), { type: "array", raw: true });
  const ws  = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });

  const data = [];
  for (const row of rows) {
    const val = parseFloat(row[1]);
    if (!row[0] || isNaN(val) || val <= 0) continue;
    const date = parseRowDate(row[0]);
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) data.push({ date, value: val });
  }
  return data.sort((a, b) => a.date.localeCompare(b.date));
}

async function fetchIPC() {
  const res = await fetch(IPC_API, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`INDEC HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json.data)) throw new Error("Formato INDEC inesperado");

  return json.data
    .map(([date, value]) => ({ date: date.slice(0, 7) + "-01", value: parseFloat(value) }))
    .filter((r) => !isNaN(r.value))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ── Calculation ─────────────────────────────────────── */

function findClosest(series, targetDate) {
  let best = null;
  for (const item of series) {
    if (item.date <= targetDate) best = item;
    else break;
  }
  return best;
}

/**
 * Returns the accumulated percentage change over the last `months` months.
 * Uses the latest entry as reference point.
 */
function calcPct(series, months) {
  if (!series.length) return null;
  const latest  = series[series.length - 1];
  const refDate = subtractMonths(latest.date, months);
  const older   = findClosest(series, refDate);
  if (!older || older.date === latest.date) return null;
  return parseFloat(((latest.value / older.value - 1) * 100).toFixed(1));
}

/* ── Handler ─────────────────────────────────────────── */

export default async function handler(req) {
  let ipc = null;
  let icl = null;

  // Fetch both in parallel; each fails independently
  const [iclResult, ipcResult] = await Promise.allSettled([
    fetchICL(),
    fetchIPC(),
  ]);

  if (iclResult.status === "fulfilled" && iclResult.value.length) {
    const s = iclResult.value;
    icl = {
      m3: calcPct(s, 3),
      m6: calcPct(s, 6),
      lastMonth: fmtMes(s[s.length - 1].date),
    };
  } else if (iclResult.status === "rejected") {
    console.error("[indices] ICL error:", iclResult.reason?.message);
  }

  if (ipcResult.status === "fulfilled" && ipcResult.value.length) {
    const s = ipcResult.value;
    ipc = {
      m3: calcPct(s, 3),
      m6: calcPct(s, 6),
      lastMonth: fmtMes(s[s.length - 1].date),
    };
  } else if (ipcResult.status === "rejected") {
    console.error("[indices] IPC error:", ipcResult.reason?.message);
  }

  return new Response(JSON.stringify({ ipc, icl }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      // ICL is daily, IPC is monthly — cache 1h is fine for both
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=600",
    },
  });
}

export const config = { runtime: "edge" };

const MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const fmtMes = (d) => { const p = d.slice(0,7).split("-"); return `${MESES[parseInt(p[1])-1]} ${p[0]}`; };

const callArquiler = async (rate, months, key) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  const dateStr = date.toISOString().split("T")[0];
  const res = await fetch("https://arquilerapi1.p.rapidapi.com/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-rapidapi-key": key, "x-rapidapi-host": "arquilerapi1.p.rapidapi.com" },
    body: JSON.stringify({ amount: 1000, date: dateStr, months, rate }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success || !json.data?.length) throw new Error("Sin datos");
  const last = json.data[json.data.length - 1];
  return { pct: Number(last.dif?.toFixed(1)), lastDate: last.date };
};

export default async function handler(req) {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return new Response(JSON.stringify({ error: "No API key" }), { status: 500, headers: { "Content-Type": "application/json" } });

  let ipc = null, icl = null;

  try {
    const [r3, r6] = await Promise.all([callArquiler("ipc", 3, key), callArquiler("ipc", 6, key)]);
    ipc = { m3: r3.pct, m6: r6.pct, lastMonth: fmtMes(r3.lastDate) };
  } catch(e) { console.error("IPC:", e.message); }

  try {
    const [r3, r6] = await Promise.all([callArquiler("icl", 3, key), callArquiler("icl", 6, key)]);
    icl = { m3: r3.pct, m6: r6.pct, lastMonth: fmtMes(r3.lastDate) };
  } catch(e) { console.error("ICL:", e.message); }

  return new Response(JSON.stringify({ ipc, icl }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Cache-Control": "s-maxage=3600" },
  });
}

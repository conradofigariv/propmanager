export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return new Response(JSON.stringify({ error: "No API key" }), { status: 500 });

  const { amount, date, months, rate } = await req.json();

  const res = await fetch("https://arquilerapi1.p.rapidapi.com/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-rapidapi-key": key, "x-rapidapi-host": "arquilerapi1.p.rapidapi.com" },
    body: JSON.stringify({ amount: parseFloat(amount), date, months: parseInt(months), rate }),
    signal: AbortSignal.timeout(10000),
  });

  const json = await res.json();
  return new Response(JSON.stringify(json), {
    status: res.ok ? 200 : 500,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

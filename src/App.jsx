import { useState, useEffect, useCallback } from "react";

/* ─── FONTS ─── */
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Sora:wght@300;400;500;600&display=swap";
document.head.appendChild(fontLink);

/* ─── THEME ─── */
const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0d0f14; }
  :root {
    --bg: #0d0f14;
    --surface: #141720;
    --surface2: #1c2030;
    --surface3: #232840;
    --border: #2a2f45;
    --gold: #c9a84c;
    --gold2: #e8c96a;
    --gold-dim: rgba(201,168,76,0.15);
    --red: #e05c5c;
    --red-dim: rgba(224,92,92,0.15);
    --green: #4caf7d;
    --green-dim: rgba(76,175,125,0.15);
    --blue: #5c8fe0;
    --blue-dim: rgba(92,143,224,0.15);
    --text: #e8eaf0;
    --text2: #8b90a8;
    --text3: #555a72;
  }
  .app { display:flex; min-height:100vh; font-family:'Sora',sans-serif; color:var(--text); background:var(--bg); }
  .sidebar { width:220px; min-height:100vh; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; position:fixed; top:0; left:0; bottom:0; z-index:10; }
  .sidebar-logo { padding:28px 24px 20px; border-bottom:1px solid var(--border); }
  .sidebar-logo h1 { font-family:'DM Serif Display',serif; font-size:20px; color:var(--gold); letter-spacing:.3px; }
  .sidebar-logo span { font-size:10px; color:var(--text3); letter-spacing:2px; text-transform:uppercase; display:block; margin-top:2px; }
  .nav { flex:1; padding:16px 0; }
  .nav-item { display:flex; align-items:center; gap:10px; padding:10px 20px; cursor:pointer; font-size:13px; font-weight:500; color:var(--text2); border-left:2px solid transparent; transition:all .15s; }
  .nav-item:hover { color:var(--text); background:var(--surface2); }
  .nav-item.active { color:var(--gold); border-left-color:var(--gold); background:var(--gold-dim); }
  .nav-icon { font-size:15px; width:18px; text-align:center; }
  .nav-badge { margin-left:auto; background:var(--red); color:#fff; border-radius:10px; padding:1px 6px; font-size:10px; }
  .main { margin-left:220px; flex:1; padding:32px; max-width:1100px; }
  .page-title { font-family:'DM Serif Display',serif; font-size:28px; color:var(--text); margin-bottom:4px; }
  .page-sub { font-size:13px; color:var(--text3); margin-bottom:28px; }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:20px; }
  .card-title { font-size:11px; text-transform:uppercase; letter-spacing:2px; color:var(--text3); margin-bottom:12px; font-weight:500; }
  .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  .grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; }
  .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .stat-card { background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:18px 20px; }
  .stat-label { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); margin-bottom:8px; }
  .stat-value { font-family:'DM Mono',monospace; font-size:22px; font-weight:500; }
  .stat-sub { font-size:11px; color:var(--text3); margin-top:4px; }
  .gold { color:var(--gold2); }
  .green { color:var(--green); }
  .red { color:var(--red); }
  .blue { color:var(--blue); }
  .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-family:'Sora',sans-serif; font-size:13px; font-weight:500; transition:all .15s; }
  .btn-gold { background:var(--gold); color:#0d0f14; }
  .btn-gold:hover { background:var(--gold2); }
  .btn-outline { background:transparent; color:var(--text2); border:1px solid var(--border); }
  .btn-outline:hover { border-color:var(--gold); color:var(--gold); }
  .btn-danger { background:var(--red-dim); color:var(--red); border:1px solid transparent; }
  .btn-danger:hover { border-color:var(--red); }
  .btn-sm { padding:5px 10px; font-size:12px; }
  input, select, textarea { background:var(--surface2); border:1px solid var(--border); color:var(--text); border-radius:8px; padding:9px 12px; font-family:'Sora',sans-serif; font-size:13px; width:100%; outline:none; transition:border .15s; }
  input:focus, select:focus, textarea:focus { border-color:var(--gold); }
  select option { background:var(--surface2); }
  label { font-size:12px; color:var(--text2); display:block; margin-bottom:6px; }
  .form-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
  .form-row-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:12px; }
  .form-group { margin-bottom:12px; }
  .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.7); z-index:100; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
  .modal { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:28px; width:100%; max-width:520px; max-height:90vh; overflow-y:auto; }
  .modal-title { font-family:'DM Serif Display',serif; font-size:20px; margin-bottom:20px; color:var(--text); }
  .modal-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
  .table { width:100%; border-collapse:collapse; }
  .table th { font-size:11px; text-transform:uppercase; letter-spacing:1.5px; color:var(--text3); padding:10px 14px; text-align:left; border-bottom:1px solid var(--border); }
  .table td { padding:12px 14px; font-size:13px; border-bottom:1px solid rgba(255,255,255,.04); }
  .table tr:last-child td { border-bottom:none; }
  .table tr:hover td { background:var(--surface2); }
  .badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:500; }
  .badge-green { background:var(--green-dim); color:var(--green); }
  .badge-red { background:var(--red-dim); color:var(--red); }
  .badge-gold { background:var(--gold-dim); color:var(--gold2); }
  .badge-blue { background:var(--blue-dim); color:var(--blue); }
  .alert-box { background:var(--red-dim); border:1px solid rgba(224,92,92,.3); border-radius:10px; padding:12px 16px; display:flex; align-items:center; gap:10px; margin-bottom:16px; font-size:13px; }
  .section-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }
  .month-selector { display:flex; align-items:center; gap:8px; }
  .month-selector select { width:auto; }
  .tag { display:inline-block; padding:2px 8px; border-radius:6px; font-size:11px; background:var(--surface3); color:var(--text2); }
  .empty-state { text-align:center; padding:40px; color:var(--text3); font-size:13px; }
  .divider { border:none; border-top:1px solid var(--border); margin:20px 0; }
  .chip { display:inline-flex; align-items:center; gap:5px; background:var(--surface3); border:1px solid var(--border); border-radius:20px; padding:4px 10px; font-size:12px; color:var(--text2); cursor:pointer; transition:all .15s; }
  .chip:hover, .chip.selected { background:var(--gold-dim); border-color:var(--gold); color:var(--gold2); }
  .progress-bar { height:6px; background:var(--surface3); border-radius:3px; overflow:hidden; margin-top:6px; }
  .progress-fill { height:100%; border-radius:3px; background:var(--gold); transition:width .3s; }
  @keyframes slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .animate-in { animation:slideIn .2s ease; }
`;
const styleEl = document.createElement("style");
styleEl.textContent = css;
document.head.appendChild(styleEl);

/* ─── HELPERS ─── */
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n || 0);
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("es-AR") : "-";
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const now = new Date();
const genId = () => Math.random().toString(36).slice(2, 9);

/* ─── SUB-PROPERTY HELPERS ─── */
const allSubProps = (properties) => {
  const list = [];
  (properties||[]).forEach(p => {
    (p.subProperties||[]).forEach(sp => {
      list.push({ ...sp, propertyId: p.id, propertyName: p.name, label: `${p.name} / ${sp.name}` });
    });
  });
  return list;
};

const findSubProp = (properties, subPropertyId) => {
  return allSubProps(properties).find(sp => sp.id === subPropertyId) || null;
};


/* ─── ÍNDICES (IPC / ICL) ─── */


/* ─── STORAGE (localStorage) ─── */
async function load(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
async function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}


const FREQ_OPTIONS = [
  { value: "1", label: "Mensual" },
  { value: "2", label: "Bimestral (cada 2 meses)" },
  { value: "3", label: "Trimestral (cada 3 meses)" },
  { value: "4", label: "Cuatrimestral (cada 4 meses)" },
  { value: "6", label: "Semestral (cada 6 meses)" },
  { value: "12", label: "Anual" },
];

const getNextUpdateDate = (startDate, freqMonths) => {
  if (!startDate || !freqMonths) return null;
  const d = new Date(startDate + "T12:00:00");
  d.setMonth(d.getMonth() + parseInt(freqMonths));
  return d;
};

const getDaysUntil = (date) => {
  if (!date) return null;
  const diff = date - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/* ─── INITIAL DATA ─── */
const INIT = {
  properties: [],
  contracts: [],      // {id, propertyId, amount, startDate, note}
  rentPayments: [],   // {id, propertyId, amount, date, month, year, notes}
  expenses: [],       // {id, propertyId, type, amount, date, month, year, description}
  businessIncome: [], // {id, amount, date, month, year, notes}
  pensionIncome: [],  // {id, amount, date, month, year, notes}
  allocations: [],    // {id, month, year, destination, amount, incomeType}
  destinations: [     // editable list
    {id:"d1", name:"Compra de dólares"},
    {id:"d2", name:"Fondo de inversión"},
    {id:"d3", name:"Fondo de emergencia"},
    {id:"d4", name:"Ahorro viaje"},
  ],
};

/* ════════════════════════════════════════════════════
   MODALS
════════════════════════════════════════════════════ */
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-in">
        <div className="modal-title">{title}</div>
        {children}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */
function Dashboard({ data, month, year }) {
  const rents = data.rentPayments.filter(r => r.month === month && r.year === year);
  const exps = data.expenses.filter(e => e.month === month && e.year === year);
  const biz = data.businessIncome.filter(b => b.month === month && b.year === year);
  const pension = (data.pensionIncome||[]).filter(b => b.month === month && b.year === year);
  const allocs = data.allocations.filter(a => a.month === month && a.year === year);

  const totalRents = rents.reduce((s, r) => s + (r.amount || 0), 0);
  const totalExp = exps.reduce((s, e) => s + (e.amount || 0), 0);
  const totalBiz = biz.reduce((s, b) => s + (b.amount || 0), 0);
  const totalPension = pension.reduce((s, b) => s + (b.amount || 0), 0);
  const totalAlloc = allocs.reduce((s, a) => s + (a.amount || 0), 0);
  const totalIncome = totalRents + totalBiz + totalPension;
  const net = totalIncome - totalExp;
  const unallocated = totalIncome - totalAlloc;

  // contract alerts - check sub-property contracts for upcoming updates
  const alerts = [];
  (data.properties||[]).forEach(p => {
    (p.subProperties||[]).forEach(sp => {
      const c = sp.contract;
      if (!c || !c.startDate || !c.updateFrequency) return;
      const nextDate = getNextUpdateDate(c.startDate, c.updateFrequency);
      const days = getDaysUntil(nextDate);
      if (days !== null && days <= 30) {
        alerts.push({ prop: p.name, unit: sp.name, days, date: nextDate, overdue: days < 0, titular: c.titular });
      }
    });
  });

  // expense breakdown
  const byType = {};
  exps.forEach(e => { byType[e.type] = (byType[e.type] || 0) + e.amount; });

  // allocations by destination
  const byDest = {};
  allocs.forEach(a => { byDest[a.destination] = (byDest[a.destination] || 0) + a.amount; });

  return (
    <div className="animate-in">
      <div className="page-title">Resumen</div>
      <div className="page-sub">{MONTHS[month - 1]} {year}</div>

      {alerts.map((a, i) => (
        <div key={i} className="alert-box">
          <span>{a.overdue ? "🔴" : "⏳"}</span>
          <span>
            <b>{a.prop} / {a.unit}</b>
            {a.titular ? ` (${a.titular})` : ""}
            {" — "}
            {a.overdue
              ? `Actualización de contrato vencida hace ${Math.abs(a.days)} días`
              : `Actualización de contrato en ${a.days} días (${a.date.toLocaleDateString("es-AR")})`}
          </span>
        </div>
      ))}

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:14,marginBottom:20}}>
        <div className="stat-card">
          <div className="stat-label">Alquileres cobrados</div>
          <div className="stat-value gold">{fmt(totalRents)}</div>
          <div className="stat-sub">{rents.length} pago{rents.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingresos negocio</div>
          <div className="stat-value green">{fmt(totalBiz)}</div>
          <div className="stat-sub">{biz.length} registro{biz.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jubilación / Pensión</div>
          <div className="stat-value blue">{fmt(totalPension)}</div>
          <div className="stat-sub">{pension.length} registro{pension.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Gastos totales</div>
          <div className="stat-value red">{fmt(totalExp)}</div>
          <div className="stat-sub">{exps.length} gasto{exps.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Resultado neto</div>
          <div className={`stat-value ${net >= 0 ? "green" : "red"}`}>{fmt(net)}</div>
          <div className="stat-sub">ingresos − gastos</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="card-title">Desglose de gastos</div>
          {Object.keys(byType).length === 0 ? <div className="empty-state">Sin gastos este mes</div> : (
            <table className="table">
              <thead><tr><th>Tipo</th><th>Monto</th></tr></thead>
              <tbody>
                {Object.entries(byType).map(([t,v]) => (
                  <tr key={t}><td><span className="tag">{t}</span></td><td style={{fontFamily:"DM Mono,monospace"}}>{fmt(v)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="card">
          <div className="card-title">Destinos del mes</div>
          {Object.keys(byDest).length === 0 ? <div className="empty-state">Sin asignaciones este mes</div> : (
            <>
              {Object.entries(byDest).map(([dest, val]) => (
                <div key={dest} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span>{dest}</span>
                    <span style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>{fmt(val)}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: totalIncome > 0 ? `${Math.min(100,(val/totalIncome)*100)}%` : "0%"}}/>
                  </div>
                </div>
              ))}
              <hr className="divider"/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text3)"}}>
                <span>Sin asignar</span>
                <span style={{fontFamily:"DM Mono,monospace", color: unallocated < 0 ? "var(--red)" : "var(--text2)"}}>{fmt(unallocated)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Propiedades activas</div>
        {data.properties.length === 0 ? <div className="empty-state">No hay propiedades cargadas</div> : (
          <table className="table">
            <thead><tr><th>Propiedad / Unidad</th><th>Cobrado este mes</th><th>Gastos este mes</th></tr></thead>
            <tbody>
              {data.properties.map(p => {
                const subs = p.subProperties||[];
                const subIds = subs.map(s=>s.id);
                const pRents = rents.filter(r => r.propertyId===p.id || subIds.includes(r.propertyId)).reduce((s,r)=>s+r.amount,0);
                const pExp = exps.filter(e => e.propertyId===p.id || subIds.includes(e.propertyId)).reduce((s,e)=>s+e.amount,0);
                return [
                  <tr key={p.id} style={{background:"var(--surface2)"}}>
                    <td colSpan={1}><b>{p.name}</b><span style={{fontSize:11,color:"var(--text3)",marginLeft:8}}>{p.address}</span></td>
                    <td style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>{pRents>0?fmt(pRents):<span style={{color:"var(--text3)"}}>—</span>}</td>
                    <td style={{fontFamily:"DM Mono,monospace",color:"var(--red)"}}>{pExp>0?fmt(pExp):<span style={{color:"var(--text3)"}}>—</span>}</td>
                  </tr>,
                  ...subs.map(sp => {
                    const spRents = rents.filter(r=>r.propertyId===sp.id).reduce((s,r)=>s+r.amount,0);
                    const spExp = exps.filter(e=>e.propertyId===sp.id).reduce((s,e)=>s+e.amount,0);
                    return (
                      <tr key={sp.id}>
                        <td style={{paddingLeft:28,fontSize:12}}>◈ {sp.name}</td>
                        <td style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--gold2)"}}>{spRents>0?fmt(spRents):<span style={{color:"var(--text3)"}}>—</span>}</td>
                        <td style={{fontFamily:"DM Mono,monospace",fontSize:12,color:"var(--red)"}}>{spExp>0?fmt(spExp):<span style={{color:"var(--text3)"}}>—</span>}</td>
                      </tr>
                    );
                  })
                ];
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════
   PROPIEDADES
════════════════════════════════════════════════════ */
const AJUSTE_OPTIONS = ["IPC", "ICL", "Otro"];
const emptyContract = { titular: "", initialAmount: "", updateFrequency: "3", ajuste: "IPC", startDate: "", endDate: "" };

function ContractForm({ contract, onChange }) {
  const c = contract || emptyContract;
  return (
    <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginTop:8}}>
      <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--gold)",marginBottom:12,fontWeight:500}}>Contrato</div>
      <div className="form-row">
        <div><label>Titular</label><input value={c.titular} onChange={e=>onChange({...c,titular:e.target.value})} placeholder="Nombre del inquilino"/></div>
        <div><label>Monto inicial</label><input type="number" value={c.initialAmount} onChange={e=>onChange({...c,initialAmount:e.target.value})} placeholder="150000"/></div>
      </div>
      <div className="form-row">
        <div><label>Frecuencia de actualización</label>
          <select value={c.updateFrequency} onChange={e=>onChange({...c,updateFrequency:e.target.value})}>
            {FREQ_OPTIONS.map(f=><option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>
        <div><label>Ajuste</label>
          <select value={c.ajuste} onChange={e=>onChange({...c,ajuste:e.target.value})}>
            {AJUSTE_OPTIONS.map(a=><option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row" style={{marginBottom:0}}>
        <div><label>Fecha de inicio</label><input type="date" value={c.startDate} onChange={e=>onChange({...c,startDate:e.target.value})}/></div>
        <div><label>Fecha de vencimiento</label><input type="date" value={c.endDate||""} onChange={e=>onChange({...c,endDate:e.target.value})}/></div>
      </div>
    </div>
  );
}

function ContractBadges({ contract }) {
  if (!contract || !contract.startDate) return null;
  const nextDate = getNextUpdateDate(contract.startDate, contract.updateFrequency || "3");
  const days = getDaysUntil(nextDate);
  const isOverdue = days !== null && days < 0;
  const isSoon = days !== null && days >= 0 && days <= 30;
  return (
    <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
      {isOverdue && <span className="badge badge-red">⏰ Actualización vencida</span>}
      {isSoon && !isOverdue && <span className="badge badge-gold">⏳ Actualizar pronto</span>}
      {nextDate && !isOverdue && !isSoon && (
        <span style={{fontSize:11,color:"var(--text3)"}}>Próx. actualización: {nextDate.toLocaleDateString("es-AR")}</span>
      )}
      {isOverdue && (
        <span style={{fontSize:11,color:"var(--red)"}}>Venció hace {Math.abs(days)} días</span>
      )}
    </div>
  );
}


function RentCalcModal({ contract, propName, subName, onClose, onApply }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [result, setResult]   = useState(null);
  // referenceDate: the date FROM which we calculate (lastUpdateDate or startDate)
  const lastUpdate = contract.lastUpdateDate || contract.startDate;
  const today = new Date().toISOString().split("T")[0];
  const currentAmount = contract.currentAmount || contract.initialAmount;

  const calculate = async () => {
    setLoading(true); setError(""); setResult(null);
    try {
      if (contract.ajuste === "Otro") throw new Error("Ajuste manual — ingresá el porcentaje a mano");
      const rate = contract.ajuste === "IPC" ? "ipc" : "icl";
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialRent: parseFloat(currentAmount), startDate: lastUpdate, adjustmentDate: today, rate }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error al calcular");
      setResult({
        pct: json.pct,
        newAmount: json.newRent,
        variacion: json.ratio - 1,
        startIndex: json.startIndex,
        currentIndex: json.currentIndex,
        rate: json.rate,
      });
    } catch(e) {
      setError(e.message || "Error al obtener los índices");
    }
    setLoading(false);
  };

  return (
    <Modal title={`Calcular actualización — ${propName} / ${subName}`} onClose={onClose}>
      <div style={{background:"var(--surface2)",borderRadius:10,padding:14,marginBottom:16}}>
        <div style={{display:"flex",flexWrap:"wrap",gap:14,fontSize:13,color:"var(--text2)"}}>
          <span>👤 {contract.titular}</span>
          <span style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>
            Alquiler actual: {fmt(parseFloat(currentAmount||0))}
          </span>
          <span>📊 Ajuste: <b>{contract.ajuste}</b></span>
          <span>📅 Desde: {fmtDate(lastUpdate)}</span>
        </div>
      </div>

      {!result && !loading && (
        <div style={{fontSize:12,color:"var(--text3)",marginBottom:14,lineHeight:1.7}}>
          Se va a buscar el índice <b>{contract.ajuste}</b> desde <b>{fmtDate(lastUpdate)}</b> hasta hoy
          y calcular el nuevo monto multiplicando el alquiler actual por la variación acumulada.
          <br/>Fuente: <span style={{color:"var(--text2)"}}>ARquiler.com vía RapidAPI</span>
        </div>
      )}

      {loading && (
        <div style={{textAlign:"center",padding:"24px 0",color:"var(--text3)",fontSize:13}}>
          ⏳ Buscando datos del {contract.ajuste}...
        </div>
      )}

      {error && (
        <div style={{background:"var(--red-dim)",border:"1px solid rgba(224,92,92,.3)",borderRadius:8,padding:"10px 14px",fontSize:13,color:"var(--red)",marginBottom:14}}>
          {error}
        </div>
      )}

      {result && (
        <div style={{marginBottom:16}}>
          <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:14,marginBottom:12}}>
            <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--text3)",marginBottom:10}}>Detalle del cálculo — {result.rate?.toUpperCase()}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Índice al inicio</div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:13}}>{result.startIndex?.value?.toLocaleString("es-AR",{maximumFractionDigits:4})}</div>
                <div style={{fontSize:10,color:"var(--text3)"}}>{fmtDate(result.startIndex?.date)}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Índice actual</div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:13}}>{result.currentIndex?.value?.toLocaleString("es-AR",{maximumFractionDigits:4})}</div>
                <div style={{fontSize:10,color:"var(--text3)"}}>{fmtDate(result.currentIndex?.date)}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Ratio</div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:13,color:"var(--gold2)"}}>{(1 + result.variacion).toFixed(6)}</div>
              </div>
              <div>
                <div style={{fontSize:11,color:"var(--text3)"}}>Variación</div>
                <div style={{fontFamily:"DM Mono,monospace",fontSize:14,color:"var(--gold2)"}}>+{result.pct}%</div>
              </div>
            </div>
          </div>
          <div style={{background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,.35)",borderRadius:10,padding:16,textAlign:"center"}}>
            <div style={{fontSize:11,color:"var(--gold)",textTransform:"uppercase",letterSpacing:"1.5px",marginBottom:6}}>Nuevo monto</div>
            <div style={{fontFamily:"DM Serif Display,serif",fontSize:32,color:"var(--gold2)"}}>{fmt(result.newAmount)}</div>
            <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>
              {fmt(parseFloat(currentAmount||0))} × {(1+result.variacion).toFixed(4)} = {fmt(result.newAmount)}
            </div>
          </div>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
        {!result && !loading && (
          <button className="btn btn-gold" onClick={calculate}>
            {contract.ajuste === "Otro" ? "Ver cálculo manual" : `Traer ${contract.ajuste} y calcular`}
          </button>
        )}
        {result && (
          <button className="btn btn-gold" onClick={() => onApply(result.newAmount)}>
            ✓ Aplicar nuevo monto
          </button>
        )}
        {result && (
          <button className="btn btn-outline" onClick={calculate}>↺ Recalcular</button>
        )}
      </div>
    </Modal>
  );
}

function Propiedades({ data, setData }) {
  const [showPropForm, setShowPropForm] = useState(false);
  const [editingProp, setEditingProp] = useState(null);
  const [contractModal, setContractModal] = useState(null); // {propId, subId}
  const [contractDraft, setContractDraft] = useState(emptyContract);
  const [calcModal, setCalcModal] = useState(null); // {propId, subId}
  const emptyForm = { name: "", address: "", subPropInput: "", subProperties: [] };
  const [propForm, setPropForm] = useState(emptyForm);

  const addSubProp = () => {
    const name = propForm.subPropInput.trim();
    if (!name) return;
    setPropForm({ ...propForm, subPropInput: "", subProperties: [...propForm.subProperties, { id: genId(), name, contract: null }] });
  };

  const removeSubProp = (id) => {
    setPropForm({ ...propForm, subProperties: propForm.subProperties.filter(sp => sp.id !== id) });
  };

  const saveProperty = () => {
    if (!propForm.name) return;
    const { subPropInput, ...rest } = propForm;
    if (editingProp) {
      const updated = { ...data, properties: data.properties.map(p => p.id === editingProp ? { ...p, ...rest } : p) };
      setData(updated); save("propmanager", updated);
    } else {
      const updated = { ...data, properties: [...data.properties, { id: genId(), ...rest }] };
      setData(updated); save("propmanager", updated);
    }
    setPropForm(emptyForm); setShowPropForm(false); setEditingProp(null);
  };

  const startEdit = (p) => {
    setPropForm({ name: p.name, address: p.address||"", subPropInput: "", subProperties: p.subProperties||[] });
    setEditingProp(p.id); setShowPropForm(true);
  };

  const deleteProperty = (id) => {
    const updated = { ...data, properties: data.properties.filter(p => p.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  const openContractModal = (propId, subId, existingContract) => {
    setContractDraft(existingContract ? {...existingContract} : {...emptyContract});
    setContractModal({ propId, subId });
  };

  const saveContract = () => {
    const { propId, subId } = contractModal;
    const updated = {
      ...data,
      properties: data.properties.map(p => p.id !== propId ? p : {
        ...p,
        subProperties: (p.subProperties||[]).map(sp => sp.id !== subId ? sp : { ...sp, contract: contractDraft })
      })
    };
    setData(updated); save("propmanager", updated);
    setContractModal(null);
  };

  const deleteContract = (propId, subId) => {
    const updated = {
      ...data,
      properties: data.properties.map(p => p.id !== propId ? p : {
        ...p,
        subProperties: (p.subProperties||[]).map(sp => sp.id !== subId ? sp : { ...sp, contract: null })
      })
    };
    setData(updated); save("propmanager", updated);
  };

  const applyNewAmount = (propId, subId, newAmount) => {
    const today = new Date().toISOString().split("T")[0];
    const updated = {
      ...data,
      properties: data.properties.map(p => p.id !== propId ? p : {
        ...p,
        subProperties: (p.subProperties||[]).map(sp => {
          if (sp.id !== subId) return sp;
          const freqMonths = sp.contract.updateFrequency || "3";
          const lastUpdate = sp.contract.lastUpdateDate || sp.contract.startDate;
          const nextStart  = getNextUpdateDate(lastUpdate, freqMonths);
          return { ...sp, contract: { ...sp.contract, currentAmount: newAmount, lastUpdateDate: nextStart ? nextStart.toISOString().split("T")[0] : today } };
        })
      })
    };
    setData(updated); save("propmanager", updated);
    setCalcModal(null);
  };

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <div className="page-title">Propiedades</div>
          <div className="page-sub">Gestioná tus propiedades y contratos de alquiler</div>
        </div>
        <button className="btn btn-gold" onClick={() => { setPropForm(emptyForm); setEditingProp(null); setShowPropForm(true); }}>+ Nueva propiedad</button>
      </div>

      {data.properties.length === 0 ? (
        <div className="card"><div className="empty-state">No hay propiedades. Agregá una para comenzar.</div></div>
      ) : data.properties.map(p => {
        const subs = p.subProperties || [];
        return (
          <div key={p.id} className="card" style={{marginBottom:16}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:subs.length>0?16:0}}>
              <div>
                <div style={{fontSize:17,fontWeight:600}}>{p.name}</div>
                <div style={{fontSize:12,color:"var(--text3)",marginTop:2}}>{p.address}</div>
                <div style={{fontSize:11,color:"var(--text3)",marginTop:3}}>
                  {subs.length === 0 ? "Sin unidades" : `${subs.length} unidad${subs.length!==1?"es":""}`}
                </div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="btn btn-outline btn-sm" onClick={() => startEdit(p)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => deleteProperty(p.id)}>Eliminar</button>
              </div>
            </div>

            {subs.length > 0 && (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {subs.map(sp => {
                  const c = sp.contract;
                  const hasContract = c && c.startDate;
                  return (
                    <div key={sp.id} style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,display:"flex",alignItems:"center",gap:6}}>
                            <span style={{color:"var(--gold)",fontSize:12}}>◈</span> {sp.name}
                          </div>
                          {hasContract && (
                            <div style={{marginTop:6,display:"flex",flexWrap:"wrap",gap:14,fontSize:12,color:"var(--text2)"}}>
                              <span>👤 {c.titular || "Sin titular"}</span>
                              <span style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>
                                {c.currentAmount && c.currentAmount !== c.initialAmount
                                  ? <>{fmt(parseFloat(c.currentAmount))} <span style={{fontSize:10,color:"var(--text3)",textDecoration:"line-through"}}>{fmt(parseFloat(c.initialAmount||0))}</span></>
                                  : fmt(parseFloat(c.initialAmount||0))}
                              </span>
                              <span>🔄 {FREQ_OPTIONS.find(f=>f.value===c.updateFrequency)?.label || c.updateFrequency}</span>
                              <span>📊 {c.ajuste}</span>
                              <span>📅 Desde {fmtDate(c.startDate)}</span>
                            </div>
                          )}
                          {hasContract && <ContractBadges contract={c}/>}
                          {!hasContract && <div style={{fontSize:11,color:"var(--text3)",marginTop:4}}>Sin contrato cargado</div>}
                        </div>
                        <div style={{display:"flex",gap:6,flexShrink:0,marginLeft:12,flexWrap:"wrap",justifyContent:"flex-end"}}>
                          {hasContract && c.ajuste !== "Otro" && (
                            <button className="btn btn-sm" style={{background:"var(--gold-dim)",color:"var(--gold2)",border:"1px solid rgba(201,168,76,.3)"}}
                              onClick={() => setCalcModal({propId:p.id, subId:sp.id})}>
                              📈 Calcular actualización
                            </button>
                          )}
                          <button className="btn btn-outline btn-sm" onClick={() => openContractModal(p.id, sp.id, sp.contract)}>
                            {hasContract ? "Editar contrato" : "+ Contrato"}
                          </button>
                          {hasContract && <button className="btn btn-danger btn-sm" onClick={() => deleteContract(p.id, sp.id)}>×</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Property form modal */}
      {showPropForm && (
        <Modal title={editingProp ? "Editar propiedad" : "Nueva propiedad"} onClose={() => { setShowPropForm(false); setEditingProp(null); setPropForm(emptyForm); }}>
          <div className="form-group"><label>Nombre de la propiedad</label><input value={propForm.name} onChange={e => setPropForm({...propForm, name: e.target.value})} placeholder="Ej: Edificio Mitre, Casa Alberdi"/></div>
          <div className="form-group"><label>Dirección</label><input value={propForm.address} onChange={e => setPropForm({...propForm, address: e.target.value})} placeholder="Calle 123, Córdoba"/></div>
          <hr className="divider"/>
          <div className="form-group">
            <label>Unidades / Subpropiedades</label>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={propForm.subPropInput} onChange={e => setPropForm({...propForm, subPropInput: e.target.value})}
                onKeyDown={e => e.key==="Enter" && addSubProp()}
                placeholder="Ej: Dpto 1A, Local 2, Cochera 3..."/>
              <button className="btn btn-outline" style={{whiteSpace:"nowrap"}} onClick={addSubProp}>+ Agregar</button>
            </div>
            {propForm.subProperties.length === 0 ? (
              <div style={{fontSize:12,color:"var(--text3)",padding:"8px 0"}}>Sin unidades todavía.</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {propForm.subProperties.map(sp => (
                  <div key={sp.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--surface2)",borderRadius:8,padding:"8px 12px"}}>
                    <span style={{fontSize:13}}>◈ {sp.name}</span>
                    <button className="btn btn-danger btn-sm" onClick={() => removeSubProp(sp.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => { setShowPropForm(false); setEditingProp(null); setPropForm(emptyForm); }}>Cancelar</button>
            <button className="btn btn-gold" onClick={saveProperty}>Guardar</button>
          </div>
        </Modal>
      )}

      {/* Rent calc modal */}
      {calcModal && (() => {
        const prop = data.properties.find(p=>p.id===calcModal.propId);
        const sub  = (prop?.subProperties||[]).find(s=>s.id===calcModal.subId);
        if (!sub?.contract) return null;
        return <RentCalcModal
          contract={sub.contract}
          propName={prop.name}
          subName={sub.name}
          onClose={() => setCalcModal(null)}
          onApply={(amt) => applyNewAmount(calcModal.propId, calcModal.subId, amt)}
        />;
      })()}

      {/* Contract modal */}
      {contractModal && (() => {
        const prop = data.properties.find(p=>p.id===contractModal.propId);
        const sub = (prop?.subProperties||[]).find(s=>s.id===contractModal.subId);
        return (
          <Modal title={`Contrato — ${prop?.name} / ${sub?.name}`} onClose={() => setContractModal(null)}>
            <ContractForm contract={contractDraft} onChange={setContractDraft}/>
            <div className="modal-actions" style={{marginTop:20}}>
              <button className="btn btn-outline" onClick={() => setContractModal(null)}>Cancelar</button>
              <button className="btn btn-gold" onClick={saveContract}>Guardar contrato</button>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   INGRESOS (alquileres cobrados)
════════════════════════════════════════════════════ */
function Ingresos({ data, setData, month, year }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ propertyId: "", amount: "", date: "", notes: "" });

  const payments = data.rentPayments.filter(r => r.month === month && r.year === year)
    .sort((a,b) => new Date(b.date) - new Date(a.date));

  const add = () => {
    if (!form.propertyId || !form.amount || !form.date) return;
    const r = { id: genId(), ...form, amount: parseFloat(form.amount), month, year };
    const updated = { ...data, rentPayments: [...data.rentPayments, r] };
    setData(updated); save("propmanager", updated);
    setForm({ propertyId: "", amount: "", date: "", notes: "" }); setShowForm(false);
  };

  const del = (id) => {
    const updated = { ...data, rentPayments: data.rentPayments.filter(r => r.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  const total = payments.reduce((s,r) => s + r.amount, 0);

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <div className="page-title">Alquileres cobrados</div>
          <div className="page-sub">{MONTHS[month-1]} {year} · Total: <span style={{color:"var(--gold2)",fontFamily:"DM Mono,monospace"}}>{fmt(total)}</span></div>
        </div>
        <button className="btn btn-gold" onClick={() => setShowForm(true)}>+ Registrar cobro</button>
      </div>

      <div className="card">
        {payments.length === 0 ? <div className="empty-state">Sin cobros registrados este mes</div> : (
          <table className="table">
            <thead><tr><th>Propiedad</th><th>Fecha</th><th>Monto</th><th>Notas</th><th></th></tr></thead>
            <tbody>
              {payments.map(r => {
                return (
                  <tr key={r.id}>
                    <td>
                      {(() => {
                        const sp = findSubProp(data.properties, r.propertyId);
                        const prop2 = data.properties.find(p => p.id === r.propertyId);
                        if (sp) return <><span style={{fontSize:11,color:"var(--text3)"}}>{sp.propertyName}</span><br/><b>{sp.name}</b></>;
                        return <b>{prop2?.name || "—"}</b>;
                      })()}
                    </td>
                    <td style={{fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtDate(r.date)}</td>
                    <td style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>{fmt(r.amount)}</td>
                    <td style={{fontSize:12,color:"var(--text3)"}}>{r.notes || "—"}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => del(r.id)}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Registrar cobro de alquiler" onClose={() => setShowForm(false)}>
          <div className="form-row">
            <div><label>Unidad / Propiedad</label>
              <select value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}>
                <option value="">Seleccionar...</option>
                {data.properties.map(p => {
                  const subs = p.subProperties||[];
                  if (subs.length === 0) return <option key={p.id} value={p.id}>{p.name}</option>;
                  return <optgroup key={p.id} label={p.name}>
                    {subs.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                  </optgroup>;
                })}
              </select>
            </div>
            <div><label>Fecha de cobro</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/></div>
          </div>
          <div className="form-group"><label>Monto cobrado</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="150000"/></div>
          <div className="form-group"><label>Notas (opcional)</label><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Transferencia, efectivo, etc."/></div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={add}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   GASTOS
════════════════════════════════════════════════════ */
const EXPENSE_TYPES = {
  Propiedad: ["Mantenimiento", "Expensas", "Impuestos", "Otros"],
  Personal:  ["Alimentación", "Salud", "Transporte", "Servicios", "Entretenimiento", "Ropa", "Otros"],
  Negocio:   ["Insumos", "Servicios/Software", "Marketing", "Empleados", "Impuestos", "Equipamiento", "Otros"],
};
const CATEGORY_COLORS = { Propiedad: "badge-blue", Personal: "badge-gold", Negocio: "badge-green" };

function Gastos({ data, setData, month, year }) {
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState("Todos");
  const [aiMode, setAiMode] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [form, setForm] = useState({ category: "Propiedad", propertyId: "", type: "Mantenimiento", amount: "", date: "", description: "" });

  const allExpenses = data.expenses.filter(e => e.month === month && e.year === year)
    .sort((a,b) => new Date(b.date) - new Date(a.date));
  const expenses = filterCat === "Todos" ? allExpenses : allExpenses.filter(e => (e.category || "Propiedad") === filterCat);

  const resetForm = () => setForm({ category: "Propiedad", propertyId: "", type: "Mantenimiento", amount: "", date: "", description: "" });

  const openForm = () => { resetForm(); setAiText(""); setAiError(""); setAiMode(false); setShowForm(true); };

  const add = () => {
    if (!form.amount || !form.date) return;
    if (form.category === "Propiedad" && !form.propertyId) return;
    const e = { id: genId(), ...form, amount: parseFloat(form.amount), month, year };
    const updated = { ...data, expenses: [...data.expenses, e] };
    setData(updated); save("propmanager", updated);
    resetForm(); setShowForm(false);
  };

  const del = (id) => {
    const updated = { ...data, expenses: data.expenses.filter(e => e.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  const parseWithAI = async () => {
    if (!aiText.trim()) return;
    setAiLoading(true); setAiError("");
    const today = new Date().toISOString().split("T")[0];
    const propList = allSubProps(data.properties).map(sp => `id="${sp.id}" nombre="${sp.label}"`).join(", ") || data.properties.map(p=>`id="${p.id}" nombre="${p.name}"`).join(", ");
    const allTypes = Object.entries(EXPENSE_TYPES).map(([cat, types]) => `${cat}: [${types.join(", ")}]`).join(" | ");
    const systemPrompt = `Sos un asistente que extrae datos de gastos de texto libre en español argentino.
Hoy es ${today}. El mes de contexto es ${month}/${year}.
Propiedades disponibles: ${propList || "ninguna"}.
Categorías y tipos válidos: ${allTypes}.
Devolvé SOLO un JSON sin markdown con estos campos:
{
  "category": "Propiedad" | "Personal" | "Negocio",
  "propertyId": "<id de la propiedad si category=Propiedad, sino null>",
  "type": "<tipo de gasto válido para esa categoría>",
  "amount": <número sin puntos ni comas, solo dígitos>,
  "date": "<fecha en formato YYYY-MM-DD, si no se menciona usa ${today}>",
  "description": "<descripción corta del gasto>"
}
Si el monto viene como "50 mil" interpretalo como 50000. Si dice "el 15" sin mes/año, asumí ${month}/${year}.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{ role: "user", content: aiText }]
        })
      });
      const json = await res.json();
      const text = json.content?.map(b => b.text || "").join("").trim();
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setForm({
        category: parsed.category || "Propiedad",
        propertyId: parsed.propertyId || "",
        type: parsed.type || "Otros",
        amount: parsed.amount?.toString() || "",
        date: parsed.date || today,
        description: parsed.description || "",
      });
      setAiMode(false);
    } catch(err) {
      setAiError("No pude interpretar el texto. Revisá que esté claro y volvé a intentar.");
    }
    setAiLoading(false);
  };

  const total = allExpenses.reduce((s,e) => s + e.amount, 0);
  const totBycat = {};
  allExpenses.forEach(e => { const c = e.category || "Propiedad"; totBycat[c] = (totBycat[c]||0) + e.amount; });
  const typeColors = { Mantenimiento:"badge-blue", Expensas:"badge-gold", Impuestos:"badge-red", Otros:"badge-green" };

  return (
    <div className="animate-in">
      <div className="section-header">
        <div>
          <div className="page-title">Gastos</div>
          <div className="page-sub">{MONTHS[month-1]} {year} · Total: <span style={{color:"var(--red)",fontFamily:"DM Mono,monospace"}}>{fmt(total)}</span></div>
        </div>
        <button className="btn btn-gold" onClick={openForm}>+ Registrar gasto</button>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
        {["Todos","Propiedad","Personal","Negocio"].map(c => (
          <span key={c} className={`chip ${filterCat===c?"selected":""}`} onClick={()=>setFilterCat(c)}>
            {c}{c!=="Todos" && totBycat[c] ? ` · ${fmt(totBycat[c])}` : ""}
          </span>
        ))}
      </div>
      <div className="card">
        {expenses.length === 0 ? <div className="empty-state">Sin gastos registrados{filterCat!=="Todos"?` en "${filterCat}"`:""} este mes</div> : (
          <table className="table">
            <thead><tr><th>Categoría / Origen</th><th>Tipo</th><th>Fecha</th><th>Monto</th><th>Descripción</th><th></th></tr></thead>
            <tbody>
              {expenses.map(e => {
                const cat = e.category || "Propiedad";
                const prop = data.properties.find(p => p.id === e.propertyId);
                return (
                  <tr key={e.id}>
                    <td>
                      <span className={`badge ${CATEGORY_COLORS[cat]||"badge-blue"}`}>{cat}</span>
                      {cat === "Propiedad" && (() => {
                        const sp = findSubProp(data.properties, e.propertyId);
                        const propDirect = data.properties.find(px => px.id === e.propertyId);
                        const label = sp ? `${sp.propertyName} / ${sp.name}` : (propDirect?.name||"—");
                        return <span style={{fontSize:12,color:"var(--text2)",marginLeft:6}}>{label}</span>;
                      })()}
                    </td>
                    <td><span className={`badge ${typeColors[e.type] || "badge-gold"}`} style={{background:"var(--surface3)",color:"var(--text2)"}}>{e.type}</span></td>
                    <td style={{fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtDate(e.date)}</td>
                    <td style={{fontFamily:"DM Mono,monospace",color:"var(--red)"}}>{fmt(e.amount)}</td>
                    <td style={{fontSize:12,color:"var(--text3)"}}>{e.description || "—"}</td>
                    <td><button className="btn btn-danger btn-sm" onClick={() => del(e.id)}>×</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal title="Registrar gasto" onClose={() => setShowForm(false)}>
          {/* ── MODE TOGGLE ── */}
          <div style={{display:"flex",gap:8,marginBottom:18,background:"var(--surface2)",borderRadius:10,padding:4}}>
            <button onClick={()=>setAiMode(false)}
              style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:13,fontWeight:500,
                background: !aiMode ? "var(--surface3)" : "transparent",
                color: !aiMode ? "var(--text)" : "var(--text3)",transition:"all .15s"}}>
              ✏️ Manual
            </button>
            <button onClick={()=>setAiMode(true)}
              style={{flex:1,padding:"7px 0",borderRadius:7,border:"none",cursor:"pointer",fontFamily:"Sora,sans-serif",fontSize:13,fontWeight:500,
                background: aiMode ? "var(--gold-dim)" : "transparent",
                color: aiMode ? "var(--gold2)" : "var(--text3)",transition:"all .15s"}}>
              ✨ Con IA
            </button>
          </div>

          {aiMode ? (
            <div>
              <div style={{fontSize:12,color:"var(--text3)",marginBottom:10,lineHeight:1.6}}>
                Describí el gasto con tus palabras. Por ejemplo:<br/>
                <span style={{color:"var(--text2)"}}>
                  "Pagué 50 mil de expensas del dpto centro el 15"<br/>
                  "Compré insumos para el negocio por 80000 ayer"<br/>
                  "Médico personal 25k hoy"
                </span>
              </div>
              <div className="form-group">
                <textarea value={aiText} onChange={e=>setAiText(e.target.value)}
                  placeholder="Describí el gasto..."
                  style={{width:"100%",minHeight:90,resize:"vertical",background:"var(--surface2)",border:"1px solid var(--border)",
                    color:"var(--text)",borderRadius:8,padding:"10px 12px",fontFamily:"Sora,sans-serif",fontSize:13,outline:"none"}}
                  onKeyDown={e => { if(e.key==="Enter" && e.metaKey) parseWithAI(); }}
                />
              </div>
              {aiError && <div style={{fontSize:12,color:"var(--red)",marginBottom:10,padding:"8px 12px",background:"var(--red-dim)",borderRadius:8}}>{aiError}</div>}
              <div className="modal-actions" style={{marginTop:4}}>
                <button className="btn btn-outline" onClick={()=>setShowForm(false)}>Cancelar</button>
                <button className="btn btn-gold" onClick={parseWithAI} disabled={aiLoading}
                  style={{opacity:aiLoading?.6:1,cursor:aiLoading?"wait":"pointer"}}>
                  {aiLoading ? "⏳ Procesando..." : "✨ Interpretar"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {form.amount && (
                <div style={{background:"var(--gold-dim)",border:"1px solid rgba(201,168,76,.3)",borderRadius:8,padding:"8px 12px",fontSize:12,color:"var(--gold2)",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
                  ✨ Completado por IA — revisá y ajustá si es necesario
                </div>
              )}
              <div className="form-group">
                <label>Categoría</label>
                <div style={{display:"flex",gap:8,marginTop:4}}>
                  {["Propiedad","Personal","Negocio"].map(c => (
                    <span key={c} className={`chip ${form.category===c?"selected":""}`}
                      onClick={() => setForm({...form, category:c, propertyId:"", type: EXPENSE_TYPES[c][0]})}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div className="form-row">
                {form.category === "Propiedad" ? (
                  <div><label>Unidad / Propiedad</label>
                    <select value={form.propertyId} onChange={e => setForm({...form, propertyId: e.target.value})}>
                      <option value="">Seleccionar...</option>
                      {data.properties.map(p => {
                        const subs = p.subProperties||[];
                        if (subs.length === 0) return <option key={p.id} value={p.id}>{p.name}</option>;
                        return <optgroup key={p.id} label={p.name}>
                          {subs.map(sp => <option key={sp.id} value={sp.id}>{sp.name}</option>)}
                        </optgroup>;
                      })}
                    </select>
                  </div>
                ) : (
                  <div><label>Origen</label>
                    <div style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"9px 12px",fontSize:13,color:"var(--text2)"}}>{form.category}</div>
                  </div>
                )}
                <div><label>Tipo de gasto</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {(EXPENSE_TYPES[form.category]||EXPENSE_TYPES.Propiedad).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div><label>Monto</label><input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="50000"/></div>
                <div><label>Fecha</label><input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})}/></div>
              </div>
              <div className="form-group"><label>Descripción</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripción del gasto..."/></div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={()=>{resetForm();setAiMode(true);}}>← Volver a IA</button>
                <button className="btn btn-gold" onClick={add}>Guardar</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   NEGOCIO
════════════════════════════════════════════════════ */
function Negocio({ data, setData, month, year }) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showAllocForm, setShowAllocForm] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ amount: "", date: "", notes: "" });
  const [allocForm, setAllocForm] = useState({ destination: "", amount: "", incomeType: "Negocio" });

  const incomes = data.businessIncome.filter(b => b.month === month && b.year === year);
  const pensionIncomes = (data.pensionIncome||[]).filter(b => b.month === month && b.year === year);
  const allocs = data.allocations.filter(a => a.month === month && a.year === year);
  const rentPayments = data.rentPayments.filter(r => r.month === month && r.year === year);

  const totalIncome = incomes.reduce((s,b) => s + b.amount, 0);
  const totalPensionInc = pensionIncomes.reduce((s,b) => s + b.amount, 0);
  const totalRents = rentPayments.reduce((s,r) => s + r.amount, 0);
  const totalAllIncome = totalIncome + totalRents + totalPensionInc;
  const totalAlloc = allocs.reduce((s,a) => s + a.amount, 0);
  const remaining = totalAllIncome - totalAlloc;

  const addIncome = () => {
    if (!incomeForm.amount || !incomeForm.date) return;
    const b = { id: genId(), ...incomeForm, amount: parseFloat(incomeForm.amount), month, year };
    const updated = { ...data, businessIncome: [...data.businessIncome, b] };
    setData(updated); save("propmanager", updated);
    setIncomeForm({ amount: "", date: "", notes: "" }); setShowIncomeForm(false);
  };

  const [showPensionForm, setShowPensionForm] = useState(false);
  const [pensionForm, setPensionForm] = useState({ amount: "", date: "", notes: "" });

  const addPensionIncome = () => {
    if (!pensionForm.amount || !pensionForm.date) return;
    const b = { id: genId(), ...pensionForm, amount: parseFloat(pensionForm.amount), month, year };
    const updated = { ...data, pensionIncome: [...(data.pensionIncome||[]), b] };
    setData(updated); save("propmanager", updated);
    setPensionForm({ amount: "", date: "", notes: "" }); setShowPensionForm(false);
  };

  const delPensionIncome = (id) => {
    const updated = { ...data, pensionIncome: (data.pensionIncome||[]).filter(b => b.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  const addAlloc = () => {
    if (!allocForm.destination || !allocForm.amount) return;
    const a = { id: genId(), ...allocForm, amount: parseFloat(allocForm.amount), month, year };
    const updated = { ...data, allocations: [...data.allocations, a] };
    setData(updated); save("propmanager", updated);
    setAllocForm({ destination: "", amount: "", incomeType: "Negocio" }); setShowAllocForm(false);
  };

  const delIncome = (id) => {
    const updated = { ...data, businessIncome: data.businessIncome.filter(b => b.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  const delAlloc = (id) => {
    const updated = { ...data, allocations: data.allocations.filter(a => a.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  return (
    <div className="animate-in">
      <div className="page-title">Negocio & Destinos</div>
      <div className="page-sub">{MONTHS[month-1]} {year}</div>

      <div className="grid-3" style={{marginBottom:20}}>
        <div className="stat-card">
          <div className="stat-label">Ganancia negocio</div>
          <div className="stat-value green">{fmt(totalIncome)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Jubilación / Pensión</div>
          <div className="stat-value blue">{fmt(totalPensionInc)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Ingresos totales del mes</div>
          <div className="stat-value gold">{fmt(totalAllIncome)}</div>
          <div className="stat-sub">negocio + alquileres + jubilación</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sin asignar</div>
          <div className={`stat-value ${remaining < 0 ? "red" : remaining === 0 ? "green" : "blue"}`}>{fmt(remaining)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <div>
            <div className="section-header">
              <div className="card-title" style={{margin:0}}>Ganancias del negocio</div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowIncomeForm(true)}>+ Agregar</button>
            </div>
            <div className="card">
              {incomes.length === 0 ? <div className="empty-state">Sin ingresos registrados</div> : (
                <table className="table">
                  <thead><tr><th>Fecha</th><th>Monto</th><th>Notas</th><th></th></tr></thead>
                  <tbody>
                    {incomes.map(b => (
                      <tr key={b.id}>
                        <td style={{fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtDate(b.date)}</td>
                        <td style={{fontFamily:"DM Mono,monospace",color:"var(--green)"}}>{fmt(b.amount)}</td>
                        <td style={{fontSize:12,color:"var(--text3)"}}>{b.notes || "—"}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => delIncome(b.id)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          <div>
            <div className="section-header">
              <div className="card-title" style={{margin:0}}>Jubilación / Pensión</div>
              <button className="btn btn-outline btn-sm" onClick={() => setShowPensionForm(true)}>+ Agregar</button>
            </div>
            <div className="card">
              {pensionIncomes.length === 0 ? <div className="empty-state">Sin cobros registrados</div> : (
                <table className="table">
                  <thead><tr><th>Fecha</th><th>Monto</th><th>Notas</th><th></th></tr></thead>
                  <tbody>
                    {pensionIncomes.map(b => (
                      <tr key={b.id}>
                        <td style={{fontFamily:"DM Mono,monospace",fontSize:12}}>{fmtDate(b.date)}</td>
                        <td style={{fontFamily:"DM Mono,monospace",color:"var(--blue)"}}>{fmt(b.amount)}</td>
                        <td style={{fontSize:12,color:"var(--text3)"}}>{b.notes || "—"}</td>
                        <td><button className="btn btn-danger btn-sm" onClick={() => delPensionIncome(b.id)}>×</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="section-header">
            <div className="card-title" style={{margin:0}}>Destinos del mes</div>
            <button className="btn btn-outline btn-sm" onClick={() => setShowAllocForm(true)}>+ Asignar</button>
          </div>
          <div className="card">
            {allocs.length === 0 ? <div className="empty-state">Sin asignaciones este mes</div> : (
              <table className="table">
                <thead><tr><th>Destino</th><th>Monto</th><th>Origen</th><th></th></tr></thead>
                <tbody>
                  {allocs.map(a => (
                    <tr key={a.id}>
                      <td><b>{a.destination}</b></td>
                      <td style={{fontFamily:"DM Mono,monospace",color:"var(--gold2)"}}>{fmt(a.amount)}</td>
                      <td><span className="tag">{a.incomeType}</span></td>
                      <td><button className="btn btn-danger btn-sm" onClick={() => delAlloc(a.id)}>×</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showIncomeForm && (
        <Modal title="Registrar ganancia del negocio" onClose={() => setShowIncomeForm(false)}>
          <div className="form-row">
            <div><label>Monto</label><input type="number" value={incomeForm.amount} onChange={e => setIncomeForm({...incomeForm, amount: e.target.value})} placeholder="500000"/></div>
            <div><label>Fecha</label><input type="date" value={incomeForm.date} onChange={e => setIncomeForm({...incomeForm, date: e.target.value})}/></div>
          </div>
          <div className="form-group"><label>Notas</label><input value={incomeForm.notes} onChange={e => setIncomeForm({...incomeForm, notes: e.target.value})} placeholder="Descripción opcional..."/></div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowIncomeForm(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={addIncome}>Guardar</button>
          </div>
        </Modal>
      )}

      {showPensionForm && (
        <Modal title="Registrar cobro de jubilación / pensión" onClose={() => setShowPensionForm(false)}>
          <div className="form-row">
            <div><label>Monto</label><input type="number" value={pensionForm.amount} onChange={e => setPensionForm({...pensionForm, amount: e.target.value})} placeholder="200000"/></div>
            <div><label>Fecha</label><input type="date" value={pensionForm.date} onChange={e => setPensionForm({...pensionForm, date: e.target.value})}/></div>
          </div>
          <div className="form-group"><label>Notas (opcional)</label><input value={pensionForm.notes} onChange={e => setPensionForm({...pensionForm, notes: e.target.value})} placeholder="Mes, concepto, etc."/></div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowPensionForm(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={addPensionIncome}>Guardar</button>
          </div>
        </Modal>
      )}

      {showAllocForm && (
        <Modal title="Asignar plata a destino" onClose={() => setShowAllocForm(false)}>
          <div className="form-group">
            <label>Destino</label>
            <select value={allocForm.destination} onChange={e => setAllocForm({...allocForm, destination: e.target.value})}>
              <option value="">Seleccionar...</option>
              {data.destinations.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div><label>Monto</label><input type="number" value={allocForm.amount} onChange={e => setAllocForm({...allocForm, amount: e.target.value})} placeholder="100000"/></div>
            <div><label>Origen</label>
              <select value={allocForm.incomeType} onChange={e => setAllocForm({...allocForm, incomeType: e.target.value})}>
                <option>Negocio</option>
                <option>Alquileres</option>
                <option>Jubilación</option>
                <option>General</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowAllocForm(false)}>Cancelar</button>
            <button className="btn btn-gold" onClick={addAlloc}>Guardar</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   DESTINOS (config)
════════════════════════════════════════════════════ */
function Destinos({ data, setData }) {
  const [form, setForm] = useState("");

  const add = () => {
    if (!form.trim()) return;
    const d = { id: genId(), name: form.trim() };
    const updated = { ...data, destinations: [...data.destinations, d] };
    setData(updated); save("propmanager", updated);
    setForm("");
  };

  const del = (id) => {
    const updated = { ...data, destinations: data.destinations.filter(d => d.id !== id) };
    setData(updated); save("propmanager", updated);
  };

  return (
    <div className="animate-in">
      <div className="page-title">Destinos</div>
      <div className="page-sub">Categorías para asignar los ingresos mensuales</div>

      <div className="card" style={{maxWidth:480}}>
        <div style={{display:"flex",gap:10,marginBottom:20}}>
          <input value={form} onChange={e => setForm(e.target.value)} onKeyDown={e => e.key==="Enter" && add()} placeholder="Ej: Compra de dólares"/>
          <button className="btn btn-gold" style={{whiteSpace:"nowrap"}} onClick={add}>+ Agregar</button>
        </div>
        {data.destinations.length === 0 ? <div className="empty-state">Sin destinos cargados</div> : (
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {data.destinations.map(d => (
              <div key={d.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--surface2)",borderRadius:8,padding:"10px 14px"}}>
                <span style={{fontSize:14}}>💰 {d.name}</span>
                <button className="btn btn-danger btn-sm" onClick={() => del(d.id)}>Eliminar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════
   SIDEBAR — WIDGET IPC / ICL
════════════════════════════════════════════════════ */
function SidebarIndices() {
  const [indices, setIndices] = useState(null); // { ipc: {m3, m6}, icl: {m3, m6} }
  const [loading, setLoading]   = useState(true);
  const [lastFetch, setLastFetch] = useState(null);
  const [error, setError]       = useState(false);

  const fetchAll = async () => {
    setLoading(true); setError(false); setIndices(null);
    try {
      const res = await fetch("/api/indices");
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!json.ipc && !json.icl) throw new Error("Sin datos");
      setIndices({
        ipc: json.ipc || null,
        icl: json.icl || null,
      });
      setLastFetch(new Date().toLocaleTimeString("es-AR", {hour:"2-digit",minute:"2-digit"}));
    } catch(e) {
      setError(true);
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const isValid = (v) => v !== null && v !== undefined && !isNaN(Number(v));

  const PctBox = ({ label, value }) => (
    <div style={{flex:1,background:"var(--surface3)",borderRadius:6,padding:"6px 8px",textAlign:"center"}}>
      <div style={{fontSize:9,color:"var(--text3)",marginBottom:3}}>{label}</div>
      <div style={{fontFamily:"DM Mono,monospace",fontSize:13,color: isValid(value) ? "var(--gold2)" : "var(--text3)",fontWeight:500}}>
        {isValid(value) ? `+${Number(value).toFixed(1)}%` : "—"}
      </div>
    </div>
  );

  const IndexRow = ({ label, data }) => (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",marginBottom:5}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--text3)",fontWeight:500}}>{label}</div>
        {data?.lastMonth && (
          <div style={{fontSize:9,color:"var(--text3)",fontStyle:"italic"}}>hasta {data.lastMonth}</div>
        )}
      </div>
      <div style={{display:"flex",gap:5}}>
        <PctBox label="3 meses" value={data?.m3}/>
        <PctBox label="6 meses" value={data?.m6}/>
      </div>
    </div>
  );

  return (
    <div style={{padding:"14px 16px",borderTop:"1px solid var(--border)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
        <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:"1.5px",color:"var(--text3)",fontWeight:500}}>Índices AR</div>
        <button onClick={fetchAll} disabled={loading} title="Actualizar"
          style={{background:"none",border:"none",cursor:loading?"default":"pointer",color:loading?"var(--text3)":"var(--gold)",fontSize:13,padding:0,lineHeight:1,transition:"color .15s"}}>
          {loading ? "⏳" : "↺"}
        </button>
      </div>

      {loading && (
        <div style={{fontSize:11,color:"var(--text3)",padding:"4px 0"}}>Buscando índices...</div>
      )}

      {error && !loading && (
        <div style={{fontSize:11,color:"var(--text3)",lineHeight:1.5}}>
          No disponible
          <div style={{marginTop:6}}>
            <button onClick={fetchAll}
              style={{fontSize:10,color:"var(--gold)",background:"var(--gold-dim)",border:"none",borderRadius:5,padding:"3px 8px",cursor:"pointer"}}>
              Reintentar
            </button>
          </div>
        </div>
      )}

      {indices && !loading && (
        <>
          <IndexRow label="IPC (INDEC)" data={indices.ipc}/>
          <IndexRow label="ICL (BCRA)"  data={indices.icl}/>
          {lastFetch && (
            <div style={{fontSize:9,color:"var(--text3)",marginTop:2}}>Actualizado {lastFetch}</div>
          )}
        </>
      )}
    </div>
  );
}


/* ════════════════════════════════════════════════════
   NOTIFICATION BELL
════════════════════════════════════════════════════ */
function NotificationBell({ data }) {
  const [open, setOpen]         = useState(false);
  const [notifs, setNotifs]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [calculated, setCalc]   = useState({}); // id -> {newAmount, pct}

  // Build raw alerts from contract data
  const buildAlerts = () => {
    const alerts = [];
    const today = new Date();

    (data.properties||[]).forEach(p => {
      (p.subProperties||[]).forEach(sp => {
        const c = sp.contract;
        if (!c || !c.startDate) return;
        const label = `${p.name} / ${sp.name}`;
        const currentAmount = c.currentAmount || c.initialAmount;

        // ── Vencimiento del contrato ──
        if (c.endDate) {
          const end = new Date(c.endDate + "T12:00:00");
          const daysToEnd = Math.ceil((end - today) / 86400000);
          if (daysToEnd <= 30 && daysToEnd >= -7) {
            alerts.push({
              id: `end-${sp.id}`,
              type: "end",
              urgency: daysToEnd <= 7 ? "week" : "month",
              label,
              titular: c.titular,
              daysToEnd,
              endDate: c.endDate,
              propId: p.id,
              subId: sp.id,
            });
          }
        }

        // ── Actualización de monto ──
        if (c.updateFrequency && c.ajuste !== "Otro") {
          const refDate = c.lastUpdateDate || c.startDate;
          const nextUpdate = getNextUpdateDate(refDate, c.updateFrequency);
          const daysToUpdate = getDaysUntil(nextUpdate);
          if (daysToUpdate !== null && daysToUpdate <= 30 && daysToUpdate >= -7) {
            alerts.push({
              id: `upd-${sp.id}`,
              type: "update",
              urgency: daysToUpdate <= 7 ? "week" : "month",
              label,
              titular: c.titular,
              daysToUpdate,
              nextUpdate,
              ajuste: c.ajuste,
              currentAmount,
              refDate,
              freqMonths: c.updateFrequency,
              propId: p.id,
              subId: sp.id,
            });
          }
        }
      });
    });
    return alerts;
  };

  // Fetch projected amounts for update alerts
  const fetchProjections = async (alerts) => {
    setLoading(true);
    const updateAlerts = alerts.filter(a => a.type === "update" && a.currentAmount);
    const results = {};
    await Promise.all(updateAlerts.map(async (a) => {
      try {
        const rate = a.ajuste === "IPC" ? "ipc" : "icl";
        // adjustmentDate = the next scheduled update date (projected)
        const adjustmentDate = a.nextUpdate
          ? a.nextUpdate.toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        const res = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(a.currentAmount),
            startDate: a.refDate,
            adjustmentDate,
            rate,
          }),
        });
        const json = await res.json();
        if (json.success) {
          results[a.id] = { newAmount: json.newRent, pct: json.pct };
        }
      } catch {}
    }));
    setCalc(results);
    setLoading(false);
  };

  useEffect(() => {
    if (!data) return;
    const alerts = buildAlerts();
    setNotifs(alerts);
    if (alerts.some(a => a.type === "update")) fetchProjections(alerts);
  }, [data]);

  const total = notifs.length;
  const urgent = notifs.filter(n => n.urgency === "week").length;

  const badgeColor = urgent > 0 ? "var(--red)" : "var(--gold)";

  const UrgencyTag = ({ n }) => {
    if (n.type === "end") {
      if (n.daysToEnd < 0) return <span style={{fontSize:10,color:"var(--red)",fontWeight:600}}>Vencido hace {Math.abs(n.daysToEnd)}d</span>;
      if (n.daysToEnd <= 7) return <span style={{fontSize:10,color:"var(--red)",fontWeight:600}}>⚠ Vence en {n.daysToEnd}d</span>;
      return <span style={{fontSize:10,color:"var(--gold2)"}}>Vence en {n.daysToEnd}d</span>;
    }
    if (n.daysToUpdate < 0) return <span style={{fontSize:10,color:"var(--red)",fontWeight:600}}>Vencida hace {Math.abs(n.daysToUpdate)}d</span>;
    if (n.daysToUpdate <= 7) return <span style={{fontSize:10,color:"var(--red)",fontWeight:600}}>⚠ En {n.daysToUpdate}d</span>;
    return <span style={{fontSize:10,color:"var(--gold2)"}}>En {n.daysToUpdate}d</span>;
  };

  return (
    <div style={{position:"relative"}}>
      <button onClick={() => setOpen(o => !o)} style={{
        background:"none", border:"none", cursor:"pointer", position:"relative",
        padding:"4px 6px", borderRadius:8, color: total > 0 ? "var(--gold)" : "var(--text3)",
        fontSize:18, lineHeight:1, transition:"color .15s",
      }}>
        🔔
        {total > 0 && (
          <span style={{
            position:"absolute", top:0, right:0,
            background: badgeColor, color:"#fff",
            borderRadius:"50%", width:16, height:16,
            fontSize:9, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontFamily:"DM Mono,monospace",
          }}>{total}</span>
        )}
      </button>

      {open && (
        <div style={{
          position:"fixed", top:0, left:220, bottom:0, width:320,
          background:"var(--surface)", borderRight:"1px solid var(--border)",
          zIndex:100, display:"flex", flexDirection:"column",
          boxShadow:"4px 0 24px rgba(0,0,0,.4)",
          animation:"slideIn .2s ease",
        }}>
          {/* Header */}
          <div style={{padding:"20px 20px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <div>
              <div style={{fontFamily:"DM Serif Display,serif", fontSize:18, color:"var(--text)"}}>Notificaciones</div>
              <div style={{fontSize:11, color:"var(--text3)", marginTop:2}}>{total === 0 ? "Todo al día" : `${total} alerta${total > 1 ? "s" : ""}`}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text3)",fontSize:20,lineHeight:1}}>×</button>
          </div>

          {/* Body */}
          <div style={{flex:1, overflowY:"auto", padding:"12px 16px"}}>
            {total === 0 && (
              <div style={{textAlign:"center", padding:"40px 0", color:"var(--text3)", fontSize:13}}>
                <div style={{fontSize:32, marginBottom:12}}>✓</div>
                No hay alertas pendientes
              </div>
            )}

            {loading && (
              <div style={{textAlign:"center", padding:"12px 0", fontSize:12, color:"var(--text3)"}}>
                ⏳ Calculando nuevos montos...
              </div>
            )}

            {notifs.map(n => (
              <div key={n.id} style={{
                background: n.urgency === "week" ? "rgba(224,92,92,.08)" : "var(--surface2)",
                border: `1px solid ${n.urgency === "week" ? "rgba(224,92,92,.25)" : "var(--border)"}`,
                borderRadius:10, padding:"12px 14px", marginBottom:10,
              }}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6}}>
                  <div style={{fontSize:13, fontWeight:600, color:"var(--text)", flex:1}}>
                    {n.type === "end" ? "📋 Vencimiento" : "📈 Actualización"} — {n.label}
                  </div>
                  <UrgencyTag n={n}/>
                </div>

                {n.titular && (
                  <div style={{fontSize:11, color:"var(--text3)", marginBottom:6}}>👤 {n.titular}</div>
                )}

                {n.type === "end" && (
                  <div style={{fontSize:12, color:"var(--text2)"}}>
                    Vence el <b>{fmtDate(n.endDate)}</b>
                  </div>
                )}

                {n.type === "update" && (
                  <div style={{fontSize:12, color:"var(--text2)"}}>
                    <div>Actualización <b>{n.ajuste}</b> el <b>{n.nextUpdate?.toLocaleDateString("es-AR")}</b></div>
                    <div style={{marginTop:6, display:"flex", gap:8, alignItems:"center"}}>
                      <span style={{color:"var(--text3)"}}>Actual:</span>
                      <span style={{fontFamily:"DM Mono,monospace", color:"var(--text)"}}>{fmt(parseFloat(n.currentAmount||0))}</span>
                      {calculated[n.id] && (
                        <>
                          <span style={{color:"var(--text3)"}}>→</span>
                          <span style={{fontFamily:"DM Mono,monospace", color:"var(--gold2)", fontWeight:600}}>{fmt(calculated[n.id].newAmount)}</span>
                          <span style={{fontSize:10, color:"var(--green)", background:"var(--green-dim)", borderRadius:4, padding:"1px 5px"}}>+{calculated[n.id].pct}%</span>
                        </>
                      )}
                      {loading && !calculated[n.id] && (
                        <span style={{fontSize:11, color:"var(--text3)"}}>calculando...</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,zIndex:99}}/>}
    </div>
  );
}

/* ════════════════════════════════════════════════════
   APP ROOT
════════════════════════════════════════════════════ */
const NAV = [
  { id: "dashboard", label: "Resumen", icon: "◈" },
  { id: "propiedades", label: "Propiedades", icon: "⌂" },
  { id: "ingresos", label: "Alquileres", icon: "↑" },
  { id: "gastos", label: "Gastos", icon: "↓" },
  { id: "negocio", label: "Negocio", icon: "◎" },
  { id: "destinos", label: "Destinos", icon: "⊕" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    load("propmanager").then(d => setData(d || INIT));
  }, []);

  const contractAlerts = data ? data.properties.filter(p =>
    (p.subProperties||[]).some(sp => {
      const c = sp.contract;
      if (!c || !c.startDate || !c.updateFrequency) return false;
      const refDate = c.lastUpdateDate || c.startDate;
      const next = getNextUpdateDate(refDate, c.updateFrequency);
      const days = getDaysUntil(next);
      return days !== null && days <= 30;
    })
  ).length : 0;

  if (!data) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",color:"var(--text3)",fontFamily:"Sora,sans-serif",background:"var(--bg)"}}>
      Cargando...
    </div>
  );

  const years = [];
  for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) years.push(y);

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
          <div>
            <h1>PropManager</h1>
            <span>Panel financiero</span>
          </div>
          <NotificationBell data={data}/>
        </div>
        <nav className="nav">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.id === "propiedades" && contractAlerts > 0 && <span className="nav-badge">{contractAlerts}</span>}
            </div>
          ))}
        </nav>
        <SidebarIndices/>
        <div style={{padding:"16px 20px",borderTop:"1px solid var(--border)"}}>
          <div style={{fontSize:11,color:"var(--text3)",marginBottom:8,textTransform:"uppercase",letterSpacing:"1.5px"}}>Período</div>
          <select value={month} onChange={e => setMonth(+e.target.value)} style={{marginBottom:8}}>
            {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(+e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <main className="main">
        {tab === "dashboard" && <Dashboard data={data} month={month} year={year}/>}
        {tab === "propiedades" && <Propiedades data={data} setData={setData}/>}
        {tab === "ingresos" && <Ingresos data={data} setData={setData} month={month} year={year}/>}
        {tab === "gastos" && <Gastos data={data} setData={setData} month={month} year={year}/>}
        {tab === "negocio" && <Negocio data={data} setData={setData} month={month} year={year}/>}
        {tab === "destinos" && <Destinos data={data} setData={setData}/>}
      </main>
    </div>
  );
}

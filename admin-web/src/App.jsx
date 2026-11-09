

import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, MapPin, Building2, RefreshCw, CheckCircle2, Clock,
  ShieldAlert, Activity, ChevronDown, ChevronRight, Lock, Mail, ShieldCheck,
  Eye, EyeOff, Search, Download, LogOut, BarChart3, FileText, Menu, X,
  Trash2, TrendingUp, AlertCircle, Leaf, Droplets, Zap, Construction,
  MapPinned, Filter, ExternalLink
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

// Local development uses localhost. Netlify must define VITE_API_URL as the
// public HTTPS backend URL ending in /api (never localhost on a phone).
const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const KARACHI = [24.8607, 67.0011];
const STATUS = ["Pending", "In Progress", "Resolved"];

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

function getCategoryKey(complaint = {}) {
  // Inspect all text fields. Some Expo forms save a generic category while the
  // actual service type is written in the title/description.
  const value = normalize([
    complaint.category, complaint.title, complaint.description,
    complaint.department, complaint.issueType, complaint.subcategory
  ].filter(Boolean).join(" "));
  if (/garbage|waste|sanitation|trash|dump|litter|rubbish|kacha/.test(value)) return "Garbage & Sanitation";
  if (/water|sewage|drain|pipeline|flood|gutter|naali/.test(value)) return "Water & Drainage";
  if (/road|pothole|street|footpath|manhole|pavement/.test(value)) return "Roads & Infrastructure";
  if (/electric|light|power|wire|street ?light|bijli/.test(value)) return "Electricity & Lighting";
  return String(complaint.category || complaint.title || "Other").trim() || "Other";
}

function readCoordinates(c) {
  const candidates = [
    [c.latitude, c.longitude], [c.lat, c.lng], [c.lat, c.lon],
    [c.location?.latitude, c.location?.longitude],
    [c.coordinates?.lat, c.coordinates?.lng],
    [c.coordinates?.latitude, c.coordinates?.longitude],
    Array.isArray(c.coordinates) ? [c.coordinates[1], c.coordinates[0]] : null,
    Array.isArray(c.location?.coordinates)
      ? [c.location.coordinates[1], c.location.coordinates[0]] : null
  ].filter(Boolean);
  for (const pair of candidates) {
    const lat = Number(pair[0]), lng = Number(pair[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 &&
        !(lat === 0 && lng === 0)) return [lat, lng];
  }
  return null;
}

function markerIcon(status) {
  const s = normalize(status);
  const color = s === "resolved" ? "#16a765" : s === "in progress" ? "#315bff" : "#e99a27";
  return L.divIcon({
    className: "mf-marker-wrap",
    html: `<span class="mf-marker" style="--marker-color:${color}"><i></i></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function MapFocus({ selected }) {
  const map = useMap();
  useEffect(() => {
    if (selected) map.flyTo(selected, 15, { duration: 0.8 });
  }, [selected, map]);
  return null;
}

function MapBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
  }, [points, map]);
  return null;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const res = await axios.post(`${API}/auth/login`, { email: email.trim(), password });
      if (!res.data?.token) throw new Error("Login response did not include a token.");
      if (res.data.user?.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminEmail", res.data.user?.email || email.trim());
      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally { setBusy(false); }
  }

  return <div className="login-screen">
    <motion.form className="login-card" onSubmit={submit}
      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
      <div className="brand-mark">M</div>
      <p className="eyebrow">CIVIC OPERATIONS PLATFORM</p>
      <h1>Mohalla<span>Fix</span></h1>
      <p className="muted center">Sign in to your administration workspace</p>
      {error && <div className="alert-error">{error}</div>}
      <label>Admin email</label>
      <div className="field"><Mail size={17}/><input type="email" required value={email}
        onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com"/></div>
      <label>Password</label>
      <div className="field"><Lock size={17}/><input type={show ? "text":"password"} required
        value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter password"/>
        <button type="button" className="icon-button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
      </div>
      <button className="btn btn-primary full" disabled={busy}>{busy ? "Signing in..." : "Sign in securely"}</button>
    </motion.form>
  </div>;
}

function StatCard({ title, value, note, icon: Icon, tone, delay = 0 }) {
  return <motion.article className={`stat-card ${tone}`} initial={{opacity:0,y:14}}
    animate={{opacity:1,y:0}} transition={{delay}} whileHover={{y:-5,scale:1.012}}
    whileTap={{scale:.99}}>
    <div className="stat-top"><span>{title}</span><span className="stat-icon"><Icon size={19}/></span></div>
    <strong>{value}</strong><small>{note}</small>
    <div className="stat-decoration"/>
  </motion.article>;
}

function SectionTitle({ eyebrow, title, subtitle, right }) {
  return <div className="section-title">
    <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{subtitle && <p className="muted">{subtitle}</p>}</div>
    {right}
  </div>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(localStorage.getItem("adminToken")));
  const [tab, setTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [expanded, setExpanded] = useState({ complaints: false, map: false, activity: false });
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toast, setToast] = useState("");
  const [auditLogs, setAuditLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("mohallafix-audit") || "[]"); }
    catch { return []; }
  });

  const adminEmail = localStorage.getItem("adminEmail") || "Administrator";
  const token = localStorage.getItem("adminToken");
  const headers = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchComplaints = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await axios.get(`${API}/complaints`, { timeout: 12000 });
      const list = Array.isArray(res.data) ? res.data :
        Array.isArray(res.data?.complaints) ? res.data.complaints :
        Array.isArray(res.data?.data) ? res.data.data : null;
      if (!list) throw new Error("The complaints API did not return an array.");
      setComplaints(list);
      setHasLoaded(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Could not load complaints.");
      // Keep the last successful data visible; never replace it with empty data on a failed refresh.
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    fetchComplaints(true);
    const timer = setInterval(() => fetchComplaints(false), 10000);
    return () => clearInterval(timer);
  }, [authenticated, fetchComplaints]);

  useEffect(() => {
    localStorage.setItem("mohallafix-audit", JSON.stringify(auditLogs.slice(0, 100)));
  }, [auditLogs]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  function addAudit(complaint, oldStatus, newStatus) {
    const entry = {
      id: `${Date.now()}-${complaint._id}`,
      admin: adminEmail,
      complaintId: complaint._id,
      category: getCategoryKey(complaint),
      location: typeof complaint.location === "string" ? complaint.location : (complaint.location?.address || "Location not provided"),
      oldStatus, newStatus,
      action: `Changed status from ${oldStatus} to ${newStatus}`,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [entry, ...prev].slice(0, 100));
  }

  async function updateStatus(complaint, newStatus) {
    const oldStatus = complaint.status || "Pending";
    if (oldStatus === newStatus) return;
    try {
      const res = await axios.patch(`${API}/complaints/${complaint._id}/status`,
        { status: newStatus }, { headers, timeout: 12000 });
      const updated = res.data?.complaint || res.data;
      setComplaints(prev => prev.map(c => c._id === complaint._id ? { ...c, ...updated } : c));
      addAudit(complaint, oldStatus, newStatus);
      notify(`Complaint status updated to ${newStatus}`);
    } catch (err) {
      notify(err.response?.data?.message || "Status update failed. Check admin login and API.");
    }
  }

  const counts = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => normalize(c.status) === "pending").length,
    progress: complaints.filter(c => normalize(c.status) === "in progress").length,
    resolved: complaints.filter(c => normalize(c.status) === "resolved").length
  }), [complaints]);

  const categories = useMemo(() => {
    const map = new Map();
    complaints.forEach(c => {
      const key = getCategoryKey(c);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  }, [complaints]);

  const departmentRows = useMemo(() => {
    const groups = [
      {name:"Roads & Infrastructure"},
      {name:"Garbage & Sanitation"},
      {name:"Water & Drainage"},
      {name:"Electricity & Lighting"}
    ];
    return groups.map(g => {
      const items = complaints.filter(c => getCategoryKey(c) === g.name);
      const resolved = items.filter(c => normalize(c.status) === "resolved").length;
      return {...g, total:items.length, pending:items.filter(c=>normalize(c.status)==="pending").length,
        progress:items.filter(c=>normalize(c.status)==="in progress").length,
        resolved, rate:items.length ? Math.round(resolved/items.length*100) : 0};
    });
  }, [complaints]);

  const filtered = useMemo(() => complaints.filter(c => {
    const category = normalize(getCategoryKey(c));
    const status = normalize(c.status || "pending");
    const q = normalize(query);
    return (categoryFilter === "All" || category.includes(normalize(categoryFilter))) &&
      (statusFilter === "All" || status === normalize(statusFilter)) &&
      (!q || [c.title,c.category,c.description,c.location, c._id].some(v=>normalize(typeof v==="object" ? v?.address : v).includes(q)));
  }), [complaints, categoryFilter, statusFilter, query]);

  const mappedComplaints = useMemo(() => complaints.map(c=>({complaint:c, coords:readCoordinates(c)}))
    .filter(x=>x.coords), [complaints]);

  const nav = [
    {id:"dashboard",label:"Executive Dashboard",icon:LayoutDashboard},
    {id:"analytics",label:"Analytics & Trends",icon:BarChart3},
    {id:"map",label:"Karachi Regional Map",icon:MapPin},
    {id:"departments",label:"Municipal Departments",icon:Building2},
    {id:"audit",label:"Admin Activity",icon:FileText}
  ];

  function exportCSV() {
    const rows = [["ID","Category","Description","Location","Status","Created"]];
    complaints.forEach(c=>rows.push([c._id,getCategoryKey(c),c.description,
      typeof c.location==="string"?c.location:(c.location?.address||""),
      c.status,c.createdAt||""]));
    const csv = rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
    const a = document.createElement("a"); a.href=url;
    a.download=`MohallaFix_Report_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  function logout() {
    localStorage.removeItem("adminToken"); localStorage.removeItem("adminEmail");
    setAuthenticated(false); setTab("dashboard");
  }

  if (!authenticated) return <Login onLogin={()=>setAuthenticated(true)}/>;

  const title = nav.find(n=>n.id===tab)?.label || "Executive Dashboard";

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen?"sidebar-open":""}`}>
      <div className="brand"><div className="brand-mark small">M</div><div><b>Mohalla<span>Fix</span></b><small>ADMIN WORKSPACE</small></div></div>
      <div className="side-caption">WORKSPACE</div>
      <nav className="side-nav">{nav.map(item=>{
        const Icon=item.icon; return <button key={item.id} onClick={()=>{setTab(item.id);setMobileOpen(false);}}
          className={`nav-link ${tab===item.id?"active":""}`}><Icon size={18}/><span>{item.label}</span>
</button>;
      })}</nav>
      <div className="sidebar-bottom"><div className="online"><i/> API workspace</div>
        <div className="admin-mini"><div className="avatar">{adminEmail.slice(0,1).toUpperCase()}</div>
          <div className="admin-meta"><b>{adminEmail}</b><small>Administrator</small></div>
          <button className="icon-button logout-icon" onClick={logout} title="Logout"><LogOut size={17}/></button>
        </div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="topbar-left"><button className="mobile-menu icon-button" onClick={()=>setMobileOpen(v=>!v)}>{mobileOpen?<X/>:<Menu/>}</button>
          <div><p className="eyebrow">MOHALLAFIX / OPERATIONS</p><h1>{title}</h1></div>
        </div>
        <div className="top-actions"><span className="live-pill"><i/> Live data</span>
          <button className="btn btn-light" onClick={exportCSV}><Download size={16}/> Export</button>
          <button className="btn btn-primary" onClick={()=>fetchComplaints(true)} disabled={loading}><RefreshCw size={16} className={loading?"spin":""}/> Refresh</button>
        </div>
      </header>

      <div className="content">
        {error&&<div className="alert-error inline-alert"><AlertCircle size={17}/>{error}</div>}
        {!hasLoaded&&loading?<div className="loading-panel">Loading MohallaFix data…</div>:null}

        {tab==="dashboard"&&<>
          <SectionTitle eyebrow="OVERVIEW" title="Civic operations at a glance" subtitle="A live summary of reports submitted across Karachi."/>
          <div className="stats-grid">
            <StatCard title="TOTAL COMPLAINTS" value={counts.total} note="All recorded reports" icon={Activity} tone="tone-blue" delay={0}/>
            <StatCard title="PENDING REVIEW" value={counts.pending} note="Awaiting action" icon={Clock} tone="tone-amber" delay={.05}/>
            <StatCard title="IN PROGRESS" value={counts.progress} note="Currently being handled" icon={ShieldAlert} tone="tone-indigo" delay={.1}/>
            <StatCard title="RESOLVED" value={counts.resolved} note="Marked as completed" icon={CheckCircle2} tone="tone-green" delay={.15}/>
          </div>
          <section className="panel">
            <button className="panel-heading accordion-trigger" onClick={()=>setExpanded(p=>({...p,complaints:!p.complaints}))}>
              <span><span className="eyebrow">REPORT MANAGEMENT</span><b>Recent complaints</b><small>{filtered.length} matching reports · {complaints.length} total</small></span>
              {expanded.complaints?<ChevronDown/>:<ChevronRight/>}
            </button>
           <AnimatePresence initial={false}>{expanded.complaints&&<motion.div className="panel-body"
              initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}>
              <div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search title, category, location…"/></div>
                <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)}><option>All</option>{categories.map(([c])=><option key={c}>{c}</option>)}</select>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>All</option>{STATUS.map(s=><option key={s}>{s}</option>)}</select>
              </div>
              <div className="table-wrap"><table><thead><tr><th>Complaint</th><th>Location</th><th>Submitted</th><th>Status</th><th>Update status</th></tr></thead>
                <tbody>{filtered.slice(0,expanded.complaints?filtered.length:8).map(c=><tr key={c._id}>
                  <td><b>{getCategoryKey(c)}</b><small>{c.title||c.description||"No description"}</small></td>
                  <td>{typeof c.location==="string"?c.location:(c.location?.address||"Not provided")}</td>
                  <td>{c.createdAt?new Date(c.createdAt).toLocaleDateString():"—"}</td>
                  <td><span className={`status status-${normalize(c.status).replace(" ","-")}`}>{c.status||"Pending"}</span></td>
                  <td><select value={c.status||"Pending"} onChange={e=>updateStatus(c,e.target.value)}>{STATUS.map(s=><option key={s}>{s}</option>)}</select></td>
                </tr>)}</tbody></table>
                {filtered.length===0&&<div className="empty-state">No complaints match these filters.</div>}
              </div>
              {filtered.length>8&&<button className="text-button" onClick={()=>setExpanded(p=>({...p,complaints:!p.complaints}))}>Show all {filtered.length} complaints <ChevronDown size={15}/></button>}
            </motion.div>}</AnimatePresence>
          </section>
          <div className="two-col">
            <section className="panel panel-pad"><SectionTitle eyebrow="LIVE BREAKDOWN" title="Complaint categories" subtitle="Calculated from the current database records."/>
              <div className="category-list">{categories.map(([name,count])=><div className="category-row" key={name}><span>{name}</span><b>{count}</b><div className="bar"><i style={{width:`${counts.total?count/counts.total*100:0}%`}}/></div></div>)}
                {!categories.length&&<p className="muted">No category data yet.</p>}</div>
            </section>
            <section className="panel panel-pad"><SectionTitle eyebrow="STATUS SUMMARY" title="Resolution progress"/>
              <div className="donut-wrap"><div className="donut" style={{"--pending":`${counts.total?counts.pending/counts.total*100:0}%`,"--progress":`${counts.total?counts.progress/counts.total*100:0}%`}}><div><b>{counts.total?Math.round(counts.resolved/counts.total*100):0}%</b><small>Resolved</small></div></div>
                <div className="legend"><span><i className="dot amber"/>Pending <b>{counts.pending}</b></span><span><i className="dot blue"/>In progress <b>{counts.progress}</b></span><span><i className="dot green"/>Resolved <b>{counts.resolved}</b></span></div></div>
            </section>
          </div>
        </>}

        {tab==="analytics"&&<>
          <SectionTitle eyebrow="PERFORMANCE" title="Analytics & trends" subtitle="Every metric below is derived from the current complaints API response."/>
          <div className="stats-grid compact-stats">
            <StatCard title="TOTAL REPORTS" value={counts.total} note="Database records" icon={FileText} tone="tone-blue"/>
            <StatCard title="RESOLUTION RATE" value={`${counts.total?Math.round(counts.resolved/counts.total*100):0}%`} note="Resolved / total" icon={TrendingUp} tone="tone-green"/>
            <StatCard title="OPEN REPORTS" value={counts.pending+counts.progress} note="Pending + in progress" icon={Clock} tone="tone-amber"/>
            <StatCard title="CATEGORIES" value={categories.length} note="Distinct category groups" icon={Filter} tone="tone-indigo"/>
          </div>
          <div className="two-col">
            <section className="panel panel-pad"><SectionTitle eyebrow="CATEGORY BREAKDOWN" title="Reports by category"/>
              {categories.map(([name,count])=><div className="metric-row" key={name}><div><b>{name}</b><span>{count} reports</span></div><div className="metric-track"><i style={{width:`${counts.total?count/counts.total*100:0}%`}}/></div><strong>{counts.total?Math.round(count/counts.total*100):0}%</strong></div>)}
              {!categories.length&&<p className="muted">No categories available.</p>}
            </section>
            <section className="panel panel-pad"><SectionTitle eyebrow="STATUS DISTRIBUTION" title="Current report status"/>
              {[["Pending",counts.pending,"amber"],["In Progress",counts.progress,"blue"],["Resolved",counts.resolved,"green"]].map(([name,n,tone])=><div className="metric-row" key={name}><div><b>{name}</b><span>{n} reports</span></div><div className={`metric-track ${tone}`}><i style={{width:`${counts.total?n/counts.total*100:0}%`}}/></div><strong>{counts.total?Math.round(n/counts.total*100):0}%</strong></div>)}
            </section>
          </div>
       

               </>}
      </div>
    </main>
  </div>;
}
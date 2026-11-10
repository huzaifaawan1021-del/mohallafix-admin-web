



import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, AlertCircle, BarChart3, Building2, CheckCircle2, ChevronDown,
  ChevronRight, Clock, Download, Eye, EyeOff, FileText, LayoutDashboard,
  Leaf, Lock, LogOut, Mail, MapPin, Menu, RefreshCw, Search, ShieldAlert,
  Trash2, Droplets, Zap, Construction, X
} from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./index.css";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");
const KARACHI = [24.8607, 67.0011];
const STATUSES = ["Pending", "In Progress", "Resolved"];

const normalize = (v = "") =>
  String(v ?? "").trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const normalizeStatus = (v) => {
  const s = normalize(v || "Pending");
  if (["resolved", "complete", "completed", "closed"].includes(s)) return "resolved";
  if (["in progress", "processing", "under review", "in review"].includes(s)) return "in progress";
  return "pending";
};

function getCategoryKey(c = {}) {
  const value = normalize(
    [c.category, c.title, c.description, c.department, c.issueType, c.subcategory]
      .filter(Boolean).join(" ")
  );

  if (/garbage|waste|sanitation|trash|dump|litter|rubbish|kacha/.test(value)) return "Garbage & Sanitation";
  if (/water|sewage|drain|pipeline|flood|gutter|naali/.test(value)) return "Water & Drainage";
  if (/road|pothole|street|footpath|manhole|pavement/.test(value)) return "Roads & Infrastructure";
  if (/electric|light|power|wire|street ?light|bijli/.test(value)) return "Electricity & Lighting";

  return String(c.category || c.title || "Other").trim() || "Other";
}

function getLocationText(location) {
  if (typeof location === "string") return location;
  return location?.address || location?.name || location?.description || "Location not provided";
}

function readCoordinates(c = {}) {
  const pairs = [
    [c.latitude, c.longitude],
    [c.lat, c.lng],
    [c.lat, c.lon],
    [c.location?.latitude, c.location?.longitude],
    [c.coordinates?.lat, c.coordinates?.lng],
    [c.coordinates?.latitude, c.coordinates?.longitude],
    Array.isArray(c.coordinates) ? [c.coordinates[1], c.coordinates[0]] : null,
    Array.isArray(c.location?.coordinates)
      ? [c.location.coordinates[1], c.location.coordinates[0]]
      : null
  ].filter(Boolean);

  for (const pair of pairs) {
    const lat = Number(pair[0]);
    const lng = Number(pair[1]);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      !(lat === 0 && lng === 0)
    ) {
      return [lat, lng];
    }
  }

  return null;
}

function markerIcon(status) {
  const s = normalizeStatus(status);
  const color =
    s === "resolved" ? "#16a765" :
    s === "in progress" ? "#315bff" :
    "#e99a27";

  return L.divIcon({
    className: "mf-marker-wrap",
    html: `<span class="mf-marker" style="--marker-color:${color}"><i></i></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function MapBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [36, 36], maxZoom: 14 });
    }
  }, [map, points]);

  return null;
}

function MapFocus({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 0.8 });
    }
  }, [map, position]);

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
    setBusy(true);
    setError("");

    try {
      const res = await axios.post(
        `${API}/auth/login`,
        { email: email.trim(), password },
        { timeout: 12000 }
      );

      if (!res.data?.token) {
        throw new Error("Login response did not include a token.");
      }

      if (res.data.user?.role && res.data.user.role !== "admin") {
        throw new Error("This account does not have admin access.");
      }

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminEmail", res.data.user?.email || email.trim());

      onLogin();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-screen">
      <motion.form
        className="login-card"
        onSubmit={submit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="brand-mark">M</div>
        <p className="eyebrow">CIVIC OPERATIONS PLATFORM</p>
        <h1>Mohalla<span>Fix</span></h1>
        <p className="muted center">Sign in to your administration workspace</p>

        {error && <div className="alert-error">{error}</div>}

        <label htmlFor="admin-email">Admin email</label>
        <div className="field">
          <Mail size={17} />
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>

        <label htmlFor="admin-password">Password</label>
        <div className="field">
          <Lock size={17} />
          <input
            id="admin-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
          />
          <button
            type="button"
            className="icon-button"
            aria-label="Toggle password visibility"
            onClick={() => setShow(v => !v)}
          >
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>

        <button className="btn btn-primary full" disabled={busy}>
          {busy ? "Signing in..." : "Sign in securely"}
        </button>
      </motion.form>
    </div>
  );
}

function StatCard({ title, value, note, icon: Icon, tone, delay = 0 }) {
  return (
    <motion.article
      className={`stat-card ${tone}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4 }}
    >
      <div className="stat-top">
        <span>{title}</span>
        <span className="stat-icon"><Icon size={19} /></span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
      <div className="stat-decoration" />
    </motion.article>
  );
}

function SectionTitle({ eyebrow, title, subtitle, right }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem("adminToken"))
  );
  const [tab, setTab] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [analyticsCategoryOpen, setAnalyticsCategoryOpen] = useState(false);
  const [analyticsStatusOpen, setAnalyticsStatusOpen] = useState(false);
  const [mapLocationsOpen, setMapLocationsOpen] = useState(false);
  const [dashboardDetailsOpen, setDashboardDetailsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [toast, setToast] = useState("");

  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("mohallafix-audit") || "[]");
    } catch {
      return [];
    }
  });

  const token = localStorage.getItem("adminToken");
  const adminEmail = localStorage.getItem("adminEmail") || "Administrator";
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}` }),
    [token]
  );

  const selectedComplaint = complaints.find(
    c => String(c._id) === String(selectedId)
  );

  const notify = useCallback(message => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }, []);

  const fetchComplaints = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const res = await axios.get(`${API}/complaints`, {
        headers,
        timeout: 12000
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.complaints)
          ? res.data.complaints
          : Array.isArray(res.data?.data)
            ? res.data.data
            : null;

      if (!list) {
        throw new Error("The complaints API did not return an array.");
      }

      setComplaints(list);
      setHasLoaded(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Could not load complaints."
      );
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    if (!authenticated) return undefined;

    fetchComplaints(true);

    const timer = window.setInterval(() => {
      fetchComplaints(false);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [authenticated, fetchComplaints]);

  useEffect(() => {
    localStorage.setItem(
      "mohallafix-audit",
      JSON.stringify(auditLogs.slice(0, 100))
    );
  }, [auditLogs]);

  const counts = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => normalizeStatus(c.status) === "pending").length,
    progress: complaints.filter(c => normalizeStatus(c.status) === "in progress").length,
    resolved: complaints.filter(c => normalizeStatus(c.status) === "resolved").length
  }), [complaints]);

  const categories = useMemo(() => {
    const map = new Map();

    complaints.forEach(c => {
      const key = getCategoryKey(c);
      map.set(key, (map.get(key) || 0) + 1);
    });

    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [complaints]);

  const departmentRows = useMemo(() => {
    const iconFor = name => {
      const key = normalize(name);

      if (/water|drain|sewage/.test(key)) return Droplets;
      if (/electric|light|power/.test(key)) return Zap;
      if (/road|infrastructure|street/.test(key)) return Construction;
      if (/garbage|waste|sanitation|trash/.test(key)) return Leaf;

      return Building2;
    };

    return categories.map(([name]) => {
      const items = complaints.filter(c => getCategoryKey(c) === name);
      const pending = items.filter(c => normalizeStatus(c.status) === "pending").length;
      const progress = items.filter(c => normalizeStatus(c.status) === "in progress").length;
      const resolved = items.filter(c => normalizeStatus(c.status) === "resolved").length;

      return {
        name,
        icon: iconFor(name),
        total: items.length,
        pending,
        progress,
        resolved,
        rate: items.length ? Math.round(resolved / items.length * 100) : 0
      };
    });
  }, [complaints, categories]);

  const filtered = useMemo(() => complaints.filter(c => {
    const category = normalize(getCategoryKey(c));
    const status = normalizeStatus(c.status);
    const search = normalize(query);

    const searchable = [
      c.title,
      c.category,
      c.description,
      getLocationText(c.location),
      c._id
    ].map(normalize).join(" ");

    return (
      (categoryFilter === "All" || category.includes(normalize(categoryFilter))) &&
      (statusFilter === "All" || status === normalize(statusFilter)) &&
      (!search || searchable.includes(search))
    );
  }), [complaints, categoryFilter, statusFilter, query]);

  const mapped = useMemo(
    () => complaints
      .map(complaint => ({ complaint, coords: readCoordinates(complaint) }))
      .filter(x => x.coords),
    [complaints]
  );

  const mapPoints = useMemo(() => mapped.map(x => x.coords), [mapped]);

  const nav = [
    { id: "dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
    { id: "analytics", label: "Analytics & Trends", icon: BarChart3 },
    { id: "map", label: "Karachi Regional Map", icon: MapPin },
    { id: "departments", label: "Municipal Departments", icon: Building2 },
    { id: "audit", label: "Admin Activity", icon: FileText }
  ];

  async function updateStatus(complaint, newStatus) {
    const oldStatus = complaint.status || "Pending";
    if (oldStatus === newStatus) return;

    try {
      const res = await axios.patch(
        `${API}/complaints/${complaint._id}/status`,
        { status: newStatus },
        { headers, timeout: 12000 }
      );

      const updated = res.data?.complaint || res.data?.data || res.data;

      setComplaints(prev =>
        prev.map(c =>
          c._id === complaint._id
            ? { ...c, ...updated, status: newStatus }
            : c
        )
      );

      setAuditLogs(prev => [{
        id: `${Date.now()}-${complaint._id}`,
        admin: adminEmail,
        complaintId: complaint._id,
        category: getCategoryKey(complaint),
        location: getLocationText(complaint.location),
        action: `Changed status from ${oldStatus} to ${newStatus}`,
        createdAt: new Date().toISOString()
      }, ...prev].slice(0, 100));

      notify(`Complaint status updated to ${newStatus}`);
    } catch (err) {
      notify(
        err.response?.data?.message ||
        "Status update failed. Check admin login and API."
      );
    }
  }

  function exportCSV() {
    const rows = [[
      "ID", "Category", "Description", "Location", "Status", "Created"
    ]];

    complaints.forEach(c => rows.push([
      c._id,
      getCategoryKey(c),
      c.description || c.title || "",
      getLocationText(c.location),
      c.status || "Pending",
      c.createdAt || ""
    ]));

    const csv = rows
      .map(row => row.map(v => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = `MohallaFix_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  }

  function logout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminEmail");
    setAuthenticated(false);
    setTab("dashboard");
    setComplaints([]);
    setHasLoaded(false);
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />;
  }

  const title = nav.find(n => n.id === tab)?.label || "Executive Dashboard";

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark small">M</div>
          <div>
            <b>Mohalla<span>Fix</span></b>
            <small>ADMIN WORKSPACE</small>
          </div>
        </div>

        <div className="side-caption">WORKSPACE</div>

        <nav className="side-nav">
          {nav.map(item => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setTab(item.id);
                  setMobileOpen(false);
                }}
                className={`nav-link ${tab === item.id ? "active" : ""}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="online"><i /> API workspace</div>

          <div className="admin-mini">
            <div className="avatar">{adminEmail.slice(0, 1).toUpperCase()}</div>
            <div className="admin-meta">
              <b>{adminEmail}</b>
              <small>Administrator</small>
            </div>
            <button
              className="icon-button logout-icon"
              onClick={logout}
              title="Logout"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu icon-button"
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>

            <div>
              <p className="eyebrow">MOHALLAFIX / OPERATIONS</p>
              <h1>{title}</h1>
            </div>
          </div>

          <div className="top-actions">
            <span className="live-pill"><i /> Live data</span>
            <button className="btn btn-light" onClick={exportCSV}>
              <Download size={16} /> Export
            </button>
            <button
              className="btn btn-primary"
              onClick={() => fetchComplaints(true)}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        <div className="content">
          {error && (
            <div className="alert-error inline-alert">
              <AlertCircle size={17} />{error}
            </div>
          )}

          {!hasLoaded && loading && (
            <div className="loading-panel">Loading MohallaFix data…</div>
          )}

          {tab === "dashboard" && <>
            <SectionTitle
              eyebrow="OVERVIEW"
              title="Civic operations at a glance"
              subtitle="A live summary of reports submitted across Karachi."
            />

            <div className="stats-grid">
              <StatCard title="TOTAL COMPLAINTS" value={counts.total} note="All recorded reports" icon={Activity} tone="tone-blue" />
              <StatCard title="PENDING REVIEW" value={counts.pending} note="Awaiting action" icon={Clock} tone="tone-amber" delay={.05} />
              <StatCard title="IN PROGRESS" value={counts.progress} note="Currently being handled" icon={ShieldAlert} tone="tone-indigo" delay={.1} />
              <StatCard title="RESOLVED" value={counts.resolved} note="Marked as completed" icon={CheckCircle2} tone="tone-green" delay={.15} />
            </div>

            <section className="panel">
              <button
                className="panel-heading accordion-trigger"
                onClick={() => setComplaintsOpen(v => !v)}
              >
                <span>
                  <span className="eyebrow">REPORT MANAGEMENT</span>
                  <b>Recent complaints</b>
                  <small>{filtered.length} matching reports · {complaints.length} total</small>
                </span>
                {complaintsOpen ? <ChevronDown /> : <ChevronRight />}
              </button>

              <AnimatePresence initial={false}>
                {complaintsOpen && (
                  <motion.div
                    className="panel-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="toolbar">
                      <div className="search-box">
                        <Search size={17} />
                        <input
                          value={query}
                          onChange={e => {
                            setQuery(e.target.value);
                            setShowAll(false);
                          }}
                          placeholder="Search title, category, location…"
                        />
                      </div>

                      <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="All">All categories</option>
                        {categories.map(([c]) => <option key={c}>{c}</option>)}
                      </select>

                      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="All">All statuses</option>
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </div>

                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Complaint</th>
                            <th>Location</th>
                            <th>Submitted</th>
                            <th>Status</th>
                            <th>Update status</th>
                          </tr>
                        </thead>

                        <tbody>
                          {filtered.slice(0, showAll ? filtered.length : 8).map(c => (
                            <tr key={c._id}>
                              <td>
                                <b>{getCategoryKey(c)}</b>
                                <small>{c.title || c.description || "No description"}</small>
                              </td>
                              <td>{getLocationText(c.location)}</td>
                              <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                              <td>
                                <span className={`status status-${normalizeStatus(c.status).replace(/\s+/g, "-")}`}>
                                  {c.status || "Pending"}
                                </span>
                              </td>
                              <td>
                                <select
                                  value={STATUSES.find(s => normalizeStatus(s) === normalizeStatus(c.status)) || "Pending"}
                                  onChange={e => updateStatus(c, e.target.value)}
                                >
                                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {filtered.length > 8 && (
                      <button className="text-button" onClick={() => setShowAll(v => !v)}>
                        {showAll ? "Show fewer" : `View all ${filtered.length} complaints`}
                      </button>
                    )}

                    {!filtered.length && (
                      <div className="empty-state">No complaints match your search.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <div className="two-col dashboard-details">
              <section className="panel panel-pad">
                <SectionTitle eyebrow="SERVICE OVERVIEW" title="Complaint categories" />
                <div className="category-list">
                  {categories.map(([name, count]) => (
                    <div className="category-row" key={name}>
                      <span>{name}</span>
                      <b>{count}</b>
                      <div className="bar">
                        <i style={{ width: `${counts.total ? count / counts.total * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                  {!categories.length && <p className="muted">No category data yet.</p>}
                </div>
              </section>

              <section className="panel panel-pad">
                <SectionTitle eyebrow="STATUS SUMMARY" title="Resolution progress" />
                <div className="donut-wrap">
                  <div
                    className="donut"
                    style={{
                      "--resolved": `${counts.total ? counts.resolved / counts.total * 100 : 0}%`,
                      "--progress": `${counts.total ? counts.progress / counts.total * 100 : 0}%`
                    }}
                  >
                    <div>
                      <b>{counts.total ? Math.round(counts.resolved / counts.total * 100) : 0}%</b>
                      <small>Resolved</small>
                    </div>
                  </div>

                  <div className="legend">
                    <span><i className="dot amber" />Pending <b>{counts.pending}</b></span>
                    <span><i className="dot blue" />In progress <b>{counts.progress}</b></span>
                    <span><i className="dot green" />Resolved <b>{counts.resolved}</b></span>
                  </div>
                </div>
              </section>
            </div>
          </>}

          {tab === "analytics" && <>
            <SectionTitle
              eyebrow="PERFORMANCE"
              title="Analytics & Trends"
              subtitle="A breakdown of complaint volume and resolution status."
            />

            <div className="stats-grid">
              <StatCard title="TOTAL REPORTS" value={counts.total} note="All complaints" icon={Activity} tone="tone-blue" />
              <StatCard title="PENDING" value={counts.pending} note="Awaiting action" icon={Clock} tone="tone-amber" />
              <StatCard title="IN PROGRESS" value={counts.progress} note="Being handled" icon={ShieldAlert} tone="tone-indigo" />
              <StatCard title="RESOLVED" value={counts.resolved} note="Completed reports" icon={CheckCircle2} tone="tone-green" />
            </div>

            <div className="two-col analytics-accordions">
              <section className="panel accordion-panel">
                <button
                  className="panel-heading accordion-trigger"
                  onClick={() => setAnalyticsCategoryOpen(v => !v)}
                >
                  <span>
                    <span className="eyebrow">REPORT MIX</span>
                    <b>Category distribution</b>
                    <small>Number of reports in each category.</small>
                  </span>
                  <motion.span animate={{ rotate: analyticsCategoryOpen ? 180 : 0 }}>
                    <ChevronDown />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {analyticsCategoryOpen && (
                    <motion.div
                      className="panel-body accordion-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <div className="category-list">
                        {categories.map(([name, count]) => (
                          <div className="category-row" key={name}>
                            <span>{name}</span>
                            <b>{count}</b>
                            <div className="bar">
                              <i style={{ width: `${counts.total ? count / counts.total * 100 : 0}%` }} />
                            </div>
                          </div>
                        ))}
                        {!categories.length && <p className="muted">No category data available.</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              <section className="panel accordion-panel">
                <button
                  className="panel-heading accordion-trigger"
                  onClick={() => setAnalyticsStatusOpen(v => !v)}
                >
                  <span>
                    <span className="eyebrow">RESOLUTION FOCUS</span>
                    <b>Status distribution</b>
                    <small>Share of all submitted reports.</small>
                  </span>
                  <motion.span animate={{ rotate: analyticsStatusOpen ? 180 : 0 }}>
                    <ChevronDown />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {analyticsStatusOpen && (
                    <motion.div
                      className="panel-body accordion-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {STATUSES.map(status => {
                        const key =
                          status === "Pending" ? "pending" :
                          status === "In Progress" ? "progress" :
                          "resolved";

                        const value = counts[key];
                        const percentage = counts.total
                          ? Math.round(value / counts.total * 100)
                          : 0;

                        return (
                          <div className="metric-row" key={status}>
                            <div><b>{status}</b><span>{value} reports</span></div>
                            <div className={`metric-track ${key === "pending" ? "amber" : key === "progress" ? "blue" : ""}`}>
                              <i style={{ width: `${percentage}%` }} />
                            </div>
                            <strong>{percentage}%</strong>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>
            </div>
          </>}

          {tab === "map" && <>
            <SectionTitle
              eyebrow="GEOGRAPHIC OVERVIEW"
              title="Karachi Regional Map"
              subtitle="Complaint locations based on coordinates saved with each report."
            />

            <div className="map-summary">
              <div><b>{mapped.length}</b><span>Mapped complaints</span></div>
              <div><b>{complaints.length - mapped.length}</b><span>Without coordinates</span></div>
              <div className="map-legend">
                <span><i className="dot amber" />Pending</span>
                <span><i className="dot blue" />In progress</span>
                <span><i className="dot green" />Resolved</span>
              </div>
            </div>

            <section className="map-panel">
              <div className="map-frame">
                <MapContainer
                  center={KARACHI}
                  zoom={11}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {!selectedComplaint && <MapBounds points={mapPoints} />}

                  {selectedComplaint && readCoordinates(selectedComplaint) && (
                    <MapFocus position={readCoordinates(selectedComplaint)} />
                  )}

                  {mapped.map(({ complaint, coords }) => (
                    <Marker
                      key={complaint._id}
                      position={coords}
                      icon={markerIcon(complaint.status || "Pending")}
                      eventHandlers={{
                        click: () => setSelectedId(String(complaint._id))
                      }}
                    >
                      <Popup>
                        <div className="map-popup">
                          <h3>{complaint.title || getCategoryKey(complaint)}</h3>
                          <p>{complaint.description || "No description available"}</p>
                          <small>{getLocationText(complaint.location)}</small>
                          <strong>Status: {complaint.status || "Pending"}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </section>

            <section className="panel accordion-panel map-directory">
              <button
                className="panel-heading accordion-trigger"
                onClick={() => setMapLocationsOpen(v => !v)}
              >
                <span>
                  <span className="eyebrow">LOCATION DIRECTORY</span>
                  <b>Mapped complaint locations</b>
                  <small>{mapped.length} mapped reports · Select one to focus its marker.</small>
                </span>
                <motion.span animate={{ rotate: mapLocationsOpen ? 180 : 0 }}>
                  <ChevronDown />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {mapLocationsOpen && (
                  <motion.div
                    className="panel-body accordion-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {!mapped.length ? (
                      <div className="empty-state">
                        No complaints with valid map coordinates found.
                      </div>
                    ) : mapped.map(({ complaint }) => (
                      <button
                        type="button"
                        className={`location-row ${String(selectedId) === String(complaint._id) ? "selected" : ""}`}
                        key={complaint._id}
                        onClick={() => setSelectedId(String(complaint._id))}
                      >
                        <span className="audit-icon"><MapPin size={16} /></span>
                        <span className="location-copy">
                          <b>{complaint.title || getCategoryKey(complaint)}</b>
                          <small>{getLocationText(complaint.location)}</small>
                        </span>
                        <span className={`status status-${normalizeStatus(complaint.status).replace(/\s+/g, "-")}`}>
                          {complaint.status || "Pending"}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </>}

          {tab === "departments" && <>
            <SectionTitle
              eyebrow="SERVICE TEAMS"
              title="Municipal Departments"
              subtitle="Department-wise complaint overview based on report categories."
            />

            <div className="department-grid">
              {departmentRows.length === 0 ? (
                <div className="panel empty-state">
                  No department complaint data is available yet.
                </div>
              ) : departmentRows.map(d => {
                const Icon = d.icon;

                return (
                  <motion.article
                    className="department-card"
                    key={d.name}
                    whileHover={{ y: -4 }}
                  >
                    <div className="dept-icon"><Icon size={20} /></div>
                    <h3>{d.name}</h3>

                    <div className="dept-total">
                      <b>{d.total}</b>
                      <span>Total complaints</span>
                    </div>

                    <div className="dept-stats">
                      <div><span>Pending</span><strong>{d.pending}</strong></div>
                      <div><span>In Progress</span><strong>{d.progress}</strong></div>
                      <div><span>Resolved</span><strong>{d.resolved}</strong></div>
                    </div>

                    <div className="department-progress">
                      <div><span>Resolution rate</span><b>{d.rate}%</b></div>
                      <div className="metric-track">
                        <i style={{ width: `${d.rate}%` }} />
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </>}

          {tab === "audit" && <>
            <SectionTitle
              eyebrow="ADMINISTRATION"
              title="Admin Activity"
              subtitle="Status changes made from this browser are stored in its local activity history."
              right={
                <button
                  className="btn btn-light"
                  onClick={() => {
                    setAuditLogs([]);
                    notify("Local activity history cleared");
                  }}
                  disabled={!auditLogs.length}
                >
                  <Trash2 size={15} /> Clear history
                </button>
              }
            />

            <section className="panel panel-pad">
              <div className="activity-heading">
                <div>
                  <h3>Activity History</h3>
                  <p>{auditLogs.length} recorded actions</p>
                </div>
              </div>

              {!auditLogs.length ? (
                <div className="empty-state">
                  No admin activity recorded in this browser yet.
                </div>
              ) : (
                <div className="activity-list">
                  {auditLogs.map(log => (
                    <div className="audit-row" key={log.id}>
                      <div className="audit-icon"><FileText size={16} /></div>
                      <div className="audit-copy">
                        <b>{log.action}</b>
                        <p>{log.category} · {log.location}</p>
                        <small>
                          {log.admin} · {new Date(log.createdAt).toLocaleString()}
                        </small>
                      </div>
                      <span className="audit-id">
                        #{String(log.complaintId || "").slice(-6)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="notice">
              <AlertCircle size={16} />
              This activity list is stored in this browser only. It is not a server-side audit log.
            </div>
          </>}
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div
              className="toast"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
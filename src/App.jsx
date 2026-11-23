import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Truck,
  X,
  Mail,
  Route,
  PackageCheck,
  Settings,
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Save,
  LoaderCircle,
  History,
  Users,
  Globe2,
} from "lucide-react";

import { auth, db } from "./firebase/firebase";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

const headingStyle = {
  fontFamily: "'Playfair Display', serif",
};

const DEFAULT_CONTENT = {
  business_name: "RB Transport",
  tagline: "Moving Goods. Building Trust.",
  hero_title: "Your goods. Our responsibility.",
  hero_text:
    "Reliable goods pickup and delivery for businesses across Odisha, Andhra Pradesh and Telangana. We bring experience, care and commitment to every journey.",
  story_title: "A family legacy on the road since 1970.",
  story_text:
    "RB Transport began with six lorries and a simple belief: work hard, keep your word, and treat every customer with care. Generations of dedication have kept our family in the transport business. Today, we continue that journey with our TATA 12-tyre and Ashok Leyland 14-tyre lorries, serving businesses across three states.",
  owner_name: "Raghunath",
  owner_message:
    "Every consignment matters because every customer has a business to run. We work to make your goods journey dependable, with careful handling, clear communication and service you can trust. Thank you for being part of our journey.",
  service_states: "Odisha, Andhra Pradesh and Telangana",
  address: "Jayapur, Koraput District, Odisha 764001",
  phone_one: "6303093950",
  phone_two: "9438022009",
  email: "rajanaraghunath19@gmail.com",
  footer_message: "You focus on your business. We take care of the journey.",
  since_year: "1970",
};

const INITIAL_VEHICLES = [
  {
    id: "demo-tata",
    name: "TATA 12-Tyre Lorry",
    brand: "TATA",
    tyre_count: 12,
    description:
      "A heavy goods vehicle for dependable transport of business consignments.",
    image_url: "/tata-12-tyre.png",
    sort_order: 1,
    is_visible: true,
  },
  {
    id: "demo-leyland",
    name: "Ashok Leyland 14-Tyre Lorry",
    brand: "Ashok Leyland",
    tyre_count: 14,
    description:
      "A heavy-duty lorry for moving goods to customer destinations with care.",
    image_url: "/ashok-leyland-14-tyre.png",
    sort_order: 2,
    is_visible: true,
  },
];

function safePhone(phone) {
  return (phone || "").replace(/[^\d+]/g, "");
}

function SectionLabel({ children }) {
  return (
    <div className="section-label">
      <span />
      {children}
    </div>
  );
}

function Logo({ light = false }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="/"
      aria-label="RB Transport home"
    >
      <img src="/RB.png" alt="RB Transport Logo" className="brand-image" />
    </a>
  );
}

/* Truck illustration - used as fallback when an image is unavailable */
function TruckArtwork({ number = "12", brand = "TATA" }) {
  return (
    <div
      className="truck-art"
      aria-label={`${brand} ${number}-tyre goods lorry illustration`}
    >
      <div className="art-sky">
        <span className="sun" />
        <span className="road-line" />
      </div>

      <div className="art-truck">
        <div className="cargo">
          <span className="cargo-stripe" />
          <span className="cargo-label">RB TRANSPORT</span>
        </div>

        <div className="cab">
          <div className="cab-window" />
          <div className="cab-grill" />
          <div className="cab-light" />
        </div>

        <div className="wheel wheel-one" />
        <div className="wheel wheel-two" />
        <div className="wheel wheel-three" />
        <div className="wheel wheel-four" />
      </div>

      <span className="art-caption">
        {brand.toUpperCase()} · {number}-TYRE
      </span>
    </div>
  );
}

function VehicleVisual({ vehicle }) {
  return vehicle.image_url ? (
    <img
      className="vehicle-photo"
      src={vehicle.image_url}
      alt={vehicle.name}
      loading="lazy"
    />
  ) : (
    <TruckArtwork
      number={vehicle.tyre_count || "12"}
      brand={vehicle.brand || "RB Transport"}
    />
  );
}

/* ADMIN LOGIN */
function AdminGate({
  user,
  allowed,
  onNavigate,
  onSignIn,
  onSignOut,
  onRefresh,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!user || !allowed) {
    return (
      <div className="admin-screen">
        <div className="admin-login-card">
          <button className="back-home" onClick={() => onNavigate("home")}>
            ← Back to website
          </button>

          <Logo />

          <div className="admin-login-icon">
            <LogIn size={25} />
          </div>

          <h1>Admin sign in</h1>

          <p>Sign in using your approved RB Transport administrator account.</p>

          <form className="admin-login-form" onSubmit={submit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="form-error">{error}</div>}

            <button className="button button-dark full-width" disabled={busy}>
              {busy ? (
                <LoaderCircle className="spin" size={18} />
              ) : (
                <LogIn size={17} />
              )}
              Sign in securely
            </button>
          </form>

          <small className="admin-secure-note">
            <ShieldCheck size={14} />
            Only approved admins can edit website data.
          </small>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboard
      onNavigate={onNavigate}
      onSignOut={onSignOut}
      onRefresh={onRefresh}
    />
  );
}

/* ADMIN DASHBOARD */
function AdminDashboard({ onNavigate, onSignOut, onRefresh }) {
  const [tab, setTab] = useState("content");
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [vehicles, setVehicles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);

  const blankVehicle = {
    name: "",
    brand: "",
    tyre_count: 12,
    description: "",
    sort_order: 1,
    is_visible: true,
    image_url: "",
  };

  const [form, setForm] = useState(blankVehicle);

  async function load() {
    try {
      const s = await getDoc(doc(db, "website_content", "settings"));

      if (s.exists()) {
        setContent({
          ...DEFAULT_CONTENT,
          ...s.data(),
        });
      }

      const snap = await getDocs(
        query(collection(db, "vehicles"), orderBy("sort_order")),
      );

      setVehicles(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function editVehicle(v) {
    setEditing(v?.id || null);

    setForm(
      v
        ? { ...blankVehicle, ...v }
        : { ...blankVehicle, sort_order: vehicles.length + 1 },
    );
  }

  async function saveContent(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await setDoc(doc(db, "website_content", "settings"), content);

      setNotice("Website content saved.");

      await load();
      await onRefresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveVehicle(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const data = {
        ...form,
        tyre_count: Number(form.tyre_count),
        sort_order: Number(form.sort_order),
      };

      if (editing) {
        await updateDoc(doc(db, "vehicles", editing), data);
      } else {
        await addDoc(collection(db, "vehicles"), data);
      }

      setNotice(editing ? "Vehicle updated." : "Vehicle added.");
      setEditing(null);
      setForm({
        ...blankVehicle,
        sort_order: vehicles.length + 2,
      });

      await load();
      await onRefresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function removeVehicle(id) {
    if (!window.confirm("Delete this vehicle?")) return;

    try {
      await deleteDoc(doc(db, "vehicles", id));
      setNotice("Vehicle deleted.");
      await load();
      await onRefresh();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleVehicle(v) {
    try {
      await updateDoc(doc(db, "vehicles", v.id), {
        is_visible: !v.is_visible,
      });

      await load();
      await onRefresh();
    } catch (e) {
      setError(e.message);
    }
  }

  const field = (key, label, wide = false, multiline = false) => (
    <label className={wide ? "wide" : ""} key={key}>
      {label}

      {multiline ? (
        <textarea
          rows="4"
          value={content[key] || ""}
          onChange={(e) =>
            setContent((p) => ({
              ...p,
              [key]: e.target.value,
            }))
          }
        />
      ) : (
        <input
          value={content[key] || ""}
          onChange={(e) =>
            setContent((p) => ({
              ...p,
              [key]: e.target.value,
            }))
          }
        />
      )}
    </label>
  );

  return (
    <div className="dashboard">
      <aside className="admin-sidebar">
        <Logo light />

        <div className="sidebar-label">WEBSITE MANAGEMENT</div>

        <button
          className={`sidebar-link ${tab === "content" ? "active" : ""}`}
          onClick={() => setTab("content")}
        >
          <Pencil size={18} />
          Edit website content
        </button>

        <button
          className={`sidebar-link ${tab === "fleet" ? "active" : ""}`}
          onClick={() => setTab("fleet")}
        >
          <Truck size={18} />
          Manage fleet
        </button>

        <div className="sidebar-bottom">
          <span>
            <ShieldCheck size={16} />
            Admin access
          </span>

          <button onClick={onSignOut}>
            <LogOut size={17} />
            Sign out
          </button>

          <button onClick={() => onNavigate("home")}>
            <ArrowUpRight size={17} />
            View public site
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-kicker">RB TRANSPORT / ADMIN</span>

            <h1>
              {tab === "content" ? "Website content" : "Fleet management"}
            </h1>

            <p>Manage your public website from one place.</p>
          </div>

          <button
            className="button button-outline"
            onClick={() => onNavigate("home")}
          >
            View website <ArrowUpRight size={16} />
          </button>
        </header>

        {notice && (
          <div className="dashboard-notice success">
            <CheckCircle2 size={17} />
            {notice}
          </div>
        )}

        {error && <div className="dashboard-notice error">{error}</div>}

        {tab === "content" ? (
          <form className="editor-panel" onSubmit={saveContent}>
            <div className="panel-heading">
              <div>
                <h2>Business information</h2>
                <p>Changes here update the public website.</p>
              </div>

              <button className="button button-dark" disabled={busy}>
                {busy ? (
                  "Saving…"
                ) : (
                  <>
                    <Save size={17} />
                    Save changes
                  </>
                )}
              </button>
            </div>

            <div className="form-grid">
              {field("business_name", "Business name")}
              {field("tagline", "Tagline")}
              {field("hero_title", "Homepage headline", true)}
              {field("hero_text", "Homepage introduction", true, true)}
              {field("story_title", "Our story heading", true)}
              {field("story_text", "Our story", true, true)}
              {field("owner_name", "Owner name")}
              {field("since_year", "Since year")}
              {field("owner_message", "Owner's message", true, true)}
              {field("service_states", "Service states", true)}
              {field("address", "Address", true)}
              {field("phone_one", "Phone number 1")}
              {field("phone_two", "Phone number 2")}
              {field("email", "Business email", true)}
              {field("footer_message", "Footer message", true)}
            </div>

            <div className="form-bottom">
              <span>
                <ShieldCheck size={16} />
                Only approved admins can save changes.
              </span>

              <button className="button button-dark" disabled={busy}>
                {busy ? "Saving…" : "Save all content"}
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        ) : (
          <div className="fleet-admin-layout">
            <div className="panel-heading">
              <div>
                <h2>Your vehicles</h2>
                <p>Add lorries, update photo URLs, or hide vehicles.</p>
              </div>

              <button
                className="button button-dark"
                onClick={() => editVehicle(null)}
              >
                <Plus size={17} />
                Add vehicle
              </button>
            </div>

            <div className="admin-fleet-list">
              {vehicles.map((v) => (
                <div className="admin-fleet-row" key={v.id}>
                  <div className="admin-fleet-thumb">
                    {v.image_url ? (
                      <img src={v.image_url} alt={v.name} />
                    ) : (
                      <Truck size={28} />
                    )}
                  </div>

                  <div className="admin-fleet-info">
                    <strong>{v.name}</strong>
                    <span>
                      {v.brand} · {v.tyre_count}-tyre ·
                      {v.is_visible ? "Visible" : "Hidden"}
                    </span>
                  </div>

                  <button
                    className="mini-action"
                    onClick={() => toggleVehicle(v)}
                  >
                    {v.is_visible ? "Hide" : "Publish"}
                  </button>

                  <button
                    className="mini-action"
                    onClick={() => editVehicle(v)}
                    aria-label="Edit vehicle"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    className="mini-action danger"
                    onClick={() => removeVehicle(v.id)}
                    aria-label="Delete vehicle"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {vehicles.length === 0 && (
                <div className="empty-admin">
                  No vehicles yet. Add your first lorry.
                </div>
              )}
            </div>

            <form
              className="editor-panel vehicle-editor"
              onSubmit={saveVehicle}
            >
              <div className="panel-heading">
                <div>
                  <h2>{editing ? "Edit vehicle" : "Add a vehicle"}</h2>
                  <p>Vehicle details and image URL.</p>
                </div>

                {editing && (
                  <button
                    type="button"
                    className="button button-outline"
                    onClick={() => editVehicle(null)}
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="form-grid">
                <label>
                  Vehicle name
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Brand
                  <input
                    value={form.brand}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        brand: e.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label>
                  Tyre count
                  <select
                    value={form.tyre_count}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        tyre_count: e.target.value,
                      }))
                    }
                  >
                    {[6, 10, 12, 14, 16, 18, 22].map((n) => (
                      <option key={n} value={n}>
                        {n} tyre
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Display order
                  <input
                    type="number"
                    min="1"
                    value={form.sort_order}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        sort_order: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="wide">
                  Description
                  <textarea
                    rows="3"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                  />
                </label>

                <label className="wide">
                  Vehicle image URL
                  <input
                    type="url"
                    placeholder="https://..."
                    value={form.image_url}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        image_url: e.target.value,
                      }))
                    }
                  />
                </label>

                {form.image_url && (
                  <div className="wide photo-preview">
                    <img src={form.image_url} alt="Vehicle preview" />
                  </div>
                )}

                <label className="checkbox-label wide">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        is_visible: e.target.checked,
                      }))
                    }
                  />
                  Show this vehicle on public website
                </label>
              </div>

              <div className="form-bottom">
                <span>
                  Images can be hosted on an image hosting service and pasted
                  above.
                </span>

                <button className="button button-dark" disabled={busy}>
                  {busy ? (
                    "Saving…"
                  ) : (
                    <>
                      <Save size={16} />
                      {editing ? "Update vehicle" : "Add vehicle"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="dashboard-footnote">
          <ShieldCheck size={17} />
          <span>
            Firestore security rules protect admin-only updates. Never expose
            private credentials in frontend code.
          </span>
        </div>
      </main>
    </div>
  );
}

/* REAL VEHICLE IMAGE GALLERY */
function FleetSection() {
  const fleet = [
    {
      name: "TATA Heavy Cargo",
      type: "12-Tyre Lorry",
      description:
        "Reliable heavy-duty transportation for goods across Odisha, Andhra Pradesh, and Telangana.",
      image: "/tata-12-tyre.png",
      number: "01",
    },
    {
      name: "Ashok Leyland",
      type: "14-Tyre Lorry",
      description:
        "Built for long-distance transportation and dependable delivery of different types of goods.",
      image: "/ashok-leyland-14-tyre.png",
      number: "02",
    },
  ];

  return (
    <section className="rb-fleet-section" id="rb-fleet-gallery">
      <div className="rb-fleet-container">
        <div className="rb-fleet-heading">
          <span className="rb-fleet-eyebrow">OUR TRANSPORT FLEET</span>

          <h2 style={headingStyle}>
            Strength on the road.
            <br />
            <span style={headingStyle}>Trust in every journey.</span>
          </h2>

          <p>
            Our fleet is ready to move your goods safely and reliably across
            multiple destinations.
          </p>
        </div>

        <div className="rb-fleet-grid">
          {fleet.map((vehicle) => (
            <article className="rb-fleet-card" key={vehicle.number}>
              <div className="rb-fleet-image">
                <img src={vehicle.image} alt={vehicle.name} loading="lazy" />

                <span className="rb-fleet-number">{vehicle.number}</span>
              </div>

              <div className="rb-fleet-info">
                <span className="rb-fleet-type">{vehicle.type}</span>

                <h3>{vehicle.name}</h3>

                <p>{vehicle.description}</p>

                <a href="#contact" className="rb-fleet-link">
                  Transport enquiry <span>↗</span>
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="rb-fleet-bottom">
          <span>RELIABLE TRANSPORTATION</span>
          <span>ODISHA · ANDHRA PRADESH · TELANGANA</span>
        </div>
      </div>
    </section>
  );
}

/* MAIN WEBSITE */
export default function App() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState(
    window.location.pathname.startsWith("/admin") ? "admin" : "home",
  );
  const [user, setUser] = useState(null);
  const [adminAllowed, setAdminAllowed] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function loadPublic() {
      try {
        const settingsSnap = await getDoc(
          doc(db, "website_content", "settings"),
        );

        if (settingsSnap.exists() && alive) {
          setContent((p) => ({
            ...p,
            ...settingsSnap.data(),
          }));
        }

        const snap = await getDocs(
          query(collection(db, "vehicles"), orderBy("sort_order")),
        );

        if (alive && snap.docs.length) {
          setVehicles(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            })),
          );
        }
      } catch (e) {
        if (alive) {
          setError("Unable to load Firebase content: " + e.message);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadPublic();

    const unsub = onAuthStateChanged(auth, (u) => {
      if (alive) setUser(u);
    });

    return () => {
      alive = false;
      unsub();
    };
  }, []);

  useEffect(() => {
    const pop = () => {
      setRoute(
        window.location.pathname.startsWith("/admin") ? "admin" : "home",
      );
    };

    window.addEventListener("popstate", pop);

    return () => window.removeEventListener("popstate", pop);
  }, []);

  useEffect(() => {
    let active = true;

    async function check() {
      if (!user) {
        setAdminAllowed(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "admins", user.uid));

        if (active) {
          setAdminAllowed(snap.exists());
        }
      } catch {
        if (active) {
          setAdminAllowed(false);
        }
      }
    }

    check();

    return () => {
      active = false;
    };
  }, [user]);

  const visibleVehicles = useMemo(
    () =>
      vehicles
        .filter((v) => v.is_visible !== false)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    [vehicles],
  );

  function navigate(next) {
    const path = next === "admin" ? "/admin" : "/";

    window.history.pushState({}, "", path);
    setRoute(next);
    setMenuOpen(false);
    setNotice("");
    setError("");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function refreshPublic() {
    try {
      const s = await getDoc(doc(db, "website_content", "settings"));

      if (s.exists()) {
        setContent((p) => ({
          ...p,
          ...s.data(),
        }));
      }

      const snap = await getDocs(
        query(collection(db, "vehicles"), orderBy("sort_order")),
      );

      setVehicles(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })),
      );
    } catch (e) {
      setError(e.message);
    }
  }

  if (route === "admin") {
    return (
      <AdminGate
        user={user}
        allowed={adminAllowed}
        onNavigate={navigate}
        onSignIn={() => {}}
        onSignOut={() => signOut(auth)}
        onRefresh={refreshPublic}
      />
    );
  }

  return (
    <div className="site-shell">
      {/* TOPBAR */}
      <div className="topbar">
        <div className="container topbar-inner">
          <span>
            <MapPin size={14} />
            {content.address}
          </span>

          <div className="topbar-right">
            <span>
              <Clock3 size={14} />
              Family transport business since {content.since_year}
            </span>

            <a href={`mailto:${content.email}`}>
              <Mail size={14} />
              {content.email}
            </a>
          </div>
        </div>
      </div>

      {/* HEADER */}
      <header className="site-header">
        <div className="container nav-wrap">
          <Logo />

          <nav
            className={menuOpen ? "nav-links open" : "nav-links"}
            aria-label="Main navigation"
          >
            <a onClick={() => setMenuOpen(false)} href="#home">
              Home
            </a>
            <a onClick={() => setMenuOpen(false)} href="#about">
              Our Story
            </a>
            <a onClick={() => setMenuOpen(false)} href="#fleet">
              Our Fleet
            </a>
            <a onClick={() => setMenuOpen(false)} href="#services">
              Services
            </a>
            <a onClick={() => setMenuOpen(false)} href="#contact">
              Contact
            </a>

            <a
              className="nav-call"
              href={`tel:${safePhone(content.phone_one)}`}
            >
              <Phone size={16} />
              Call Us
            </a>
          </nav>

          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="hero hero-video-banner" id="home">
          <video
            className="hero-background-video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1600"
            aria-hidden="true"
          >
            <source
              src="https://videos.pexels.com/video-files/30103976/12911334_3840_2160_30fps.mp4"
              type="video/mp4"
            />
          </video>

          <div className="hero-video-shade" />

          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                FAMILY TRANSPORT BUSINESS SINCE {content.since_year}
              </div>

              <h1 style={headingStyle}>
                {content.hero_title}
                <span className="title-period">.</span>
              </h1>

              <p className="hero-lead">{content.hero_text}</p>

              <div className="hero-actions">
                <a className="button button-orange" href="#contact">
                  Discuss Your Transport Needs
                  <ArrowRight size={18} />
                </a>

                <a className="button button-ghost" href="#fleet">
                  Explore Our Fleet
                  <ArrowUpRight size={17} />
                </a>
              </div>

              <div className="hero-trust">
                <div className="trust-icon">
                  <ShieldCheck size={21} />
                </div>

                <div>
                  <strong>Every consignment matters.</strong>
                  <span>
                    Care and responsibility from pickup to destination.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-video-caption">
            <span className="hero-caption-line" />
            MOVING GOODS. BUILDING TRUST. SINCE {content.since_year}
          </div>
        </section>

        {/* PROMISE STRIP */}
        <section className="promise-strip">
          <div className="container promise-grid">
            <div className="promise-item">
              <span className="promise-icon">
                <PackageCheck />
              </span>
              <div>
                <strong>Careful Handling</strong>
                <small>Your goods matter to us</small>
              </div>
            </div>

            <div className="promise-item">
              <span className="promise-icon">
                <Route />
              </span>
              <div>
                <strong>Pickup to Destination</strong>
                <small>Transport made simpler</small>
              </div>
            </div>

            <div className="promise-item">
              <span className="promise-icon">
                <ShieldCheck />
              </span>
              <div>
                <strong>Dependable Service</strong>
                <small>Responsibility every journey</small>
              </div>
            </div>

            <div className="promise-item">
              <span className="promise-icon">
                <History />
              </span>
              <div>
                <strong>Since {content.since_year}</strong>
                <small>A family transport legacy</small>
              </div>
            </div>
          </div>
        </section>

        {/* OUR STORY */}
        <section className="section about-section" id="about">
          <div className="container about-grid">
            {/* REAL TATA TRUCK PHOTO */}
            <div className="about-visual">
              <div className="about-photo-card">
                <div className="about-photo-main">
                  <img
                    src="/tata-12-tyre.png"
                    alt="RB Transport TATA 12 tyre lorry"
                    className="journey-real-truck"
                  />
                </div>

                <div className="legacy-stamp">
                  <History size={22} />
                  <strong>SINCE</strong>
                  <b>{content.since_year}</b>
                </div>

                <div className="about-visual-caption">
                  <span>OUR FAMILY'S JOURNEY</span>
                  <span>01 / 03</span>
                </div>
              </div>

              <div className="about-vertical-label">
                GENERATIONS OF DEDICATION
              </div>
            </div>

            {/* STORY CONTENT */}
            <div className="about-copy">
              <SectionLabel>OUR STORY</SectionLabel>

              <h2 style={headingStyle}>{content.story_title}</h2>

              <p>{content.story_text}</p>

              <div className="story-points">
                <div>
                  <span className="story-check">
                    <CheckCircle2 size={18} />
                  </span>

                  <span>
                    <strong>Experience that matters</strong>
                    <small>
                      A family legacy built through years of hard work.
                    </small>
                  </span>
                </div>

                <div>
                  <span className="story-check">
                    <CheckCircle2 size={18} />
                  </span>

                  <span>
                    <strong>Customers come first</strong>
                    <small>
                      Every load is handled with care and responsibility.
                    </small>
                  </span>
                </div>

                <div>
                  <span className="story-check">
                    <CheckCircle2 size={18} />
                  </span>

                  <span>
                    <strong>Growing for tomorrow</strong>
                    <small>
                      Building stronger relationships with every journey.
                    </small>
                  </span>
                </div>
              </div>

              <div className="signature">
                <span className="signature-line" />

                <span>
                  <strong>{content.owner_name}</strong>
                  <small>Owner, RB Transport</small>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* REAL TRUCK PHOTO GALLERY */}
        <FleetSection />

        {/* FLEET SECTION */}
        <section className="section fleet-section" id="fleet">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <SectionLabel>OUR FLEET</SectionLabel>

                <h2>
                  Ready for the road.
                  <br />
                  <span>Committed to your cargo.</span>
                </h2>
              </div>

              <p>
                Our vehicles help us move your goods with care and
                responsibility. As our business grows, we'll continue to expand
                our fleet to serve you better.
              </p>
            </div>

            <div className="fleet-grid">
              {visibleVehicles.length ? (
                visibleVehicles.map((v, i) => (
                  <article className="fleet-card" key={v.id}>
                    <div className="fleet-card-image">
                      <span className="fleet-index">0{i + 1}</span>

                      <VehicleVisual vehicle={v} />

                      <span className="fleet-type">
                        {v.tyre_count || "Heavy"} TYRE
                      </span>
                    </div>

                    <div className="fleet-card-body">
                      <div className="fleet-brand">
                        {v.brand || "RB Transport"}
                        <span>·</span>
                        GOODS VEHICLE
                      </div>

                      <h3>{v.name}</h3>

                      <p>
                        {v.description ||
                          "Reliable transport for your business consignments."}
                      </p>

                      <div className="fleet-card-bottom">
                        <span>
                          <CheckCircle2 size={16} />
                          Part of our fleet
                        </span>

                        <a
                          href="#contact"
                          aria-label={`Enquire about ${v.name}`}
                        >
                          <ArrowUpRight size={19} />
                        </a>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="empty-fleet">
                  Our fleet details will be updated soon. Please contact us for
                  transport enquiries.
                </div>
              )}
            </div>

            <div className="fleet-note">
              <span className="fleet-note-icon">
                <Truck size={20} />
              </span>

              <p>
                <strong>Our fleet is growing.</strong>
                As we add more vehicles, we'll update this page so you can see
                our latest transport capabilities.
              </p>

              <a href="#contact">
                Talk to our team <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* SERVICE AREAS */}
        <section className="service-section" id="services">
          <div className="container service-grid">
            <div className="service-copy">
              <SectionLabel>WHERE WE OPERATE</SectionLabel>

              <h2 style={headingStyle}>
                Your business moves.
                <br />
                <span style={headingStyle}>We move with you.</span>
              </h2>

              <p>
                From collecting goods at your required location to delivering
                them to their destination, RB Transport helps businesses move
                their consignments across our service region.
              </p>

              <div className="service-checks">
                <span>
                  <CheckCircle2 size={17} /> Goods pickup
                </span>
                <span>
                  <CheckCircle2 size={17} /> Destination delivery
                </span>
                <span>
                  <CheckCircle2 size={17} /> Business transport support
                </span>
              </div>

              <a className="button button-orange" href="#contact">
                Plan a Delivery <ArrowRight size={18} />
              </a>
            </div>

            <div className="regions-card">
              <div className="regions-card-header">
                <span className="regions-pin">
                  <MapPin size={20} />
                </span>

                <div>
                  <strong>Our service region</strong>
                  <small>Three states. One commitment.</small>
                </div>
              </div>

              <div className="region-list">
                <div className="region-row">
                  <span className="region-number">01</span>
                  <span className="region-name">Odisha</span>
                  <span className="region-status">SERVICE AREA</span>
                </div>

                <div className="region-row">
                  <span className="region-number">02</span>
                  <span className="region-name">Andhra Pradesh</span>
                  <span className="region-status">SERVICE AREA</span>
                </div>

                <div className="region-row">
                  <span className="region-number">03</span>
                  <span className="region-name">Telangana</span>
                  <span className="region-status">SERVICE AREA</span>
                </div>
              </div>

              <div className="region-footer">
                <Globe2 size={17} />
                <span>
                  Need a pickup or delivery? Contact us to discuss your route.
                </span>
              </div>

              <div className="region-deco">RB</div>
            </div>
          </div>
        </section>

        {/* OWNER MESSAGE */}
        <section className="owner-section">
          <div className="container owner-grid">
            <div className="owner-quote-mark">“</div>

            <div className="owner-message">
              <SectionLabel>A MESSAGE FROM THE OWNER</SectionLabel>

              <h2 style={headingStyle}>We value your trust as much as your goods.</h2>

              <p>{content.owner_message}</p>

              <div className="owner-sign">
                <span className="owner-sign-rule" />

                <span>
                  <strong>{content.owner_name}</strong>
                  <small>Owner, RB Transport</small>
                </span>
              </div>
            </div>

            <div className="owner-side-note">
              <div className="owner-side-icon">
                <Users size={24} />
              </div>

              <strong>Our promise to you</strong>

              <p>
                Personal responsibility. Dependable service. A relationship
                built to last.
              </p>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-section" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy">
              <SectionLabel>LET'S GET MOVING</SectionLabel>

              <h2 style={headingStyle}>
                Have goods to move?
                <br />
                <span style={headingStyle}>Let's talk.</span>
              </h2>

              <p>
                Tell us what you need to transport, where it needs to go, and
                when you need it. We'll be happy to discuss your requirements.
              </p>

              <div className="contact-promise">
                <ShieldCheck size={19} />
                <span>
                  Direct contact. Clear conversation. Service with
                  responsibility.
                </span>
              </div>
            </div>

            <div className="contact-card">
              <div className="contact-card-top">
                <span>GET IN TOUCH</span>
                <ArrowUpRight size={20} />
              </div>

              <div className="contact-detail">
                <span className="contact-icon">
                  <Phone size={19} />
                </span>

                <div>
                  <small>CALL US</small>

                  <a href={`tel:${safePhone(content.phone_one)}`}>
                    {content.phone_one}
                  </a>

                  <a href={`tel:${safePhone(content.phone_two)}`}>
                    {content.phone_two}
                  </a>
                </div>
              </div>

              <div className="contact-detail">
                <span className="contact-icon">
                  <Mail size={19} />
                </span>

                <div>
                  <small>EMAIL US</small>
                  <a href={`mailto:${content.email}`}>{content.email}</a>
                </div>
              </div>

              <div className="contact-detail">
                <span className="contact-icon">
                  <MapPin size={19} />
                </span>

                <div>
                  <small>VISIT US</small>
                  <p>{content.address}</p>
                </div>
              </div>

              <a
                className="button button-orange contact-main-cta"
                href={`https://wa.me/${safePhone(content.phone_one).replace("+", "")}?text=${encodeURIComponent("Hello RB Transport, I would like to enquire about goods transportation.")}`}
                target="_blank"
                rel="noreferrer"
              >
                Enquire on WhatsApp
                <ArrowUpRight size={18} />
              </a>

              <small className="contact-response-note">
                For route availability and transport details, please contact us
                directly.
              </small>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand-col">
            <Logo light />

            <p>{content.footer_message}</p>

            <span className="footer-since">
              A FAMILY TRANSPORT BUSINESS SINCE {content.since_year}
            </span>
          </div>

          <div className="footer-links">
            <strong>EXPLORE</strong>
            <a href="#about">Our Story</a>
            <a href="#fleet">Our Fleet</a>
            <a href="#services">Service Areas</a>
            <a href="#contact">Contact Us</a>
          </div>

          <div className="footer-links">
            <strong>OUR SERVICE REGION</strong>
            <span>Odisha</span>
            <span>Andhra Pradesh</span>
            <span>Telangana</span>
          </div>

          <div className="footer-contact">
            <strong>CONTACT</strong>

            <a href={`tel:${safePhone(content.phone_one)}`}>
              <Phone size={15} />
              {content.phone_one}
            </a>

            <a href={`mailto:${content.email}`}>
              <Mail size={15} />
              {content.email}
            </a>

            <span>
              <MapPin size={15} />
              {content.address}
            </span>
          </div>
        </div>

        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} RB Transport. All rights reserved.
          </span>

          <span>Moving Goods. Building Trust.</span>

          <button onClick={() => navigate("admin")} className="admin-link">
            <Settings size={13} />
            Admin
          </button>
        </div>
      </footer>

      {notice && (
        <div className="toast toast-success">
          <CheckCircle2 size={18} />
          {notice}
        </div>
      )}

      {error && <div className="toast toast-error">{error}</div>}

      {loading && (
        <div className="loading-bar">
          <span />
        </div>
      )}
    </div>
  );
}

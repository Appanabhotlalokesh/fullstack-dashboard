import { useEffect, useState } from "react";
import API from "../services/api";

const BASE_URL = "http://localhost:8001";

const getImageList = (images) => {
  if (!images) return [];
  const list = Array.isArray(images)
    ? images
    : String(images).split(",").filter(Boolean);
  return list.map((src) => src.startsWith("http") ? src : `${BASE_URL}${src}`);
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const [newProduct, setNewProduct] = useState({
    brand_name: "",
    model: "",
    price: "",
    ram: "",
    rom: "",
    images: [],
  });

  /* LOAD DATA */
  useEffect(() => {
    API.get("/admin/users/").then((res) => setUsers(res.data));
    API.get("/products/").then((res) => { setProducts(res.data); setAllProducts(res.data); });
  }, []);

  /* FILTER */
  useEffect(() => {
    let filtered = [...allProducts];
    if (searchText) filtered = filtered.filter((p) =>
      `${p.brand_name} ${p.model}`.toLowerCase().includes(searchText.toLowerCase())
    );
    if (selectedRam) filtered = filtered.filter((p) => p.ram === selectedRam);
    if (selectedStorage) filtered = filtered.filter((p) => p.rom === selectedStorage);
    setProducts(filtered);
  }, [searchText, selectedRam, selectedStorage, allProducts]);

  /* LOGOUT */
  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  /* OPEN PRODUCT DETAIL IN NEW TAB */
  const openProductDetail = (product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.open("/product-detail", "_blank");
  };

  /* ADD PRODUCT */
  const handleAddProduct = () => {
    API.post("/products/", newProduct)
      .then(() => { alert("Product Added Successfully"); window.location.reload(); })
      .catch((err) => { console.log(err.response?.data); alert("Error Adding Product"); });
  };

  /* IMAGE CAROUSEL */
  const CardCarousel = ({ images }) => {
    const [idx, setIdx] = useState(0);
    const list = getImageList(images);

    if (!list.length) return <div className="card-no-img">No Image</div>;

    const prev = (e) => { e.stopPropagation(); setIdx((i) => (i - 1 + list.length) % list.length); };
    const next = (e) => { e.stopPropagation(); setIdx((i) => (i + 1) % list.length); };

    return (
      <div className="carousel-wrap">
        {list.length > 1 && (
          <button className="carousel-arrow carousel-arrow--left" onClick={prev}>&#8249;</button>
        )}
        <img key={idx} src={list[idx]} className="card-img carousel-img" alt={`product-${idx}`} />
        {list.length > 1 && (
          <button className="carousel-arrow carousel-arrow--right" onClick={next}>&#8250;</button>
        )}
        {list.length > 1 && (
          <div className="carousel-dots">
            {list.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${i === idx ? "carousel-dot--active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        )}
        {list.length > 1 && (
          <div className="carousel-counter">{idx + 1} / {list.length}</div>
        )}
      </div>
    );
  };

  /* PRODUCT CARD — view only, no cart / wishlist / buy */
  const ProductCard = ({ p }) => (
    <div className="card">
      <div
        className="card-img-wrap"
        onClick={() => openProductDetail(p)}
        style={{ cursor: "pointer" }}
        title="Click to view details"
      >
        <CardCarousel images={p.images} />
      </div>
      <div className="card-body">
        <h3 className="card-title">{p.brand_name} {p.model}</h3>
        <p className="card-specs">{p.ram} · {p.rom}</p>
        <p className="card-price">&#8377;{Number(p.price).toLocaleString("en-IN")}</p>
        <div className="card-id-badge">ID #{p.id}</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{globalStyles}</style>
      <div className="page">

        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-dot" />
            <h2 className="brand-title">AdminPanel</h2>
          </div>

          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {activeTab === "dashboard" ? (
              <input
                className="search-input"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            ) : (
              <input
                className="search-input"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            )}
          </div>

          <div className="nav-links">
            {["dashboard", "products", "add"].map((tab) => (
              <button
                key={tab}
                className={`nav-btn ${activeTab === tab ? "nav-btn--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "add" ? "+ Add" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </nav>

        <div className="layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            {activeTab === "dashboard" ? (
              <div className="admin-profile">
                <div className="admin-avatar-wrap">
                  <div className="admin-avatar">A</div>
                  <span className="admin-online-dot" />
                </div>
                <p className="admin-name">{user.username || "Administrator"}</p>
                <p className="admin-role-label">
                  {user.role ? `${user.role} · Admin Panel` : "Admin Panel"}
                </p>

                <div className="admin-divider" />

                <div className="admin-info-list">
                  <div className="admin-info-item">
                    <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                      <path d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{user.email || "admin@panel.com"}</span>
                  </div>
                  <div className="admin-info-item">
                    <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                      <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{allProducts.length} Products</span>
                  </div>
                  <div className="admin-info-item">
                    <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M2 17c0-3 2.7-5 6-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <path d="M15 11v6M12 14h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span>{users.filter(u => !u.is_staff && !u.is_superuser).length} Users</span>
                  </div>
                </div>

                <div className="admin-divider" />

                <div className="admin-stats-mini">
                  <div className="admin-mini-stat">
                    <span className="admin-mini-val">{allProducts.length}</span>
                    <span className="admin-mini-label">Products</span>
                  </div>
                  <div className="admin-mini-stat">
                    <span className="admin-mini-val">{users.filter(u => !u.is_staff && !u.is_superuser).length}</span>
                    <span className="admin-mini-label">Users</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="sidebar-section-label">Filters</p>

                <label className="sidebar-label">RAM</label>
                <select className="sidebar-select" value={selectedRam} onChange={(e) => setSelectedRam(e.target.value)}>
                  <option value="">All</option>
                  <option value="4GB">4 GB</option>
                  <option value="8GB">8 GB</option>
                  <option value="12GB">12 GB</option>
                  <option value="16GB">16 GB</option>
                </select>

                <label className="sidebar-label">Storage</label>
                <select className="sidebar-select" value={selectedStorage} onChange={(e) => setSelectedStorage(e.target.value)}>
                  <option value="">All</option>
                  <option value="64GB">64 GB</option>
                  <option value="128GB">128 GB</option>
                  <option value="256GB">256 GB</option>
                  <option value="512GB">512 GB</option>
                </select>

                <button className="clear-btn" onClick={() => { setSelectedRam(""); setSelectedStorage(""); setSearchText(""); }}>
                  Clear Filters
                </button>
              </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <path d="M13 14l3-4-3-4M16 10H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Logout
            </button>
          </aside>

          {/* MAIN */}
          <main className="main-content">

            {/* DASHBOARD */}
            {activeTab === "dashboard" && (
              <div>
                <h2 className="section-title">Dashboard</h2>

                <div className="stats-row">
                  <div className="stat-card">
                    <span className="stat-label">Total Products</span>
                    <span className="stat-value">{allProducts.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Total Users</span>
                    <span className="stat-value">{users.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Regular Users</span>
                    <span className="stat-value">{users.filter(u => !u.is_staff && !u.is_superuser).length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Staff / Admins</span>
                    <span className="stat-value">{users.filter(u => u.is_staff || u.is_superuser).length}</span>
                  </div>
                </div>

                {/* USERS TABLE */}
                <div className="users-section">
                  <div className="section-header" style={{ marginBottom: "16px" }}>
                    <h3 className="users-title">All Users</h3>
                    <span className="badge">{users.filter((u) => !u.is_staff && !u.is_superuser).length} registered</span>
                  </div>

                  {users.length === 0 ? (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                        <circle cx="12" cy="8" r="4" stroke="#d1d5db" strokeWidth="1.4"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                      <p>No users found</p>
                    </div>
                  ) : (
                    <div className="users-table">
                      <div className="users-thead">
                        <span>#</span>
                        <span>User</span>
                        <span>Email</span>
                        <span>Phone</span>
                        <span>Role</span>
                        <span>Joined</span>
                      </div>

                      {users
                        .filter((u) => !u.is_staff && !u.is_superuser)
                        .filter((u) => {
                          if (!userSearch) return true;
                          const q = userSearch.toLowerCase();
                          return (
                            (u.first_name || "").toLowerCase().includes(q) ||
                            (u.last_name || "").toLowerCase().includes(q) ||
                            (u.username || "").toLowerCase().includes(q) ||
                            (u.email || "").toLowerCase().includes(q) ||
                            (u.phone || u.phone_number || "").includes(q)
                          );
                        })
                        .map((u, i) => (
                          <div key={u.id ?? i} className="users-row">
                            <span className="u-index">{i + 1}</span>
                            <div className="u-user">
                              <div className="u-avatar">
                                {(u.first_name || u.username || u.email || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="u-name">
                                  {u.first_name && u.last_name
                                    ? `${u.first_name} ${u.last_name}`
                                    : u.username || "—"}
                                </p>
                                {u.username && u.first_name && (
                                  <p className="u-sub">@{u.username}</p>
                                )}
                              </div>
                            </div>
                            <span className="u-email">{u.email || "—"}</span>
                            <span className="u-phone">{u.phone || u.phone_number || "—"}</span>
                            <span className={`u-role-badge ${u.is_staff || u.is_superuser ? "u-role--admin" : "u-role--user"}`}>
                              {u.is_superuser ? "Superuser" : u.is_staff ? "Staff" : "User"}
                            </span>
                            <span className="u-joined">
                              {u.date_joined
                                ? new Date(u.date_joined).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCTS — view only */}
            {activeTab === "products" && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Products</h2>
                  <span className="badge">{products.length} items</span>
                </div>
                {products.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="#d1d5db" strokeWidth="1.4"/>
                      <path d="M9 12h6M12 9v6" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    <p>No products match your filters</p>
                    <button className="clear-btn" style={{ width: "auto", padding: "9px 24px" }}
                      onClick={() => { setSelectedRam(""); setSelectedStorage(""); setSearchText(""); }}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid">
                    {products.map((p) => <ProductCard key={p.id} p={p} />)}
                  </div>
                )}
              </>
            )}

            {/* ADD PRODUCT */}
            {activeTab === "add" && (
              <div>
                <h2 className="section-title">Add Product</h2>
                <div className="form-card">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Brand Name</label>
                      <input className="form-input" placeholder="e.g. Samsung"
                        onChange={(e) => setNewProduct({ ...newProduct, brand_name: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Model</label>
                      <input className="form-input" placeholder="e.g. Galaxy S24"
                        onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Price (&#8377;)</label>
                      <input className="form-input" placeholder="e.g. 49999"
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">RAM</label>
                      <input className="form-input" placeholder="e.g. 8GB"
                        onChange={(e) => setNewProduct({ ...newProduct, ram: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Storage</label>
                      <input className="form-input" placeholder="e.g. 128GB"
                        onChange={(e) => setNewProduct({ ...newProduct, rom: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Images</label>
                    <label className="file-drop">
                      <svg viewBox="0 0 24 24" fill="none" width="28" height="28">
                        <path d="M12 16V8M8 12l4-4 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                      <span>Click to upload images</span>
                      <span className="file-hint">PNG, JPG up to 10MB</span>
                      <input type="file" multiple style={{ display: "none" }}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          const formData = new FormData();
                          files.forEach((file) => formData.append("files", file));
                          const res = await fetch(`${BASE_URL}/upload-images`, { method: "POST", body: formData });
                          const data = await res.json();
                          setNewProduct((prev) => ({ ...prev, images: [...prev.images, ...data.urls] }));
                        }}
                      />
                    </label>
                  </div>

                  {newProduct.images.length > 0 && (
                    <div className="preview-row">
                      {newProduct.images.map((img, i) => (
                        <img key={i} src={`${BASE_URL}${img}`} className="preview-img" alt={`preview-${i}`} />
                      ))}
                    </div>
                  )}

                  <button className="add-btn" onClick={handleAddProduct}>Add Product</button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  body { font-family: 'DM Sans', sans-serif; }

  :root {
    --bg:        #f5f6fa;
    --surface:   #ffffff;
    --border:    #e5e7eb;
    --text:      #111827;
    --muted:     #6b7280;
    --accent:    #2563eb;
    --accent-dk: #1d4ed8;
    --green:     #16a34a;
    --red:       #dc2626;
    --nav-bg:    #0f172a;
    --nav-text:  #f8fafc;
    --radius:    10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);
  }

  .page { background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }

  /* NAVBAR */
  .navbar {
    height: 62px; background: var(--nav-bg); color: var(--nav-text);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; gap: 16px; position: sticky; top: 0; z-index: 100;
    border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .navbar-brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .brand-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); display: inline-block; }
  .brand-title { font-size: 17px; font-weight: 700; letter-spacing: -0.3px; color: var(--nav-text); }

  .search-wrap { flex: 1; max-width: 380px; position: relative; }
  .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); width: 16px; height: 16px; pointer-events: none; }
  .search-input {
    width: 100%; padding: 9px 14px 9px 36px;
    background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1);
    border-radius: var(--radius); color: var(--nav-text); font-size: 14px;
    font-family: inherit; outline: none; transition: border-color .2s, background .2s;
  }
  .search-input::placeholder { color: #94a3b8; }
  .search-input:focus { border-color: var(--accent); background: rgba(255,255,255,.1); }

  .nav-links { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }

  .nav-btn {
    padding: 7px 16px; border-radius: 7px; border: none;
    background: transparent; color: #94a3b8;
    font-family: inherit; font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: background .18s, color .18s; text-transform: capitalize;
  }
  .nav-btn:hover { background: rgba(255,255,255,.08); color: var(--nav-text); }
  .nav-btn--active { background: var(--accent); color: #fff; }
  .nav-btn--active:hover { background: var(--accent-dk); }

  /* LAYOUT */
  .layout { display: flex; flex: 1; overflow: hidden; }

  /* SIDEBAR */
  .sidebar {
    width: 232px; flex-shrink: 0; background: var(--surface);
    border-right: 1px solid var(--border); padding: 24px 16px;
    display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto;
  }
  .sidebar-section-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
  .sidebar-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text); margin-bottom: 5px; margin-top: 14px; }
  .sidebar-select {
    width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 7px;
    background: var(--bg); color: var(--text); font-family: inherit; font-size: 13.5px;
    outline: none; cursor: pointer; transition: border-color .18s;
  }
  .sidebar-select:focus { border-color: var(--accent); }
  .clear-btn {
    margin-top: 20px; width: 100%; padding: 9px; border: none; border-radius: 8px;
    background: var(--accent); color: #fff; font-family: inherit; font-size: 13.5px;
    font-weight: 600; cursor: pointer; transition: background .18s;
  }
  .clear-btn:hover { background: var(--accent-dk); }
  .logout-btn {
    display: flex; align-items: center; gap: 8px; width: 100%; padding: 10px;
    border: 1px solid #fee2e2; border-radius: 8px; background: #fff5f5;
    color: var(--red); font-family: inherit; font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: background .18s;
  }
  .logout-btn:hover { background: #fee2e2; }

  /* MAIN */
  .main-content { flex: 1; padding: 28px; overflow-y: auto; }
  .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  .section-title { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; margin-bottom: 20px; }
  .section-header .section-title { margin-bottom: 0; }
  .badge { padding: 3px 10px; border-radius: 20px; background: #eff6ff; color: var(--accent); font-size: 12.5px; font-weight: 600; }

  /* STATS */
  .stats-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 22px 28px; display: flex; flex-direction: column; gap: 6px;
    min-width: 150px; box-shadow: var(--shadow-sm);
  }
  .stat-label { font-size: 12.5px; color: var(--muted); font-weight: 500; }
  .stat-value { font-size: 30px; font-weight: 700; color: var(--text); letter-spacing: -1px; line-height: 1; }

  /* GRID */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 18px; }

  /* CARD — view only */
  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .2s, box-shadow .2s; position: relative;
  }
  .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

  .card-img-wrap {
    background: #f8f9fb; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    height: 170px; overflow: hidden; position: relative; padding: 0;
  }
  .card-img { max-width: 100%; max-height: 100%; object-fit: contain; }
  .card-no-img { font-size: 12px; color: var(--muted); }

  .carousel-wrap {
    position: relative; width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
  }
  .carousel-img { width: 100%; height: 138px; object-fit: contain; animation: fadeSlide .22s ease; }
  @keyframes fadeSlide {
    from { opacity: 0; transform: scale(.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  .carousel-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(255,255,255,.92); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; line-height: 1; cursor: pointer; z-index: 3;
    color: var(--text); box-shadow: var(--shadow-sm);
    transition: background .15s, transform .15s, opacity .15s;
    opacity: 0; padding: 0;
  }
  .card:hover .carousel-arrow { opacity: 1; }
  .carousel-arrow:hover { background: #fff; transform: translateY(-50%) scale(1.1); }
  .carousel-arrow--left  { left: 6px; }
  .carousel-arrow--right { right: 6px; }
  .carousel-dots {
    position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%);
    display: flex; gap: 5px; z-index: 3;
  }
  .carousel-dot { width: 6px; height: 6px; border-radius: 50%; background: #d1d5db; cursor: pointer; transition: background .2s, transform .2s; }
  .carousel-dot--active { background: var(--accent); transform: scale(1.35); }
  .carousel-counter {
    position: absolute; top: 7px; left: 8px;
    background: rgba(0,0,0,.45); color: #fff;
    font-size: 10px; font-weight: 600; padding: 2px 7px;
    border-radius: 20px; z-index: 3; letter-spacing: .02em;
  }

  .card-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 5px; }
  .card-title { font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .card-specs { font-size: 12.5px; color: var(--muted); }
  .card-price { font-size: 17px; font-weight: 700; color: var(--green); }
  .card-id-badge {
    display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px;
    background: #f1f5f9; color: var(--muted); font-size: 11.5px; font-weight: 600;
    width: fit-content; margin-top: 2px;
  }

  /* EMPTY STATE */
  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; padding: 80px 20px; color: var(--muted); font-size: 15px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-align: center;
  }

  /* FORM */
  .form-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    padding: 28px; max-width: 680px; box-shadow: var(--shadow-sm);
    display: flex; flex-direction: column; gap: 18px;
  }
  .form-row { display: flex; gap: 14px; flex-wrap: wrap; }
  .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 140px; }
  .form-label { font-size: 12.5px; font-weight: 600; color: var(--text); }
  .form-input {
    padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
    font-family: inherit; font-size: 14px; color: var(--text); background: var(--bg);
    outline: none; transition: border-color .18s, background .18s;
  }
  .form-input:focus { border-color: var(--accent); background: var(--surface); }
  .form-input::placeholder { color: #9ca3af; }
  .file-drop {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 6px; border: 1.5px dashed var(--border); border-radius: 10px;
    padding: 28px 20px; cursor: pointer; color: var(--muted); font-size: 14px;
    transition: border-color .2s, background .2s; text-align: center;
  }
  .file-drop:hover { border-color: var(--accent); background: #eff6ff; color: var(--accent); }
  .file-hint { font-size: 12px; color: #9ca3af; }
  .preview-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .preview-img {
    width: 90px; height: 90px; object-fit: contain; border-radius: 8px;
    border: 1px solid var(--border); background: #f8f9fb; padding: 4px;
  }
  .add-btn {
    padding: 12px; border: none; border-radius: 8px; background: var(--green);
    color: #fff; font-family: inherit; font-size: 14.5px; font-weight: 600;
    cursor: pointer; transition: background .18s; align-self: flex-start; min-width: 160px;
  }
  .add-btn:hover { background: #15803d; }

  /* USERS TABLE */
  .users-section { margin-top: 32px; }
  .users-title { font-size: 16px; font-weight: 700; color: var(--text); }
  .users-table { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .users-thead {
    display: grid; grid-template-columns: 40px 2fr 2fr 1.2fr 1fr 1.2fr;
    padding: 11px 20px; background: #f8f9fb; border-bottom: 1px solid var(--border);
    font-size: 11.5px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--muted);
  }
  .users-row {
    display: grid; grid-template-columns: 40px 2fr 2fr 1.2fr 1fr 1.2fr;
    align-items: center; padding: 13px 20px; border-bottom: 1px solid var(--border); transition: background .15s;
  }
  .users-row:last-child { border-bottom: none; }
  .users-row:hover { background: #fafbff; }
  .u-index { font-size: 13px; color: var(--muted); font-weight: 500; }
  .u-user { display: flex; align-items: center; gap: 10px; }
  .u-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff; font-size: 14px; font-weight: 700;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .u-name { font-size: 14px; font-weight: 600; color: var(--text); line-height: 1.3; }
  .u-sub { font-size: 12px; color: var(--muted); }
  .u-email { font-size: 13.5px; color: var(--text); }
  .u-phone { font-size: 13.5px; color: var(--muted); }
  .u-joined { font-size: 13px; color: var(--muted); }
  .u-role-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; width: fit-content; }
  .u-role--admin { background: #ede9fe; color: #6d28d9; }
  .u-role--user  { background: #f0fdf4; color: #16a34a; }

  /* ADMIN PROFILE SIDEBAR */
  .admin-profile { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; }
  .admin-avatar-wrap { position: relative; margin-bottom: 4px; }
  .admin-avatar {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    color: #fff; font-size: 26px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 14px rgba(37,99,235,.35);
  }
  .admin-online-dot { position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; }
  .admin-name { font-size: 15px; font-weight: 700; color: var(--text); }
  .admin-role-label { font-size: 12px; color: var(--muted); }
  .admin-divider { width: 100%; height: 1px; background: var(--border); margin: 10px 0; }
  .admin-info-list { width: 100%; display: flex; flex-direction: column; gap: 10px; text-align: left; }
  .admin-info-item { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--muted); }
  .admin-info-item svg { flex-shrink: 0; color: var(--accent); }
  .admin-stats-mini { display: flex; gap: 12px; width: 100%; }
  .admin-mini-stat {
    flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .admin-mini-val { font-size: 20px; font-weight: 700; color: var(--text); }
  .admin-mini-label { font-size: 11px; color: var(--muted); font-weight: 500; }
`;

export default AdminDashboard;
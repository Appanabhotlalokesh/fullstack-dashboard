import { useEffect, useState } from "react";
import API from "../services/api";

const BASE_URL = "http://localhost:8001";

const getImageList = (images) => {
  if (!images) return [];
  const list = Array.isArray(images)
    ? images
    : String(images).split(",").filter(Boolean);
  return list.map((src) => (src.startsWith("http") ? src : `${BASE_URL}${src}`));
};

function UserDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist")) || [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cart")) || [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("orders")) || [];
    } catch {
      return [];
    }
  });

  const [searchText, setSearchText] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");
  const [toast, setToast] = useState(null);

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyProduct, setBuyProduct] = useState(null);
  const [buyAddress, setBuyAddress] = useState("");
  const [buyPhone, setBuyPhone] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  /* TOAST */
  const showToast = (msg, type = "cart") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2400);
  };

  /* LOAD PRODUCTS */
  useEffect(() => {
    API.get("/products/")
      .then((res) => {
        setProducts(res.data || []);
        setAllProducts(res.data || []);
      })
      .catch((err) => console.error(err));
  }, []);

  /* PERSIST */
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  /* FILTER */
  useEffect(() => {
    let filtered = [...allProducts];

    if (searchText) {
      filtered = filtered.filter((p) =>
        `${p.brand_name} ${p.model}`
          .toLowerCase()
          .includes(searchText.toLowerCase())
      );
    }

    if (selectedRam) {
      filtered = filtered.filter((p) => p.ram === selectedRam);
    }

    if (selectedStorage) {
      filtered = filtered.filter((p) => p.rom === selectedStorage);
    }

    setProducts(filtered);
  }, [searchText, selectedRam, selectedStorage, allProducts]);

  /* LOGOUT */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  /* OPEN PRODUCT DETAIL IN NEW TAB */
  const openProductDetail = (product) => {
    localStorage.setItem("selectedProduct", JSON.stringify(product));
    window.open("/product-detail", "_blank");
  };

  /* WISHLIST */
  const toggleWishlist = (product) => {
    const exists = wishlist.find((i) => i.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter((i) => i.id !== product.id));
      showToast("Removed from wishlist", "wish");
    } else {
      setWishlist([...wishlist, product]);
      showToast(`${product.brand_name} ${product.model} wishlisted`, "wish");
    }
  };

  /* CART */
  const addToCart = (product) => {
    const exists = cart.find((i) => i.id === product.id);
    if (exists) {
      showToast("Already in cart!", "warn");
      return;
    }
    setCart([...cart, product]);
    showToast(`${product.brand_name} ${product.model} added to cart`);
  };

  const removeCart = (id) => setCart(cart.filter((i) => i.id !== id));
  const removeWishlist = (id) => setWishlist(wishlist.filter((i) => i.id !== id));

  const getImageUrl = (images) => {
    const list = getImageList(images);
    return list.length ? list[0] : null;
  };

  const confirmOrder = () => {
    if (!buyAddress.trim()) {
      showToast("Please enter delivery address", "warn");
      return;
    }

    if (!buyProduct) {
      showToast("No product selected", "warn");
      return;
    }

    const newOrder = {
      id: Date.now(),
      product: buyProduct,
      address: buyAddress,
      phone: buyPhone,
      status: "Confirmed",
      createdAt: new Date().toISOString(),
    };

    setOrders([newOrder, ...orders]);
    setShowBuyModal(false);
    setBuyProduct(null);
    setBuyAddress("");
    setBuyPhone("");
    showToast("Order confirmed successfully!", "cart");
  };

  /* IMAGE CAROUSEL */
  const CardCarousel = ({ images, product }) => {
    const [idx, setIdx] = useState(0);
    const list = getImageList(images);

    if (!list.length) {
      return (
        <div
          className="card-no-img"
          onClick={() => openProductDetail(product)}
          style={{
            cursor: "pointer",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No Image
        </div>
      );
    }

    const prev = (e) => {
      e.stopPropagation();
      setIdx((i) => (i - 1 + list.length) % list.length);
    };

    const next = (e) => {
      e.stopPropagation();
      setIdx((i) => (i + 1) % list.length);
    };

    return (
      <div
        className="carousel-wrap"
        onClick={() => openProductDetail(product)}
        style={{ cursor: "pointer" }}
      >
        {list.length > 1 && (
          <button
            className="carousel-arrow carousel-arrow--left"
            onClick={prev}
          >
            &#8249;
          </button>
        )}

        <img
          key={idx}
          src={list[idx]}
          className="card-img carousel-img"
          alt={`product-${idx}`}
        />

        {list.length > 1 && (
          <button
            className="carousel-arrow carousel-arrow--right"
            onClick={next}
          >
            &#8250;
          </button>
        )}

        {list.length > 1 && (
          <div className="carousel-dots">
            {list.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot ${
                  i === idx ? "carousel-dot--active" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
              />
            ))}
          </div>
        )}

        {list.length > 1 && (
          <div className="carousel-counter">
            {idx + 1} / {list.length}
          </div>
        )}

        <div className="carousel-detail-hint">Click to view details</div>
      </div>
    );
  };

  /* PRODUCT CARD */
  const ProductCard = ({ p }) => {
    const inCart = cart.some((i) => i.id === p.id);
    const inWish = wishlist.some((i) => i.id === p.id);

    return (
      <div className="card">
        <button
          className={`wish-btn ${inWish ? "wish-btn--active" : ""}`}
          onClick={() => toggleWishlist(p)}
          title={inWish ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg viewBox="0 0 24 24" fill={inWish ? "#f43f5e" : "none"} width="17" height="17">
            <path
              d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0112 5.5 5 5 0 0121 8.5C21 14.5 12 21 12 21Z"
              stroke={inWish ? "#f43f5e" : "#9ca3af"}
              strokeWidth="1.7"
            />
          </svg>
        </button>

        <div className="card-img-wrap">
          <CardCarousel images={p.images} product={p} />
        </div>

        <div className="card-body">
          <h3
            className="card-title"
            onClick={() => openProductDetail(p)}
            style={{ cursor: "pointer" }}
            title="View details"
          >
            {p.brand_name} {p.model}
          </h3>

          <p className="card-specs">
            {p.ram} · {p.rom}
          </p>

          <p className="card-price">
            &#8377;{Number(p.price).toLocaleString("en-IN")}
          </p>

          <button
            className={`cart-btn ${inCart ? "cart-btn--added" : ""}`}
            onClick={() => addToCart(p)}
            disabled={inCart}
          >
            {inCart ? (
              <>
                <svg viewBox="0 0 20 20" fill="none" width="14" height="14">
                  <path
                    d="M4 10l4 4 8-8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                In Cart
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
                  <path
                    d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6h18M16 10a4 4 0 01-8 0"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Add to Cart
              </>
            )}
          </button>

          <button
            className="buy-btn"
            onClick={() => {
              setBuyProduct(p);
              setBuyAddress("");
              setBuyPhone("");
              setShowBuyModal(true);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Buy Now
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{globalStyles}</style>
      <div className="page">
        {/* NAVBAR */}
        <nav className="navbar">
          <div className="navbar-brand">
            <span className="brand-dot" />
            <h2 className="brand-title">UserPanel</h2>
          </div>

          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>

            {activeTab === "dashboard" ? (
              <input
                className="search-input"
                placeholder="Search your wishlist..."
                disabled
                style={{ opacity: 0.5 }}
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
            <button
              className={`nav-icon-btn ${
                activeTab === "wishlist" ? "nav-icon-btn--active" : ""
              }`}
              onClick={() => setActiveTab("wishlist")}
              title="Wishlist"
            >
              <svg viewBox="0 0 24 24" fill={wishlist.length ? "#f43f5e" : "none"} width="19" height="19">
                <path
                  d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0112 5.5 5 5 0 0121 8.5C21 14.5 12 21 12 21Z"
                  stroke={wishlist.length ? "#f43f5e" : "#94a3b8"}
                  strokeWidth="1.7"
                />
              </svg>
              {wishlist.length > 0 && (
                <span className="nav-badge wish-badge">{wishlist.length}</span>
              )}
            </button>

            <button
              className={`nav-icon-btn ${activeTab === "cart" ? "nav-icon-btn--active" : ""}`}
              onClick={() => setActiveTab("cart")}
              title="Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" width="19" height="19">
                <path
                  d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                  stroke="#94a3b8"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 6h18M16 10a4 4 0 01-8 0"
                  stroke="#94a3b8"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {cart.length > 0 && (
                <span className="nav-badge cart-badge">{cart.length}</span>
              )}
            </button>

            <div className="nav-divider" />

            {["dashboard", "products", "orders"].map((tab) => (
              <button
                key={tab}
                className={`nav-btn ${activeTab === tab ? "nav-btn--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                  <div className="admin-avatar">
                    {(user.username || user.email || "U")[0].toUpperCase()}
                  </div>
                  <span className="admin-online-dot" />
                </div>

                <p className="admin-name">{user.username || "User"}</p>
                <p className="admin-role-label">User · My Panel</p>

                <div className="admin-divider" />

                <div className="admin-info-list">
                  <div className="admin-info-item">
                    <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                      <path
                        d="M10 10a4 4 0 100-8 4 4 0 000 8zM2 18a8 8 0 0116 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    <span>{user.email || "N/A"}</span>
                  </div>

                  {user.number && (
                    <div className="admin-info-item">
                      <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                        <path
                          d="M3 4a1 1 0 011-1h2.5l1 3-1.5 1.5a11 11 0 005.5 5.5L13 11.5l3 1V15a1 1 0 01-1 1A13 13 0 013 4z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>{user.number}</span>
                    </div>
                  )}

                  {user.address && (
                    <div className="admin-info-item">
                      <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
                        <path
                          d="M10 10a3 3 0 100-6 3 3 0 000 6z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10 10c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span>{user.address}</span>
                    </div>
                  )}
                </div>

                <div className="admin-divider" />

                <div className="admin-stats-mini">
                  <div className="admin-mini-stat">
                    <span className="admin-mini-val">{cart.length}</span>
                    <span className="admin-mini-label">Cart</span>
                  </div>
                  <div className="admin-mini-stat">
                    <span className="admin-mini-val">{wishlist.length}</span>
                    <span className="admin-mini-label">Wishlist</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="sidebar-section-label">Filters</p>

                <label className="sidebar-label">RAM</label>
                <select
                  className="sidebar-select"
                  value={selectedRam}
                  onChange={(e) => setSelectedRam(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="4GB">4 GB</option>
                  <option value="8GB">8 GB</option>
                  <option value="12GB">12 GB</option>
                  <option value="16GB">16 GB</option>
                </select>

                <label className="sidebar-label">Storage</label>
                <select
                  className="sidebar-select"
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="64GB">64 GB</option>
                  <option value="128GB">128 GB</option>
                  <option value="256GB">256 GB</option>
                  <option value="512GB">512 GB</option>
                </select>

                <button
                  className="clear-btn"
                  onClick={() => {
                    setSelectedRam("");
                    setSelectedStorage("");
                    setSearchText("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
                <path
                  d="M7 3H4a1 1 0 00-1 1v12a1 1 0 001 1h3"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M13 14l3-4-3-4M16 10H8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
                    <span className="stat-label">Cart Items</span>
                    <span className="stat-value">{cart.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Wishlisted</span>
                    <span className="stat-value">{wishlist.length}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Orders</span>
                    <span className="stat-value">{orders.length}</span>
                  </div>
                </div>

                <div className="users-section">
                  <div className="section-header" style={{ marginBottom: "16px" }}>
                    <h3 className="users-title">My Wishlist</h3>
                    <span className="badge">{wishlist.length} saved</span>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                        <path
                          d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0112 5.5 5 5 0 0121 8.5C21 14.5 12 21 12 21Z"
                          stroke="#d1d5db"
                          strokeWidth="1.4"
                        />
                      </svg>
                      <p>No items wishlisted yet</p>
                      <button
                        className="clear-btn"
                        style={{ width: "auto", padding: "9px 24px" }}
                        onClick={() => setActiveTab("products")}
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid">
                      {wishlist.map((p) => (
                        <ProductCard key={p.id} p={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {activeTab === "products" && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Products</h2>
                  <span className="badge">{products.length} items</span>
                </div>

                {products.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" width="48" height="48">
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="4"
                        stroke="#d1d5db"
                        strokeWidth="1.4"
                      />
                      <path d="M9 12h6M12 9v6" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    <p>No products match your filters</p>
                    <button
                      className="clear-btn"
                      style={{ width: "auto", padding: "9px 24px" }}
                      onClick={() => {
                        setSelectedRam("");
                        setSelectedStorage("");
                        setSearchText("");
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid">
                    {products.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ORDERS */}
            {activeTab === "orders" && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">My Orders</h2>
                  <span className="badge">{orders.length} items</span>
                </div>

                {orders.length === 0 ? (
                  <div className="empty-state">
                    <p>No orders yet.</p>
                    <button
                      className="clear-btn"
                      style={{ width: "auto", padding: "9px 24px" }}
                      onClick={() => setActiveTab("products")}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid">
                    {orders.map((order) => {
                      const img = getImageUrl(order.product?.images);

                      return (
                        <div key={order.id} className="card">
                          {img ? (
                            <img
                              src={img}
                              alt="order"
                              style={{
                                width: "100%",
                                height: "180px",
                                objectFit: "contain",
                              }}
                            />
                          ) : null}

                          <div className="card-body">
                            <h3 className="card-title">
                              {order.product?.brand_name} {order.product?.model}
                            </h3>
                            <p className="card-specs">Status: {order.status}</p>
                            <p className="card-specs">Address: {order.address}</p>
                            <p className="card-price">
                              ₹{Number(order.product?.price || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CART */}
            {activeTab === "cart" && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">My Cart</h2>
                  <span className="badge">{cart.length} items</span>
                </div>

                {cart.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" width="54" height="54">
                      <path
                        d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
                        stroke="#d1d5db"
                        strokeWidth="1.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path d="M3 6h18M16 10a4 4 0 01-8 0" stroke="#d1d5db" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p>Your cart is empty</p>
                    <button
                      className="clear-btn"
                      style={{ width: "auto", padding: "9px 24px" }}
                      onClick={() => setActiveTab("products")}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="list-table">
                    <div className="list-header">
                      <span>Product</span>
                      <span>Specs</span>
                      <span>Price</span>
                      <span>Action</span>
                    </div>

                    {cart.map((p) => {
                      const imgSrc = getImageUrl(p.images);

                      return (
                        <div key={p.id} className="list-row">
                          <div className="list-product">
                            {imgSrc ? (
                              <img src={imgSrc} className="list-img" alt="" />
                            ) : (
                              <div className="list-img-placeholder" />
                            )}
                            <span className="list-name">
                              {p.brand_name} {p.model}
                            </span>
                          </div>
                          <span className="list-specs">
                            {p.ram} &middot; {p.rom}
                          </span>
                          <span className="list-price">
                            &#8377;{Number(p.price).toLocaleString("en-IN")}
                          </span>
                          <button className="remove-btn" onClick={() => removeCart(p.id)}>
                            Remove
                          </button>
                        </div>
                      );
                    })}

                    <div className="list-footer">
                      <span>Total ({cart.length} items)</span>
                      <span className="list-total">
                        &#8377;{cart.reduce((s, i) => s + Number(i.price), 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* WISHLIST */}
            {activeTab === "wishlist" && (
              <div>
                <div className="section-header">
                  <h2 className="section-title">Wishlist</h2>
                  <span className="badge">{wishlist.length} items</span>
                </div>

                {wishlist.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" width="54" height="54">
                      <path
                        d="M12 21C12 21 3 14.5 3 8.5A5 5 0 0112 5.5 5 5 0 0121 8.5C21 14.5 12 21 12 21Z"
                        stroke="#d1d5db"
                        strokeWidth="1.4"
                      />
                    </svg>
                    <p>No items wishlisted yet</p>
                    <button
                      className="clear-btn"
                      style={{ width: "auto", padding: "9px 24px" }}
                      onClick={() => setActiveTab("products")}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="grid">
                    {wishlist.map((p) => (
                      <ProductCard key={p.id} p={p} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* BUY MODAL */}
            {showBuyModal && buyProduct && (
              <div className="buy-modal-backdrop" onClick={() => setShowBuyModal(false)}>
                <div className="buy-modal" onClick={(e) => e.stopPropagation()}>
                  <h3 className="buy-modal-title">Enter Delivery Details</h3>

                  <textarea
                    className="buy-modal-input buy-modal-textarea"
                    placeholder="Full delivery address"
                    value={buyAddress}
                    onChange={(e) => setBuyAddress(e.target.value)}
                  />

                  <input
                    className="buy-modal-input"
                    placeholder="Phone number"
                    value={buyPhone}
                    onChange={(e) => setBuyPhone(e.target.value)}
                  />

                  <div className="buy-modal-actions">
                    <button
                      className="buy-modal-cancel"
                      onClick={() => setShowBuyModal(false)}
                    >
                      Cancel
                    </button>

                    <button
                      className="buy-modal-confirm"
                      onClick={confirmOrder}
                    >
                      Confirm Order
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TOAST */}
            {toast && (
              <div className={`toast toast--${toast.type}`}>
                {toast.type === "wish" ? "♥" : toast.type === "warn" ? "⚠" : "🛒"}{" "}
                {toast.msg}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

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
    --pink:      #f43f5e;
    --nav-bg:    #0f172a;
    --nav-text:  #f8fafc;
    --radius:    10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,.07), 0 1px 2px rgba(0,0,0,.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,.08);
  }

  .page { background: var(--bg); min-height: 100vh; display: flex; flex-direction: column; }

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
  .nav-divider { width: 1px; height: 22px; background: rgba(255,255,255,.12); margin: 0 6px; }

  .nav-icon-btn {
    position: relative; display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 8px; border: none;
    background: transparent; cursor: pointer; transition: background .18s;
    color: #fff;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    padding: 0;
  }
  .nav-icon-btn:hover { background: rgba(255,255,255,.08); }
  .nav-icon-btn--active { background: rgba(255,255,255,.1); }

  .nav-badge {
    position: absolute; top: 4px; right: 4px; width: 17px; height: 17px; border-radius: 50%;
    font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; line-height: 1;
  }
  .wish-badge { background: var(--pink); color: #fff; }
  .cart-badge { background: var(--accent); color: #fff; }

  .nav-btn {
    padding: 7px 16px; border-radius: 7px; border: none;
    background: transparent; color: #94a3b8;
    font-family: inherit; font-size: 13.5px; font-weight: 500;
    cursor: pointer; transition: background .18s, color .18s; text-transform: capitalize;
  }
  .nav-btn:hover { background: rgba(255,255,255,.08); color: var(--nav-text); }
  .nav-btn--active { background: var(--accent); color: #fff; }
  .nav-btn--active:hover { background: var(--accent-dk); }

  .layout { display: flex; flex: 1; overflow: hidden; }

  .sidebar {
    width: 232px; flex-shrink: 0; background: var(--surface);
    border-right: 1px solid var(--border); padding: 24px 16px;
    display: flex; flex-direction: column; justify-content: space-between; overflow-y: auto;
  }
  .sidebar-section-label { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 14px; }
  .sidebar-label { display: block; font-size: 12.5px; font-weight: 600; color: var(--text); margin-bottom: 5px; margin-top: 14px; }
  .sidebar-select {
    width: 100%; padding: 8px 10px; border: 1px solid var(--border); border-radius: 7px;
    background: var(--bg); color: var(--text); font-family: inherit; font-size: 13.5px; outline: none;
    cursor: pointer; transition: border-color .18s;
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
    border: 1px solid #fee2e2; border-radius: 8px; background: #fff5f5; color: var(--red);
    font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer; transition: background .18s;
  }
  .logout-btn:hover { background: #fee2e2; }

  .main-content { flex: 1; padding: 28px; overflow-y: auto; }
  .section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 22px; }
  .section-title { font-size: 20px; font-weight: 700; color: var(--text); letter-spacing: -0.3px; margin-bottom: 20px; }
  .section-header .section-title { margin-bottom: 0; }
  .badge { padding: 3px 10px; border-radius: 20px; background: #eff6ff; color: var(--accent); font-size: 12.5px; font-weight: 600; }

  .stats-row { display: flex; gap: 16px; flex-wrap: wrap; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 22px 28px; display: flex; flex-direction: column; gap: 6px;
    min-width: 150px; box-shadow: var(--shadow-sm);
  }
  .stat-label { font-size: 12.5px; color: var(--muted); font-weight: 500; }
  .stat-value { font-size: 30px; font-weight: 700; color: var(--text); letter-spacing: -1px; line-height: 1; }

  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 18px; }

  .card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
    overflow: hidden; box-shadow: var(--shadow-sm); transition: transform .2s, box-shadow .2s; position: relative;
  }
  .card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }

  .wish-btn {
    position: absolute; top: 10px; right: 10px; z-index: 4; width: 32px; height: 32px;
    border-radius: 50%; background: rgba(255,255,255,.9); border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    transition: background .18s, border-color .18s, transform .15s; backdrop-filter: blur(4px);
  }
  .wish-btn:hover { background: #fff1f2; border-color: var(--pink); transform: scale(1.1); }
  .wish-btn--active { background: #fff1f2; border-color: #fecdd3; }

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
  .carousel-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #d1d5db; cursor: pointer;
    transition: background .2s, transform .2s;
  }
  .carousel-dot--active { background: var(--accent); transform: scale(1.35); }

  .carousel-counter {
    position: absolute; top: 7px; left: 8px;
    background: rgba(0,0,0,.45); color: #fff;
    font-size: 10px; font-weight: 600; padding: 2px 7px;
    border-radius: 20px; z-index: 3; letter-spacing: .02em;
  }

  .carousel-detail-hint {
    position: absolute; bottom: 0; left: 0; right: 0;
    background: rgba(37,99,235,.82); color: #fff;
    font-size: 11.5px; font-weight: 600; text-align: center;
    padding: 5px; opacity: 0; transition: opacity .2s;
    pointer-events: none;
  }
  .card:hover .carousel-detail-hint { opacity: 1; }

  .card-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; }
  .card-title {
    font-size: 14px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .15s;
  }
  .card-title:hover { color: var(--accent); }
  .card-specs { font-size: 12.5px; color: var(--muted); }
  .card-price { font-size: 17px; font-weight: 700; color: var(--green); margin-bottom: 6px; }

  .cart-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 9px 12px; border: none; border-radius: 8px;
    background: var(--accent); color: #fff; font-family: inherit; font-size: 13px;
    font-weight: 600; cursor: pointer; transition: background .18s, transform .12s;
  }
  .cart-btn:hover { background: var(--accent-dk); }
  .cart-btn:active { transform: scale(.97); }
  .cart-btn--added { background: #dcfce7; color: var(--green); cursor: default; }
  .cart-btn--added:hover { background: #dcfce7; }

  .buy-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    width: 100%; padding: 9px 12px; border: 1.5px solid var(--accent); border-radius: 8px;
    background: transparent; color: var(--accent); font-family: inherit; font-size: 13px;
    font-weight: 600; cursor: pointer; transition: background .18s, color .18s, transform .12s;
  }
  .buy-btn:hover { background: var(--accent); color: #fff; }
  .buy-btn:active { transform: scale(.97); }

  .list-table { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .list-header {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; padding: 12px 20px;
    background: #f8f9fb; border-bottom: 1px solid var(--border);
    font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted);
  }
  .list-row {
    display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center;
    padding: 14px 20px; border-bottom: 1px solid var(--border); transition: background .15s;
  }
  .list-row:last-of-type { border-bottom: none; }
  .list-row:hover { background: #fafbff; }
  .list-product { display: flex; align-items: center; gap: 12px; }
  .list-img { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; background: #f8f9fb; border: 1px solid var(--border); padding: 4px; }
  .list-img-placeholder { width: 48px; height: 48px; border-radius: 8px; background: #f8f9fb; border: 1px solid var(--border); }
  .list-name { font-size: 14px; font-weight: 600; color: var(--text); }
  .list-specs { font-size: 13px; color: var(--muted); }
  .list-price { font-size: 15px; font-weight: 700; color: var(--green); }
  .remove-btn {
    padding: 6px 14px; border-radius: 7px; border: 1px solid #fee2e2;
    background: #fff5f5; color: var(--red); font-family: inherit; font-size: 12.5px;
    font-weight: 600; cursor: pointer; transition: background .18s;
  }
  .remove-btn:hover { background: #fee2e2; }
  .list-footer {
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 20px; background: #f8f9fb; border-top: 1px solid var(--border);
    font-size: 14px; font-weight: 600; color: var(--text);
  }
  .list-total { font-size: 20px; font-weight: 700; color: var(--green); }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 14px; padding: 80px 20px; color: var(--muted); font-size: 15px;
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px; text-align: center;
  }

  .users-section { margin-top: 32px; }
  .users-title { font-size: 16px; font-weight: 700; color: var(--text); }

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
  .admin-info-item { display: flex; align-items: center; gap: 9px; font-size: 13px; color: var(--muted); word-break: break-word; }
  .admin-info-item svg { flex-shrink: 0; color: var(--accent); }
  .admin-stats-mini { display: flex; gap: 12px; width: 100%; }
  .admin-mini-stat {
    flex: 1; background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 8px; display: flex; flex-direction: column; align-items: center; gap: 2px;
  }
  .admin-mini-val { font-size: 20px; font-weight: 700; color: var(--text); }
  .admin-mini-label { font-size: 11px; color: var(--muted); font-weight: 500; }

  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    padding: 12px 22px; border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,.18);
    animation: slideUp .28s ease, fadeOut .3s 2.1s ease forwards;
    z-index: 9999; white-space: nowrap;
  }
  .toast--cart { background: #1e40af; }
  .toast--wish { background: #be185d; }
  .toast--warn { background: #b45309; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }

  .buy-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3000;
  }

  .buy-modal {
    width: min(92vw, 420px);
    background: #fff;
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  }

  .buy-modal-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 14px;
    color: #111827;
  }

  .buy-modal-input {
    width: 100%;
    border: 1px solid #d1d5db;
    border-radius: 10px;
    padding: 10px 12px;
    margin-bottom: 12px;
    font-family: inherit;
    font-size: 14px;
    outline: none;
  }

  .buy-modal-textarea {
    min-height: 110px;
    resize: vertical;
  }

  .buy-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .buy-modal-cancel,
  .buy-modal-confirm {
    border: none;
    border-radius: 10px;
    padding: 10px 16px;
    font-weight: 600;
    cursor: pointer;
  }

  .buy-modal-cancel { 
    background: #e5e7eb;
    color: #111827;
  }

  .buy-modal-confirm {   
    background: #2563eb;
    color: #fff;
  }
`;
//juj
export default UserDashboard;
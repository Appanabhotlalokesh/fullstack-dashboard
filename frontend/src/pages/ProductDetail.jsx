import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:8001";

const getImageList = (images) => {
  if (!images) return [];
  const list = Array.isArray(images)
    ? images
    : String(images).split(",").filter(Boolean);
  return list.map((src) => src.startsWith("http") ? src : `${BASE_URL}${src}`);
};

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [zooming, setZooming] = useState(false);
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
    catch { return []; }
  });
  const [toast, setToast] = useState(null);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState(null);

  /* READ PRODUCT FROM localStorage */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("selectedProduct");
      if (!raw) { setNotFound(true); return; }
      const data = JSON.parse(raw);
      if (!data || !data.id) { setNotFound(true); return; }
      setProduct(data);
    } catch {
      setNotFound(true);
    }
  }, []);

  useEffect(() => {
    if (product) document.title = `${product.brand_name} ${product.model}`;
  }, [product]);

  /* ── LOADING STATE ── */
  if (notFound) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"DM Sans,sans-serif", gap:"16px", color:"#6b7280" }}>
      <svg viewBox="0 0 24 24" fill="none" width="56" height="56"><circle cx="12" cy="12" r="9" stroke="#d1d5db" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/></svg>
      <p style={{ fontSize:"18px", fontWeight:700, color:"#111827" }}>Product not found</p>
      <p style={{ fontSize:"14px" }}>Go back and click a product image to open its detail page.</p>
      <button onClick={() => window.close()} style={{ padding:"9px 22px", borderRadius:"8px", border:"none", background:"#2563eb", color:"#fff", fontWeight:600, cursor:"pointer", fontSize:"14px" }}>Close Tab</button>
    </div>
  );

  if (!product) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"DM Sans,sans-serif", color:"#6b7280", fontSize:"15px" }}>
      Loading...
    </div>
  );

  /* ── DATA DERIVED FROM PRODUCT ── */
  const images = getImageList(product.images);
  const price  = Number(product.price);
  const mrp    = Math.round(price * 1.05);
  const discPct = Math.round(((mrp - price) / mrp) * 100);
  const emiAmt  = Math.round(price / 12).toLocaleString("en-IN");
  const inCart  = cart.some((i) => i.id === product.id);
  const inWish  = wishlist.some((i) => i.id === product.id);

  /* ── HELPERS ── */
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const addToCart = () => {
    if (inCart) { showToast("Already in cart!", "warn"); return; }
    const updated = [...cart, product];
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    showToast(`${product.brand_name} ${product.model} added to cart!`);
  };

  const toggleWishlist = () => {
    const updated = inWish
      ? wishlist.filter((i) => i.id !== product.id)
      : [...wishlist, product];
    setWishlist(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    showToast(inWish ? "Removed from wishlist" : "Added to wishlist ♥", "wish");
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeMsg({ text: "Enter a valid 6-digit pincode", ok: false });
    } else {
      setPincodeMsg({ text: `✓ Free delivery available to ${pincode}`, ok: true });
    }
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{css}</style>
      <div className="pd-page">

        {/* NAV */}
        <nav className="pd-nav">
          <div className="pd-nav-brand">
            <span className="pd-nav-dot" />
            <span className="pd-nav-title">
              {product.brand_name} {product.model}
            </span>
          </div>
          <button className="pd-close-btn" onClick={() => window.close()}>✕ Close</button>
        </nav>

        <div className="pd-body">

          {/* ── LEFT COLUMN ── */}
          <div className="pd-left">

            {/* THUMBNAIL STRIP */}
            {images.length > 1 && (
              <div className="pd-thumbs">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${i === activeImg ? "pd-thumb--on" : ""}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={src} alt={`thumb-${i}`} />
                  </div>
                ))}
              </div>
            )}

            {/* MAIN IMAGE + ZOOM */}
            <div className="pd-img-col">
              <div
                className="pd-img-box"
                onMouseEnter={() => setZooming(true)}
                onMouseLeave={() => setZooming(false)}
                onMouseMove={handleMouseMove}
              >
                {images.length > 0 ? (
                  <img
                    src={images[activeImg]}
                    alt={`${product.brand_name} ${product.model}`}
                    className="pd-main-img"
                    style={zooming ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: "scale(2.4)",
                      cursor: "zoom-in",
                    } : {}}
                  />
                ) : (
                  <div className="pd-no-img">No Image</div>
                )}
              </div>
              <p className="pd-zoom-hint">Hover image to zoom</p>

              {/* VARIANT / COLOR PICKER */}
              {images.length > 1 && (
                <div className="pd-variants">
                  <p className="pd-variants-label">
                    Colour: <strong>Variant {activeImg + 1}</strong>
                  </p>
                  <div className="pd-variant-row">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className={`pd-variant ${i === activeImg ? "pd-variant--on" : ""}`}
                        onClick={() => setActiveImg(i)}
                      >
                        <img src={src} alt={`v-${i}`} />
                        <span className="pd-variant-price">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="pd-right">

            <p className="pd-brand-link">Visit the {product.brand_name} Store</p>

            <h1 className="pd-title">
              {product.brand_name} {product.model}
              {product.ram && product.rom
                ? ` (${product.ram} RAM, ${product.rom} Storage)`
                : product.ram ? ` (${product.ram} RAM)` : ""}
            </h1>

            {/* RATING */}
            <div className="pd-rating-row">
              <span className="pd-stars">★★★★☆</span>
              <span className="pd-rating-num">4.2</span>
              <span className="pd-rating-sep">·</span>
              <span className="pd-rating-count">128 ratings</span>
              <span className="pd-bought-badge">200+ bought this month</span>
            </div>

            <div className="pd-rule" />

            {/* PRICE BLOCK */}
            <div className="pd-price-block">
              <span className="pd-deal-tag">Great Summer Deal</span>
              <div className="pd-price-row">
                <span className="pd-disc">-{discPct}%</span>
                <span className="pd-price">₹{price.toLocaleString("en-IN")}</span>
              </div>
              <p className="pd-mrp">M.R.P.: <s>₹{mrp.toLocaleString("en-IN")}</s></p>
              <p className="pd-tax">Inclusive of all taxes</p>
              <p className="pd-emi">EMI from ₹{emiAmt}/mo &nbsp;·&nbsp; <span className="pd-emi-link">No Cost EMI available</span></p>
            </div>

            <div className="pd-rule" />

            {/* SPECS TABLE */}
            <table className="pd-specs">
              <tbody>
                <tr><td className="pd-sk">Brand</td><td className="pd-sv">{product.brand_name}</td></tr>
                <tr><td className="pd-sk">Model</td><td className="pd-sv">{product.model}</td></tr>
                {product.ram    && <tr><td className="pd-sk">RAM</td><td className="pd-sv">{product.ram}</td></tr>}
                {product.rom    && <tr><td className="pd-sk">Storage</td><td className="pd-sv">{product.rom}</td></tr>}
              </tbody>
            </table>

            <div className="pd-rule" />

            {/* BENEFITS */}
            <div className="pd-benefits">
              {[
                ["🔄","10 Day Returns"],
                ["🚚","Free Delivery"],
                ["🛡️","1 Year Warranty"],
                ["💳","Pay on Delivery"],
                ["🏷️","Top Brand"],
                ["📦","Amazon Delivered"],
              ].map(([icon, label]) => (
                <div key={label} className="pd-benefit">
                  <span>{icon}</span>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            <div className="pd-rule" />

            {/* PINCODE */}
            <div className="pd-pincode-wrap">
              <p className="pd-pincode-label">📍 Check delivery</p>
              <div className="pd-pincode-row">
                <input
                  className="pd-pin-input"
                  placeholder="Enter 6-digit pincode"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => { setPincode(e.target.value); setPincodeMsg(null); }}
                  onKeyDown={(e) => e.key === "Enter" && checkPincode()}
                />
                <button className="pd-pin-btn" onClick={checkPincode}>Check</button>
              </div>
              {pincodeMsg && (
                <p className={`pd-pin-msg ${pincodeMsg.ok ? "pd-pin-ok" : "pd-pin-err"}`}>
                  {pincodeMsg.text}
                </p>
              )}
            </div>

            <div className="pd-rule" />

            {/* CTA */}
            <div className="pd-cta">
              <button
                className={`pd-cart-btn ${inCart ? "pd-cart-btn--done" : ""}`}
                onClick={addToCart}
                disabled={inCart}
              >
                {inCart ? "✓ Added to Cart" : "🛒 Add to Cart"}
              </button>
              <button
                className="pd-buy-btn"
                onClick={() => { addToCart(); showToast("Proceeding to checkout..."); }}
              >
                Buy Now →
              </button>
            </div>

            <button
              className={`pd-wish-row ${inWish ? "pd-wish-row--on" : ""}`}
              onClick={toggleWishlist}
            >
              {inWish ? "♥ Remove from Wishlist" : "♡ Add to Wishlist"}
            </button>

          </div>
        </div>

        {/* TOAST */}
        {toast && (
          <div className={`pd-toast pd-toast--${toast.type}`}>{toast.msg}</div>
        )}
      </div>
    </>
  );
}

/* ─── STYLES ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', sans-serif; background: #f5f6fa; color: #111827; }

  :root {
    --surface: #fff;
    --border:  #e5e7eb;
    --muted:   #6b7280;
    --accent:  #2563eb;
    --green:   #16a34a;
    --red:     #dc2626;
    --orange:  #ea580c;
    --pink:    #f43f5e;
    --nav-bg:  #0f172a;
    --sh-sm:   0 1px 4px rgba(0,0,0,.08);
    --sh-md:   0 4px 18px rgba(0,0,0,.10);
  }

  /* NAV */
  .pd-nav {
    position: sticky; top: 0; z-index: 200;
    height: 56px; background: var(--nav-bg);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 32px; border-bottom: 1px solid rgba(255,255,255,.06);
  }
  .pd-nav-brand { display: flex; align-items: center; gap: 9px; }
  .pd-nav-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
  .pd-nav-title { font-size: 15px; font-weight: 700; color: #f8fafc; letter-spacing: -.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 520px; }
  .pd-close-btn {
    padding: 6px 16px; border-radius: 7px;
    border: 1px solid rgba(255,255,255,.15);
    background: transparent; color: #94a3b8;
    font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all .18s; flex-shrink: 0;
  }
  .pd-close-btn:hover { background: rgba(255,255,255,.08); color: #f8fafc; }

  /* PAGE BODY */
  .pd-page { min-height: 100vh; background: #f5f6fa; }
  .pd-body {
    display: flex; gap: 36px; max-width: 1160px;
    margin: 0 auto; padding: 32px 24px; align-items: flex-start;
  }

  /* LEFT */
  .pd-left { display: flex; gap: 12px; flex-shrink: 0; width: 480px; }

  /* THUMBNAILS */
  .pd-thumbs { display: flex; flex-direction: column; gap: 8px; }
  .pd-thumb {
    width: 58px; height: 58px; flex-shrink: 0;
    border: 2px solid var(--border); border-radius: 8px;
    background: #fff; cursor: pointer; overflow: hidden;
    display: flex; align-items: center; justify-content: center;
    transition: border-color .18s;
  }
  .pd-thumb img { width: 100%; height: 100%; object-fit: contain; padding: 5px; }
  .pd-thumb--on { border-color: var(--accent); }
  .pd-thumb:hover:not(.pd-thumb--on) { border-color: #93c5fd; }

  /* MAIN IMAGE */
  .pd-img-col { flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .pd-img-box {
    width: 100%; aspect-ratio: 1/1; border-radius: 14px;
    background: #fff; border: 1px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; box-shadow: var(--sh-md);
  }
  .pd-main-img { width: 88%; height: 88%; object-fit: contain; transition: transform .1s ease; }
  .pd-no-img { font-size: 13px; color: var(--muted); }
  .pd-zoom-hint { font-size: 11.5px; color: var(--muted); text-align: center; }

  /* VARIANTS */
  .pd-variants { display: flex; flex-direction: column; gap: 8px; }
  .pd-variants-label { font-size: 13.5px; color: var(--muted); }
  .pd-variants-label strong { color: #111827; }
  .pd-variant-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-variant {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    width: 70px; border: 2px solid var(--border); border-radius: 10px;
    background: #fff; cursor: pointer; padding: 6px 4px;
    transition: border-color .18s, box-shadow .18s;
  }
  .pd-variant img { width: 100%; height: 56px; object-fit: contain; }
  .pd-variant-price { font-size: 10px; color: var(--muted); font-weight: 600; }
  .pd-variant--on { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,.12); }
  .pd-variant:hover:not(.pd-variant--on) { border-color: #93c5fd; }

  /* RIGHT */
  .pd-right { flex: 1; display: flex; flex-direction: column; gap: 0; min-width: 0; }

  .pd-brand-link { font-size: 13px; color: var(--accent); font-weight: 600; margin-bottom: 8px; cursor: pointer; }
  .pd-brand-link:hover { text-decoration: underline; }

  .pd-title { font-size: 19px; font-weight: 700; color: #111827; line-height: 1.45; margin-bottom: 12px; }

  /* RATING */
  .pd-rating-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .pd-stars { color: #f59e0b; font-size: 15px; letter-spacing: 1px; }
  .pd-rating-num { font-size: 13.5px; font-weight: 700; color: #111827; }
  .pd-rating-sep { color: var(--muted); }
  .pd-rating-count { font-size: 13px; color: var(--accent); }
  .pd-bought-badge {
    padding: 2px 10px; border-radius: 20px;
    background: #fef3c7; color: #92400e;
    font-size: 12px; font-weight: 600;
  }

  .pd-rule { height: 1px; background: var(--border); margin: 16px 0; }

  /* PRICE */
  .pd-price-block { display: flex; flex-direction: column; gap: 5px; }
  .pd-deal-tag {
    width: fit-content; padding: 4px 12px; border-radius: 4px;
    background: var(--red); color: #fff; font-size: 12px; font-weight: 700;
  }
  .pd-price-row { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
  .pd-disc { font-size: 22px; font-weight: 700; color: var(--orange); }
  .pd-price { font-size: 32px; font-weight: 700; color: #111827; letter-spacing: -1px; }
  .pd-mrp { font-size: 13.5px; color: var(--muted); }
  .pd-tax { font-size: 12.5px; color: var(--muted); }
  .pd-emi { font-size: 13px; color: #111827; }
  .pd-emi-link { color: var(--accent); font-weight: 500; cursor: pointer; }
  .pd-emi-link:hover { text-decoration: underline; }

  /* SPECS */
  .pd-specs { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
  .pd-specs tr:nth-child(odd) td { background: #f8f9fb; }
  .pd-specs tr { border-bottom: 1px solid var(--border); }
  .pd-specs tr:last-child { border-bottom: none; }
  .pd-sk { padding: 10px 14px; font-size: 13px; font-weight: 600; color: var(--muted); width: 130px; }
  .pd-sv { padding: 10px 14px; font-size: 13px; font-weight: 500; color: #111827; }

  /* BENEFITS */
  .pd-benefits { display: flex; gap: 8px; flex-wrap: wrap; }
  .pd-benefit {
    display: flex; flex-direction: column; align-items: center; gap: 4px;
    background: #fff; border: 1px solid var(--border); border-radius: 10px;
    padding: 10px 12px; min-width: 86px; text-align: center;
    font-size: 11.5px; color: var(--muted); font-weight: 600; line-height: 1.4;
    box-shadow: var(--sh-sm);
  }
  .pd-benefit span:first-child { font-size: 20px; }

  /* PINCODE */
  .pd-pincode-wrap { display: flex; flex-direction: column; gap: 8px; }
  .pd-pincode-label { font-size: 13.5px; font-weight: 600; color: #111827; }
  .pd-pincode-row { display: flex; gap: 8px; }
  .pd-pin-input {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: 8px;
    font-family: inherit; font-size: 14px; color: #111827; background: #fff;
    outline: none; width: 170px; transition: border-color .18s;
  }
  .pd-pin-input:focus { border-color: var(--accent); }
  .pd-pin-btn {
    padding: 8px 18px; border-radius: 8px; border: none;
    background: var(--accent); color: #fff;
    font-family: inherit; font-size: 13.5px; font-weight: 600; cursor: pointer;
    transition: background .18s;
  }
  .pd-pin-btn:hover { background: #1d4ed8; }
  .pd-pin-msg { font-size: 13px; font-weight: 500; }
  .pd-pin-ok  { color: var(--green); }
  .pd-pin-err { color: var(--red); }

  /* CTA */
  .pd-cta { display: flex; gap: 12px; }
  .pd-cart-btn {
    flex: 1; padding: 13px; border: none; border-radius: 10px;
    background: #fbbf24; color: #111827;
    font-family: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: background .18s, transform .12s;
  }
  .pd-cart-btn:hover { background: #f59e0b; }
  .pd-cart-btn:active { transform: scale(.98); }
  .pd-cart-btn--done { background: #dcfce7; color: var(--green); cursor: default; }
  .pd-cart-btn--done:hover { background: #dcfce7; }

  .pd-buy-btn {
    flex: 1; padding: 13px; border: none; border-radius: 10px;
    background: var(--orange); color: #fff;
    font-family: inherit; font-size: 14px; font-weight: 700;
    cursor: pointer; transition: background .18s, transform .12s;
  }
  .pd-buy-btn:hover { background: #c2410c; }
  .pd-buy-btn:active { transform: scale(.98); }

  .pd-wish-row {
    margin-top: 10px; width: 100%; padding: 10px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #fff;
    color: var(--muted); font-family: inherit; font-size: 13.5px;
    font-weight: 600; cursor: pointer; transition: all .18s;
  }
  .pd-wish-row:hover { border-color: var(--pink); color: var(--pink); background: #fff1f2; }
  .pd-wish-row--on   { border-color: var(--pink); color: var(--pink); background: #fff1f2; }

  /* TOAST */
  .pd-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    padding: 12px 24px; border-radius: 10px; font-size: 13.5px; font-weight: 600; color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,.18); z-index: 9999; white-space: nowrap;
    animation: tin .28s ease, tout .3s 2.2s ease forwards;
  }
  .pd-toast--success { background: #1e40af; }
  .pd-toast--wish    { background: #be185d; }
  .pd-toast--warn    { background: #b45309; }

  @keyframes tin  { from { opacity:0; transform:translateX(-50%) translateY(14px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes tout { from { opacity:1; } to { opacity:0; } }

  @media (max-width: 860px) {
    .pd-body { flex-direction: column; }
    .pd-left { width: 100%; }
  }
`;
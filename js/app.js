/* Saverio · app.js (simple, sin loops) */
const $ = (s, c = document) => c.querySelector(s);

// Refs
const btnVerCarrito = $("#btn-ver-carrito");
const btnCerrarCarrito = $("#btn-cerrar-carrito");
const panelCarrito = $("#carrito");
const badge = $("#badge-carrito");
const itemsCarrito = $("#carrito-items");
const totalEl = $("#carrito-total");
const btnVaciar = $("#btn-vaciar");

// Overlay
let overlay = document.querySelector(".overlay");
if (!overlay) {
  overlay = document.createElement("div");
  overlay.className = "overlay hidden";
  document.body.appendChild(overlay);
}

// Helpers
const money = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
    .format(Number(n) || 0);

const readCart = () => {
  try { return JSON.parse(localStorage.getItem("carrito")) || []; }
  catch { return []; }
};
const writeCart = (c) => {
  localStorage.setItem("carrito", JSON.stringify(c));
  // Sin eventos: actualizamos UI directo (evita loops)
  updateBadge();
  renderCart();
};

// UI carrito
function openCart() {
  if (!panelCarrito) return;
  panelCarrito.classList.remove("oculto");
  overlay.classList.remove("hidden");
  panelCarrito.setAttribute("aria-hidden", "false");
  panelCarrito.querySelector("button, a, input, select, textarea")?.focus();
}
function closeCart() {
  if (!panelCarrito) return;
  panelCarrito.classList.add("oculto");
  overlay.classList.add("hidden");
  panelCarrito.setAttribute("aria-hidden", "true");
  btnVerCarrito?.focus();
}
function toggleCart() {
  panelCarrito?.classList.contains("oculto") ? openCart() : closeCart();
}

// Badge
function updateBadge() {
  if (!badge) return;
  const carrito = readCart();
  const unidades = carrito.reduce((acc, it) => acc + (Number(it.cantidad) || 0), 0);
  badge.textContent = String(unidades);
}

// Render panel
function renderCart() {
  if (!itemsCarrito || !totalEl) { updateBadge(); return; }
  const carrito = readCart();
  itemsCarrito.innerHTML = "";
  let total = 0;

  carrito.forEach((it) => {
    const sub = (Number(it.precio) || 0) * (Number(it.cantidad) || 0);
    total += sub;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${it.imagen || "assets/img/placeholder.jpg"}" alt="${it.nombre}">
      <div>
        <h4>${it.nombre}</h4>
        <div class="controles">
          <button data-action="menos" data-id="${it.id}">-</button>
          <span>${it.cantidad}</span>
          <button data-action="mas" data-id="${it.id}">+</button>
          <button data-action="eliminar" data-id="${it.id}" title="Eliminar">🗑️</button>
        </div>
      </div>
      <div><strong>${money(sub)}</strong></div>`;
    itemsCarrito.appendChild(div);
  });

  totalEl.textContent = money(total);
  updateBadge();
}

// Acciones carrito
function cartAdd(prod) {
  const carrito = readCart();
  const ex = carrito.find((p) => p.id === prod.id);
  if (ex) ex.cantidad = (Number(ex.cantidad) || 0) + 1;
  else carrito.push({ ...prod, cantidad: 1 });
  writeCart(carrito);
}
function cartQty(id, delta) {
  const carrito = readCart();
  const it = carrito.find((p) => p.id === id);
  if (!it) return;
  it.cantidad = (Number(it.cantidad) || 0) + delta;
  const nuevo = it.cantidad <= 0 ? carrito.filter((p) => p.id !== id) : carrito;
  writeCart(nuevo);
}
function cartRemove(id) { writeCart(readCart().filter((p) => p.id !== id)); }
function cartClear() { writeCart([]); }
function cartGet() { return readCart(); }

// API global
window.Saverio = window.Saverio || {};
window.Saverio.cart = { open: openCart, close: closeCart, toggle: toggleCart, add: cartAdd, qty: cartQty, remove: cartRemove, clear: cartClear, get: cartGet };

// Eventos UI
btnVerCarrito?.addEventListener("click", (e) => { e.preventDefault(); toggleCart(); });
btnCerrarCarrito?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);
window.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

itemsCarrito?.addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return;
  const id = Number(b.dataset.id);
  const act = b.dataset.action;
  if (act === "mas") cartQty(id, +1);
  if (act === "menos") cartQty(id, -1);
  if (act === "eliminar") cartRemove(id);
});
btnVaciar?.addEventListener("click", cartClear);

// Inicial
updateBadge();
renderCart();
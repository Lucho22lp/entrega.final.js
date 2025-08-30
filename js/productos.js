/* Saverio · Productos (versión encapsulada, sin colisiones globales) */
(function () {
  // ---- Helper local (no contamina global) ----
  const money = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(Number(n) || 0);

  // ---- DOM refs SOLO de productos ----
  const cont = document.querySelector("#productos-container");
  const buscador = document.querySelector("#buscador");
  const filtroCat = document.querySelector("#filtro-categoria");
  const ordenSel = document.querySelector("#orden");
  const btnLimpiar = document.querySelector("#btn-limpiar");

  // ---- Estado ----
  let base = [];

  // ---- Render productos ----
  function renderProductos(lista) {
    if (!cont) return;
    cont.innerHTML = "";

    if (!Array.isArray(lista) || !lista.length) {
      cont.innerHTML =
        '<div class="col-12 text-center text-muted py-5">No encontramos productos con esos filtros.</div>';
      return;
    }

    const frag = document.createDocumentFragment();
    lista.forEach((p) => {
      const col = document.createElement("div");
      col.className = "col-12 col-sm-6 col-lg-4";
      col.innerHTML = `
        <div class="producto-card h-100">
          <img src="${p.imagen || "assets/img/placeholder.jpg"}" alt="${p.nombre}">
          <h3>${p.nombre}</h3>
          <p>${p.descripcion || ""}</p>
          <p><strong>${money(p.precio)}</strong></p>
          <button class="btn-agregar" data-id="${p.id}">Agregar al carrito</button>
        </div>`;
      const img = col.querySelector("img");
      if (img) img.onerror = () => (img.src = "assets/img/placeholder.jpg");
      frag.appendChild(col);
    });
    cont.appendChild(frag);
  }

  // ---- Filtros + orden ----
  function aplicarFiltros() {
    const q = (buscador?.value || "").toLowerCase().trim();
    const cat = filtroCat?.value || "";
    const ord = ordenSel?.value || "relevancia";

    let lista = base.filter((p) => {
      const txt = (p.nombre + " " + (p.descripcion || "")).toLowerCase();
      const okTxt = !q || txt.includes(q);
      const okCat = !cat || p.categoria === cat;
      return okTxt && okCat;
    });

    switch (ord) {
      case "precio-asc":  lista.sort((a, b) => a.precio - b.precio); break;
      case "precio-desc": lista.sort((a, b) => b.precio - a.precio); break;
      case "nombre-az":   lista.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
    }

    renderProductos(lista);
  }

  // ---- Eventos UI ----
  buscador?.addEventListener("input", aplicarFiltros);
  filtroCat?.addEventListener("change", aplicarFiltros);
  ordenSel?.addEventListener("change", aplicarFiltros);
  btnLimpiar?.addEventListener("click", () => {
    if (buscador) buscador.value = "";
    if (filtroCat) filtroCat.value = "";
    if (ordenSel) ordenSel.value = "relevancia";
    aplicarFiltros();
  });

  // Click en “Agregar al carrito”
  cont?.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-agregar");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const p = base.find((x) => x.id === id);
    if (p) window.Saverio?.cart?.add(p); // usa la API global de app.js
  });

  // ---- Prefiltro por hash ----
  function aplicarHash() {
    const h = (location.hash || "").toLowerCase();
    if (!filtroCat) return;
    if (h === "#cat-cafe") filtroCat.value = "cafe";
    if (h === "#cat-pasteleria") filtroCat.value = "pasteleria";
  }
  window.addEventListener("hashchange", () => { aplicarHash(); aplicarFiltros(); });

  // ---- Carga JSON ----
  fetch("data/productos.json")
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((d) => {
      const lista = Array.isArray(d) ? d : d.productos;
      base = (lista || []).map((p) => ({ ...p, id: +p.id, precio: +p.precio }));
      aplicarHash();
      aplicarFiltros();
    })
    .catch((err) => {
      console.error("Error cargando productos:", err);
      // Fallback visual si falla el fetch
      base = [
        { id: 1, nombre: "Café Espresso", categoria: "cafe", precio: 800, imagen: "assets/img/placeholder.jpg", descripcion: "Demo" },
        { id: 101, nombre: "Torta Rogel", categoria: "pasteleria", precio: 4500, imagen: "assets/img/placeholder.jpg", descripcion: "Demo" },
      ];
      aplicarFiltros();
    });
})();

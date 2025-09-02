(() => {
  // DOM
  const $lista = document.getElementById("productos-container");
  const $buscador = document.getElementById("buscador");
  const $filtro = document.getElementById("filtro-categoria");
  const $orden = document.getElementById("orden");
  const $limpiar = document.getElementById("btn-limpiar");

  // Estado
  let productos = [];
  let vista = [];
  let iniciado = false;

  // Crear card Bootstrap
  function crearCard(p) {
    const col = document.createElement("div");
    col.className = "col-5 col-sm-3 col-lg-3";

    col.innerHTML = `
      <div class="producto-card h-100">
        <img src="${p.imagen}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>$${p.precio}</strong></p>
        <button class="btn-agregar btn btn-sm" data-id="${p.id}">
          Agregar al carrito
        </button>
      </div>
    `;

    return col;
  }

  // Renderiza la lista de productos
  function render(lista) {
    $lista.innerHTML = "";
    const frag = document.createDocumentFragment();
    lista.forEach(p => frag.appendChild(crearCard(p)));
    $lista.appendChild(frag);
  }

  // Ordena productos
  function ordenar(lista, modo) {
    const out = [...lista];
    switch (modo) {
      case "precio-asc":
        out.sort((a, b) => a.precio - b.precio); break;
      case "precio-desc":
        out.sort((a, b) => b.precio - a.precio); break;
      case "nombre-az":
        out.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      default: /* relevancia */ break;
    }
    return out;
  }

  // Aplica filtros + búsqueda + orden
  function aplicarFiltros() {
    const q = ($buscador?.value || "").trim().toLowerCase();
    const cat = $filtro?.value || "";

    vista = productos.filter(p => {
      const okCat = cat ? p.categoria === cat : true;
      const okTexto =
        p.nombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q);
      return okCat && okTexto;
    });

    vista = ordenar(vista, $orden?.value || "relevancia");
    render(vista);
  }

  // Carga JSON
  async function cargarProductos() {
    try {
      const resp = await fetch("data/productos.json");
      const data = await resp.json();
      productos = Array.isArray(data.productos) ? data.productos : [];
      vista = [...productos];
    } catch (err) {
      console.error("Error al cargar productos.json:", err);
    }
  }

// Delegación para "Agregar al carrito"
$lista.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-agregar");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const prod = productos.find(p => p.id === id);

  if (prod && window.Saverio?.cart?.add) {
    window.Saverio.cart.add(prod);   // ahora llama al carrito real
  } else {
    console.warn("No se pudo agregar al carrito", prod);
  }
});

  // Eventos de controles
  $buscador?.addEventListener("input", aplicarFiltros);
  $filtro?.addEventListener("change", aplicarFiltros);
  $orden?.addEventListener("change", aplicarFiltros);
  $limpiar?.addEventListener("click", () => {
    if ($buscador) $buscador.value = "";
    if ($filtro) $filtro.value = "";
    if ($orden) $orden.value = "relevancia";
    vista = [...productos];
    render(vista);
  });

  // Init
  (async function init() {
    if (iniciado) return;
    iniciado = true;
    await cargarProductos();
    render(vista);
  })();
})();
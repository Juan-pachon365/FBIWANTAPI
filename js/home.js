// home.js
// Vista principal: buscador, filtros y lista

function buscadorfuncion(sza) {
  if (!window.fugitivos) return;
  if (sza.length >= 3) {
    const filtrados = [];
    for (let i = 0; i < window.fugitivos.length; i++) {
      const nombre = (window.fugitivos[i].title || "").toLowerCase();
      if (nombre.includes(sza.toLowerCase())) filtrados.push(window.fugitivos[i]);
    }
    const listaHTML = generarLista(filtrados);
    const cont = document.getElementById("la-lista");
    if (cont) cont.innerHTML = listaHTML;
  } else {
    const listaHTML = generarLista(window.fugitivos || []);
    const cont = document.getElementById("la-lista");
    if (cont) cont.innerHTML = listaHTML;
  }
}

function generarLista(arrayItems) {
  if (!arrayItems || arrayItems.length === 0) return "<div class='empty'>No hay resultados.</div>";
  let listaHTML = "";
  for (let i = 0; i < arrayItems.length; i++) {
    const item = arrayItems[i];
    const id = item.uid || item.id || i;
    let img = "";
    if (item.images && item.images.length > 0) {
      img = item.images[0].thumb || item.images[0].original || item.images[0].large || "";
    }
    if (!img) img = "https://via.placeholder.com/200x120?text=No+Image";

    const title = item.title || "Sin título";
    listaHTML += `
      <div class="c-lista-fugitivo item-${id}" onclick="Detalle('${id}')">
        <p>#${id}</p>
        <img src="${img}" alt="${title}" loading="lazy">
        <p>${title}</p>
      </div>
    `;
  }
  return listaHTML;
}

function Home() {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = "";

  // Buscador
  const buscador = document.createElement("input");
  buscador.classList.add("c-buscador");
  buscador.type = "text";
  buscador.placeholder = "Buscar fugitivo... (mín 3 caracteres)";
  buscador.addEventListener("input", () => buscadorfuncion(buscador.value));

  // Filtros (ejemplo)
  const tipos = ["All", "seeking-info", "most-wanted", "kidnappings", "terrorism", "art-crimes"];

  const contenedorFiltro = document.createElement("div");
  contenedorFiltro.classList.add("tipos-container");
  tipos.forEach(t => {
    const btn = document.createElement("button");
    btn.textContent = t;
    btn.addEventListener("click", () => {
      if (t === "All") FiltroConexion("All");
      else FiltroConexion(t);
    });
    contenedorFiltro.appendChild(btn);
  });

  // Contenedor lista
  const listaHTML = generarLista(window.fugitivos || []);
  const contenedorLista = document.createElement("div");
  contenedorLista.classList.add("c-contenedor-lista");
  contenedorLista.id = "la-lista";
  contenedorLista.innerHTML = listaHTML;

  // Añadir todo
  root.appendChild(buscador);
  root.appendChild(contenedorFiltro);
  root.appendChild(contenedorLista);
}

// favoritos.js
function Favoritos() {
  const root = document.getElementById("root");
  if (!root) return;
  const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

  if (favoritos.length === 0) {
    root.innerHTML = "<div class='empty'>No hay favoritos todavía.</div>";
    return;
  }

  let html = `<div class="c-contenedor-lista">`;
  for (let i = 0; i < favoritos.length; i++) {
    const f = favoritos[i];
    const img = f.img || "https://via.placeholder.com/200x120?text=No+Image";
    html += `
      <div class="c-lista-fugitivo fav-${f.uid}" onclick="Detalle('${f.uid}')">
        <p>#${f.uid}</p>
        <img src="${img}" alt="${f.title}">
        <p>${f.title}</p>
      </div>
    `;
  }
  html += `</div>`;
  root.innerHTML = html;
}

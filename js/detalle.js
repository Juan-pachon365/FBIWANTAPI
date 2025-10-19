// detalle.js
// Mostrar detalle y manejar favoritos

var esFavorito = false;

function toggleFavorito(paramuid, paramtitle, paramimg) {
  let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
  const existe = favoritos.some(f => f.uid === paramuid);

  if (existe) {
    favoritos = favoritos.filter(f => f.uid !== paramuid);
    esFavorito = false;
  } else {
    favoritos.push({ uid: paramuid, title: paramtitle, img: paramimg });
    esFavorito = true;
  }

  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  const boton = document.querySelector(`#corazon-${paramuid}`);
  if (boton) boton.textContent = esFavorito ? "❤️" : "🤍";
}

async function Detalle(parametro) {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = "<div class='empty'>Cargando detalle...</div>";

  // Buscar en cache
  let data = null;
  if (window.fugitivos && window.fugitivos.length > 0) {
    data = window.fugitivos.find(it => String(it.uid) === String(parametro) || String(it.id) === String(parametro));
  }

  // Si no está, pedir al endpoint específico (probamos dos rutas posibles)
  if (!data) {
    try {
      const endpoints = [
        `https://api.fbi.gov/@wanted-person/${parametro}`,
        `https://api.fbi.gov/@wanted/${parametro}`
      ];
      for (let i = 0; i < endpoints.length && !data; i++) {
        try {
          const res = await fetch(endpoints[i]);
          if (!res.ok) continue;
          const json = await res.json();
          // en algunos endpoints la respuesta está con la estructura directa
          data = json;
        } catch (err) {
          // ignorar y seguir a siguiente endpoint
        }
      }
    } catch (err) {
      console.error("Error detalle fetch:", err);
    }
  }

  if (!data) {
    root.innerHTML = "<div class='empty'>No se encontró información detallada para este UID.</div>";
    return;
  }

  // Favoritos
  const favs = JSON.parse(localStorage.getItem("favoritos")) || [];
  const uid = data.uid || data.id || parametro;
  esFavorito = favs.some(f => String(f.uid) === String(uid));

  // Campos
  const title = data.title || "Sin título";
  const description = data.description || data.details || "No hay descripción disponible.";
  let img = "";
  if (data.images && data.images.length > 0) {
    img = data.images[0].original || data.images[0].large || data.images[0].thumb || "";
  }
  if (!img) img = "https://via.placeholder.com/320x220?text=No+Image";
  const reward = data.reward_text || data.reward || "No disponible";
  const status = data.status || "unknown";
  const publication = data.publication || data.modified || data.date_of_entry || "";

  // Montar HTML
  const detalle = `
    <section class="c-detalle">
      <img src="${img}" alt="${title}">
      <h2>${title}</h2>
      <p><strong>UID:</strong> ${uid}</p>
      <p><strong>Estado:</strong> ${status}</p>
      <p><strong>Publicado:</strong> ${publication ? new Date(publication).toLocaleString() : '—'}</p>
      <p><strong>Recompensa:</strong> ${reward}</p>
      <hr style="border-color:rgba(255,255,255,0.03);margin:8px 0">
      <div>${description}</div>
      <div style="margin-top:10px;">
        <button onClick="toggleFavorito('${uid}','${(title+"").replace(/'/g,"\\'")}','${img}')">
          <span id="corazon-${uid}">${esFavorito ? '❤️' : '🤍'}</span> Favorito
        </button>
      </div>
    </section>
  `;
  root.innerHTML = detalle;
}

// capturados.js
// Simula un "álbum de capturas": guardamos UIDs en localStorage en 'misIds'

var misIds = JSON.parse(localStorage.getItem("misIds")) || [];

function Aleatorios(){
  const rootNuevos = document.getElementById("nuevos");
  if (!rootNuevos || !window.fugitivos || window.fugitivos.length === 0) return;
  rootNuevos.innerHTML = "";
  let nuevosHtml = "";

  for (let i = 0; i < 4; i++) {
    const idx = Math.floor(Math.random() * window.fugitivos.length);
    const item = window.fugitivos[idx];
    const uid = item.uid || item.id || idx;
    const title = item.title || "Sin título";
    const img = (item.images && item.images[0] && (item.images[0].thumb || item.images[0].original)) || "https://via.placeholder.com/80?text=No";

    nuevosHtml += `
      <div class="c-lista-fugitivo c-un_aleatorio" style="min-width:140px;">
        <p>${uid}</p>
        <img src="${img}" alt="${title}" width="60" height="60">
        <p style="font-size:13px">${title}</p>
      </div>
    `;

    // Añadir a misIds si no existe
    misIds = JSON.parse(localStorage.getItem("misIds")) || [];
    if (!misIds.includes(String(uid))) {
      misIds.push(String(uid));
      localStorage.setItem("misIds", JSON.stringify(misIds));
    }
  }

  rootNuevos.innerHTML += nuevosHtml;
  const contadorEl = document.getElementById("contador");
  if (contadorEl) contadorEl.innerText = `${misIds.length} / ${window.fugitivos.length}`;
}

function Capturados(){
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = "";

  const capturaAleatoria = document.createElement("section");
  capturaAleatoria.classList.add("c-lista");
  capturaAleatoria.id = "nuevos";

  const boton = document.createElement("button");
  boton.textContent = "4 nuevos";
  boton.classList.add("large");
  boton.addEventListener("click", Aleatorios);

  const seccioncapturados = document.createElement("section");
  seccioncapturados.classList.add("c-lista");

  misIds = JSON.parse(localStorage.getItem("misIds")) || [];

  if (misIds.length === 0) {
    seccioncapturados.innerHTML = "<div class='empty'>No se han registrado capturas todavía.</div>";
  } else {
    let misHtml = "";
    for (let j = 0; j < misIds.length; j++) {
      const uid = misIds[j];
      const itm = (window.fugitivos || []).find(x => String(x.uid) === String(uid) || String(x.id) === String(uid));
      let img = "https://via.placeholder.com/80?text=No";
      let title = uid;
      if (itm) {
        img = (itm.images && itm.images[0] && (itm.images[0].thumb || itm.images[0].original)) || img;
        title = itm.title || title;
        misHtml += `
          <div class="c-unpoke c-mios-pokemon" onclick="Detalle('${uid}')">
            <img src="${img}" width="auto" height="45" loading="lazy" alt="${uid}">
            <p style="font-size:12px">${title}</p>
          </div>
        `;
      } else {
        misHtml += `
          <div class="c-unpoke" id="c-unpoke-${uid}">
            <p>${uid}</p>
          </div>
        `;
      }
    }
    seccioncapturados.innerHTML = misHtml;
  }

  let contador = document.createElement("p");
  contador.textContent = `${misIds.length} / ${(window.fugitivos || []).length}`;
  contador.id = "contador";

  root.appendChild(contador);
  root.appendChild(boton);
  root.appendChild(capturaAleatoria);
  root.appendChild(seccioncapturados);
}

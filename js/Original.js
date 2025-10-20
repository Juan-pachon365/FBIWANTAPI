// original.js
// mini juego para adivinar quien es el fugitivo según su foto
// versión corregida y más robusta

function Original() {
  const root = document.getElementById("root");
  if (!root) return console.error("No existe el elemento #root en el DOM");
  root.innerHTML = ""; // limpio el contenido anterior

  // Si aún no hay fugitivos cargados, mostramos un mensaje
  if (!window.fugitivos || !Array.isArray(window.fugitivos) || window.fugitivos.length === 0) {
    root.innerHTML = "<div class='empty'>Cargando fugitivos... (abre la consola para más detalles)</div>";
    console.warn("window.fugitivos vacío. Asegúrate de que conexion.js haya cargado los datos antes.");
    return;
  }

  // Crear sección principal
  const section = document.createElement("section");
  section.classList.add("c-original");

  // Título
  const titulo = document.createElement("h2");
  titulo.textContent = "🎯 Identifica al Fugitivo";
  section.appendChild(titulo);

  // Elegir un fugitivo correcto aleatorio
  const lista = window.fugitivos;
  const idxCorrecto = Math.floor(Math.random() * lista.length);
  const fugitivoCorrecto = lista[idxCorrecto];

  // Construir array de 4 opciones (1 correcto + 3 distintos)
  const opciones = [fugitivoCorrecto];
  const usados = new Set();
  usados.add(fugitivoCorrecto.uid || String(idxCorrecto));

  while (opciones.length < 4 && opciones.length < lista.length) {
    const candidato = lista[Math.floor(Math.random() * lista.length)];
    const idC = candidato.uid || (candidato.id || JSON.stringify(candidato));
    if (!usados.has(idC)) {
      usados.add(idC);
      opciones.push(candidato);
    }
  }

  // Si la API tiene pocos items, puede que no lleguemos a 4; está bien.
  // Mezclamos las opciones
  opciones.sort(() => Math.random() - 0.5);

  // Imagen del fugitivo correcto (con comprobaciones)
  const imagenDiv = document.createElement("div");
  imagenDiv.classList.add("c-imagen-fugitivo");

  let imgUrl = "";
  if (fugitivoCorrecto && Array.isArray(fugitivoCorrecto.images) && fugitivoCorrecto.images.length > 0) {
    const imgObj = fugitivoCorrecto.images[0] || {};
    imgUrl = imgObj.thumb || imgObj.original || imgObj.large || "";
  }
  if (!imgUrl) imgUrl = "https://via.placeholder.com/200x200?text=No+Image";

  // Insertamos la imagen con texto alternativo seguro
  const altText = fugitivoCorrecto && fugitivoCorrecto.title ? escapeHtml(fugitivoCorrecto.title) : "Imagen fugitivo";
  imagenDiv.innerHTML = `<img src="${imgUrl}" alt="${altText}">`;
  section.appendChild(imagenDiv);

  // Pregunta
  const pregunta = document.createElement("p");
  pregunta.id = "pregunta";
  pregunta.textContent = "¿Quién es este fugitivo?";
  section.appendChild(pregunta);

  // Contenedor de opciones
  const opcionesDiv = document.createElement("div");
  opcionesDiv.classList.add("c-opciones");

  opciones.forEach((f) => {
    const btn = document.createElement("button");
    btn.classList.add("opcion-btn");
    // Usamos textContent para evitar inyección
    btn.textContent = f.title || "Sin nombre";
    btn.addEventListener("click", () => verificarRespuesta(f, fugitivoCorrecto));
    opcionesDiv.appendChild(btn);
  });

  section.appendChild(opcionesDiv);

  // Botón siguiente
  const siguiente = document.createElement("button");
  siguiente.textContent = "Siguiente caso";
  siguiente.classList.add("siguiente-btn");
  siguiente.addEventListener("click", () => Original());
  section.appendChild(siguiente);

  root.appendChild(section);
}

// función que compara selección y marca botones
function verificarRespuesta(fugitivoElegido, fugitivoCorrecto) {
  const botones = document.querySelectorAll(".opcion-btn");
  const preguntaEl = document.getElementById("pregunta");
  if (!preguntaEl) return;

  botones.forEach((btn) => {
    btn.disabled = true;
    btn.style.cursor = "not-allowed";

    // marcar el botón que coincide con el título del correcto
    if (btn.textContent === (fugitivoCorrecto.title || "")) {
      btn.style.backgroundColor = "#1f8a5a";
      btn.style.color = "white";
    }
    // marcar en rojo el elegido si es incorrecto
    if (btn.textContent === (fugitivoElegido.title || "") &&
        String((fugitivoElegido.uid || fugitivoElegido.id || "")) !== String((fugitivoCorrecto.uid || fugitivoCorrecto.id || ""))) {
      btn.style.backgroundColor = "#a81e2b";
      btn.style.color = "white";
    }
  });

  // Mensaje
  const idEl = fugitivoElegido.uid || fugitivoElegido.id || "";
  const idCorrect = fugitivoCorrecto.uid || fugitivoCorrecto.id || "";
  if (String(idEl) === String(idCorrect)) {
    preguntaEl.textContent = "✅ Correcto, buena deducción agente.";
  } else {
    preguntaEl.textContent = `❌ Incorrecto. El fugitivo correcto era: "${fugitivoCorrecto.title || 'Sin nombre'}".`;
  }
}

// pequeña función util para escapar texto usado en alt (evita errores con comillas)
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

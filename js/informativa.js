// informativa.js
// Página informativa sobre cómo el FBI realiza sus investigaciones

function Informativa() {
  const root = document.getElementById("root");
  root.innerHTML = "";

  const contenedor = document.createElement("div");
  contenedor.classList.add("info-contenedor");

  contenedor.innerHTML = `
    <h1>Operaciones e Investigaciones del FBI</h1>
    <p>
      El <strong>Federal Bureau of Investigation (FBI)</strong> es la principal agencia de investigación
      criminal de los Estados Unidos. Su misión es proteger y defender al país frente a amenazas terroristas
      y de inteligencia extranjera, hacer cumplir las leyes federales y garantizar la seguridad y justicia para todos.
    </p>

    <section class="info-seccion">
      <h2>🕵️‍♂️ Metodología de Investigación</h2>
      <p>
        Las investigaciones del FBI combinan tecnología avanzada, análisis forense y trabajo de campo.
        Cada caso involucra agentes especializados que recogen evidencia, entrevistan testigos y
        colaboran con agencias locales e internacionales.
      </p>
    </section>

    <section class="info-seccion">
      <h2>📂 Bases de Datos y Tecnología</h2>
      <p>
        El FBI mantiene una de las bases de datos criminales más grandes del mundo,
        incluyendo huellas dactilares, ADN y perfiles de fugitivos. Su división de ciencia y tecnología
        utiliza inteligencia artificial, análisis de redes y rastreo digital para resolver casos complejos.
      </p>
    </section>

    <section class="info-seccion">
      <h2>🤝 Colaboración Internacional</h2>
      <p>
        El FBI colabora estrechamente con Interpol, Europol y otras agencias de inteligencia
        para combatir el crimen transnacional. Sus oficinas en el extranjero (Legal Attachés)
        sirven como puntos de enlace directo con gobiernos aliados.
      </p>
    </section>

    <section class="info-seccion">
      <h2>⚖️ Compromiso con la Justicia</h2>
      <p>
        Más allá de capturar fugitivos, el FBI busca proteger los derechos civiles y la libertad.
        Su trabajo está guiado por principios de ética, transparencia y servicio público.
      </p>
    </section>

    <p class="info-final">
      🔗 Para más información oficial visita: 
      <a href="https://www.fbi.gov" target="_blank" rel="noopener">www.fbi.gov</a>
    </p>
  `;

  root.appendChild(contenedor);
}

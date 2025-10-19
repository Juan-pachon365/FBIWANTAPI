// conexion.js (versión robusta)
// Trae los registros paginados de la API del FBI y los guarda en window.fugitivos.
// Hace peticiones por página, respeta límites y muestra estado mientras carga.

let fugitivos = [];
let _cargando = false;
let _paginaActual = 0;
let _totalPaginasEstimadas = null;

// CONFIGURACIÓN
const ESPERA_MS = 220;        // espera entre peticiones (para suavizar rate limits)
const MAX_PAGINAS = 200;      // tope por seguridad (ajusta si quieres más)
const CARGAR_TODAS = true;    // si false, sólo cargará la primera página (útil para debug)

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function mostrarEstado(msg, progreso=false) {
  const root = document.getElementById("root");
  if (!root) return;
  // intenta reutilizar un contenedor de estado
  let cont = document.getElementById("estado-carga-fbi");
  if (!cont) {
    cont = document.createElement("div");
    cont.id = "estado-carga-fbi";
    cont.style.color = "var(--accent)";
    cont.style.margin = "18px 0";
    cont.style.fontWeight = "700";
    root.prepend(cont); // poner arriba
  }
  cont.innerHTML = progreso ? `<div>${msg}</div>` : `<div>${msg}</div>`;
}

// función que obtiene una página y devuelve {items, headers, ok}
async function pedirPagina(page) {
  try {
    const url = `https://api.fbi.gov/@wanted?page=${page}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Página ${page} devolvió status ${res.status}`);
      return { ok: false, items: [], headers: res.headers };
    }
    const json = await res.json();
    const items = json.items || [];
    return { ok: true, items, json, headers: res.headers };
  } catch (err) {
    console.error("Error fetch página", page, err);
    return { ok: false, items: [], headers: new Headers() };
  }
}

// función principal que descarga páginas hasta que no haya más o se llegue a MAX_PAGINAS
async function conexionLista() {
  if (_cargando) return window.fugitivos || [];
  _cargando = true;
  fugitivos = [];
  _paginaActual = 0;
  _totalPaginasEstimadas = null;

  // mostrar mensaje de carga
  mostrarEstado("Iniciando descarga de registros del FBI...");

  try {
    let page = 1;
    let seguir = true;

    // Si CARGAR_TODAS es false, solo pedimos la primera página (útil para pruebas rápidas)
    if (!CARGAR_TODAS) {
      const resp = await pedirPagina(1);
      if (resp.ok) {
        fugitivos.push(...resp.items);
        window.fugitivos = fugitivos;
      }
      _cargando = false;
      mostrarEstado(`Cargada página 1 — ${fugitivos.length} registros (modo DEBUG)`);
      return fugitivos;
    }

    while (seguir) {
      if (page > MAX_PAGINAS) {
        console.warn(`Tope MAX_PAGINAS alcanzado (${MAX_PAGINAS}). Deteniendo descarga.`)
        break;
      }

      mostrarEstado(`Solicitando página ${page}... (registros acumulados: ${fugitivos.length})`, true);

      const resp = await pedirPagina(page);

      // si la petición falló, intentar de nuevo una vez y si vuelve a fallar, detener.
      if (!resp.ok) {
        // esperar y reintentar una vez
        await sleep(500);
        const retry = await pedirPagina(page);
        if (!retry.ok) {
          console.error(`No se pudo obtener la página ${page}. Interrumpiendo carga.`);
          break;
        } else {
          resp.items = retry.items;
          resp.headers = retry.headers;
        }
      }

      // agregar resultados
      if (resp.items && resp.items.length > 0) {
        fugitivos.push(...resp.items);
        _paginaActual = page;

        // intentar leer cabeceras de rate limit si existen
        const remaining = resp.headers.get ? resp.headers.get("X-RateLimit-Remaining") : null;
        const limit = resp.headers.get ? resp.headers.get("X-RateLimit-Limit") : null;
        if (remaining !== null) {
          mostrarEstado(`Página ${page} cargada — items: ${resp.items.length}. RateLimit remaining: ${remaining}/${limit}`);
          // si nos acercamos a 0, paramos para prevenir bloqueos
          const remNum = Number(remaining);
          if (!isNaN(remNum) && remNum <= 2) {
            console.warn("RateLimit bajo. Deteniendo descargas adicionales para no agotar el límite.");
            break;
          }
        } else {
          mostrarEstado(`Página ${page} cargada — items: ${resp.items.length}`);
        }

        // si la API nos devuelve meta con total_pages, lo guardamos (algunos endpoints lo incluyen)
        if (resp.json && resp.json.pagination && resp.json.pagination.total_pages) {
          _totalPaginasEstimadas = resp.json.pagination.total_pages;
          if (page >= _totalPaginasEstimadas) {
            // llegamos al final
            break;
          }
        }

        page++;
        // esperar un poco para evitar bloqueos
        await sleep(ESPERA_MS);
      } else {
        // no hay items -> fin
        mostrarEstado(`Página ${page} no devolvió items. Descarga finalizada.`);
        seguir = false;
        break;
      }
    } // end while

    window.fugitivos = fugitivos;
    _cargando = false;
    mostrarEstado(`Descarga finalizada. Registros obtenidos: ${fugitivos.length}`);
    return fugitivos;

  } catch (err) {
    _cargando = false;
    console.error("Error en conexionLista:", err);
    mostrarEstado("Error al descargar registros. Revisa consola.");
    return fugitivos;
  }
}

// General() inicial que usa conexionLista() y luego llama a Home()
async function General() {
  try {
    // mostrarmos mensaje de carga visible
    const root = document.getElementById("root");
    if (root) root.innerHTML = "<div class='empty'>Cargando fugitivos del FBI... Espera (puede tardar varios segundos).</div>";

    // Si ya hay datos en window.fugitivos, los usamos
    if (window.fugitivos && window.fugitivos.length > 0) {
      fugitivos = window.fugitivos;
    } else {
      // Descargar (esto puede tardar si hay muchas páginas)
      await conexionLista();
    }

    // Llamar a Home (home.js) para renderizar
    if (typeof Home === "function") Home();
  } catch (err) {
    console.error("Error en General():", err);
    const root = document.getElementById("root");
    if (root) root.innerHTML = "<div class='empty'>No se pudo cargar la lista. Revisa la consola.</div>";
  }
}

// FiltroConexion: igual que antes, pero asegurándonos de tener datos
async function FiltroConexion(Elfiltro) {
  const cont = document.getElementById("la-lista");
  if (!cont) return;

  // Asegurarnos de tener la lista (si no, descargar la primera página)
  if (!window.fugitivos || window.fugitivos.length === 0) {
    await conexionLista();
  }

  if (Elfiltro === "All") {
    cont.innerHTML = generarLista(window.fugitivos || []);
    return;
  }

  const filt = (window.fugitivos || []).filter(item => {
    const title = (item.title || "").toLowerCase();
    const desc = (item.description || "").toLowerCase();
    return title.includes(Elfiltro.toLowerCase()) || desc.includes(Elfiltro.toLowerCase());
  });

  cont.innerHTML = generarLista(filt);
}

// Export (si usas módulos) - no obligatorio
// export { General, FiltroConexion };

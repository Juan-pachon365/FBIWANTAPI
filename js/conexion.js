// conexion.js — versión funcional con proxy para evitar CORS
(function(window){
  // Usamos proxy gratuito para poder consumir la API desde Live Server
  const BASE = 'https://corsproxy.io/?https://api.fbi.gov/@wanted';
  const PAGE_SIZE = 20; // limitar para no saturar

  async function fetchPage(page) {
    const url = `${BASE}?page=${page}&pagesize=${PAGE_SIZE}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error('Error HTTP ' + res.status);
    return res.json();
  }

  async function fetchAll(onProgress) {
    let page = 1;
    let all = [];
    while (true) {
      const json = await fetchPage(page);
      const items = json.items || [];
      all = all.concat(items);
      if (typeof onProgress === 'function') onProgress(all.length);
      if (items.length < PAGE_SIZE) break;
      page++;
    }
    return all;
  }

  async function fetchByUid(uid) {
    const url = `https://corsproxy.io/?https://api.fbi.gov/@wanted/${uid}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error('No encontrado');
    return res.json();
  }

  window.fbiService = { fetchAll, fetchByUid };
})(window);

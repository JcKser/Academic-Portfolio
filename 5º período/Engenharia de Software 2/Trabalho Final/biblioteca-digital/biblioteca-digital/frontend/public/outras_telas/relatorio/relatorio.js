// relatorio.js — Versão Final com Exportação de PDF

/* ============================================================
   1. CONFIGURAÇÃO E ROTAS
   ============================================================ */
const ROUTE_MAP = {
  painel: { mode: 'local', viewId: 'view-painel' },
  perfil:      { mode: 'fetch', url: '../perfil/perfil.html', initName: 'initPerfil' },
  emprestimos: { mode: 'fetch', url: '../historico/historico.html', initName: 'initHistorico' },
  reservas:    { mode: 'fetch', url: '../reservas/reservas.html' },
  suporte:     { mode: 'fetch', url: '../suporte/suporte.html' }
};

const TRANS_MS = 200;
const mainContainer = document.getElementById('mainContainer');

if (!mainContainer) console.error('ERRO CRÍTICO: #mainContainer não encontrado.');

/* ============================================================
   2. UTILITÁRIOS GERAIS
   ============================================================ */
function wait(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

function addBlocker(){
  if(!document.getElementById('viewBlocker')){
    const b = document.createElement('div');
    b.id = 'viewBlocker';
    b.className = 'view-blocker';
    b.style.cssText = "position:absolute; inset:0; z-index:9999; cursor:wait;";
    if(mainContainer) mainContainer.appendChild(b);
  }
}

function removeBlocker(){ 
  const b = document.getElementById('viewBlocker'); 
  if(b) b.remove(); 
}

function setActiveLink(route){
  const links = document.querySelectorAll('[data-route]');
  links.forEach(a => {
    if (a.dataset.route === route) a.classList.add('active');
    else a.classList.remove('active');
  });
}

function fadeInContainer() {
  if(!mainContainer) return;
  mainContainer.style.transition = `opacity ${TRANS_MS}ms ease`;
  void mainContainer.offsetWidth; 
  mainContainer.style.opacity = '1';
}

/* ============================================================
   3. EXPORTAR PDF (NOVA FUNÇÃO)
   ============================================================ */
async function exportarPDF() {
  const btn = document.getElementById('exportPdfBtn');
  if(btn) {
      const originalText = btn.innerText;
      btn.innerText = "Gerando...";
      btn.disabled = true;
      
      try {
          const token = localStorage.getItem('BIB_TOKEN');
          const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
          
          // Pega ID do usuário para filtrar o relatório
          const me = await fetchCurrentUserForReports();
          const userQuery = (me && me.id) ? `?user_id=${encodeURIComponent(me.id)}` : '';

          // Chama o backend
          const response = await fetch(`${API_BASE}/export/pdf${userQuery}`, { headers });

          if (!response.ok) throw new Error("Erro ao gerar PDF no servidor");

          // Converte a resposta em BLOB (arquivo binário)
          const blob = await response.blob();
          
          // Cria um link invisível para forçar o download
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Relatorio_Biblioteca_${new Date().toISOString().slice(0,10)}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          // Limpeza
          window.URL.revokeObjectURL(url);
          a.remove();

      } catch (error) {
          console.error("Erro no PDF:", error);
          alert("Não foi possível baixar o PDF. Verifique se o Backend está rodando.");
      } finally {
          btn.innerText = originalText;
          btn.disabled = false;
      }
  }
}

/* ============================================================
   4. ROUTER E FETCH DE VIEWS
   ============================================================ */
function resolveRelativeAssets(htmlText, partialUrl) {
  try {
    const base = new URL(partialUrl, location.href);
    const tmp = document.createElement('div');
    tmp.innerHTML = htmlText;
    const selector = 'link[href], script[src], img[src], a[href], form[action]';
    Array.from(tmp.querySelectorAll(selector)).forEach(el => {
      const attr = el.hasAttribute('href') ? 'href' : (el.hasAttribute('src') ? 'src' : 'action');
      const val = el.getAttribute(attr);
      if (!val || val.startsWith('#') || val.startsWith('javascript:') || val.startsWith('mailto:')) return;
      try { el[attr] = new URL(val, base).href; } catch(e){}
    });
    return tmp.innerHTML;
  } catch(e) { return htmlText; }
}

async function showLocalView(viewId) {
  try { document.body.classList.remove('historico-page'); } catch(e){}
  const current = mainContainer.querySelector('.view.active');
  if (current && current.id === viewId) {
    if (viewId === 'view-painel') initPanelView();
    fadeInContainer();
    return;
  }
  addBlocker();
  mainContainer.style.opacity = '0';
  await wait(TRANS_MS);

  const dyn = document.getElementById('dynamicView');
  if (dyn) dyn.remove();
  if (current) {
    current.classList.remove('active');
    current.style.display = 'none';
  }
  const next = document.getElementById(viewId);
  if (next) {
    next.style.display = 'block';
    setTimeout(() => next.classList.add('active'), 10);
    if (viewId === 'view-painel') initPanelView();
  }
  fadeInContainer();
  await wait(TRANS_MS);
  removeBlocker();
  history.pushState({route: 'painel'}, '', '#painel');
}

const fetchCache = {};

async function loadFetchView(routeCfg, routeName) {
  try { document.body.classList.remove('historico-page'); } catch(e){}
  addBlocker();
  mainContainer.style.opacity = '0';
  await wait(TRANS_MS);
  
  const dyn = document.getElementById('dynamicView');
  if (dyn) dyn.remove();
  document.querySelectorAll('.view').forEach(v => {
    v.style.display = 'none';
    v.classList.remove('active');
  });

  try {
    let html;
    if (fetchCache[routeName]) html = fetchCache[routeName];
    else {
      const res = await fetch(routeCfg.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`${res.status}`);
      html = await res.text();
    }
    const resolvedHtml = resolveRelativeAssets(html, routeCfg.url);
    const tmp = document.createElement('div');
    tmp.innerHTML = resolvedHtml;
    
    Array.from(tmp.querySelectorAll('link[rel="stylesheet"]')).forEach(link => {
      const href = link.getAttribute('href');
      if (href && !document.head.querySelector(`link[href="${href}"]`)) {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet'; newLink.href = href;
        document.head.appendChild(newLink);
      }
      link.remove();
    });

    const newView = document.createElement('section');
    newView.id = 'dynamicView';
    newView.className = 'view active';
    newView.innerHTML = tmp.innerHTML;
    await wait(10);
    mainContainer.appendChild(newView);
    try { ensureTableScrollWrappers(); } catch(e){} 

    Array.from(newView.querySelectorAll('script:not([src])')).forEach(s => {
      try { const ns = document.createElement('script'); ns.textContent = s.textContent; document.body.appendChild(ns); } catch(e){}
    });
    
    const scriptUrl = routeCfg.url.replace(/\.html?$/i, '.js');
    if (!document.querySelector(`script[data-route="${routeName}"]`)) {
      const s = document.createElement('script'); s.src = scriptUrl; s.dataset.route = routeName;
      s.onload = () => triggerInit(routeName, routeCfg.initName);
      s.onerror = () => triggerInit(routeName, routeCfg.initName);
      document.body.appendChild(s);
    } else triggerInit(routeName, routeCfg.initName);

  } catch (err) {
    mainContainer.innerHTML = `<div class="panel">Erro: ${err.message}</div>`;
  }
  fadeInContainer();
  await wait(TRANS_MS);
  removeBlocker();
  history.pushState({route: routeName}, '', `#${routeName}`);
}

function triggerInit(name, initName) {
  const candidates = [];
  if (initName) candidates.push(initName);
  candidates.push('init' + name.charAt(0).toUpperCase() + name.slice(1));
  for (const fn of candidates) {
    if (typeof window[fn] === 'function') { try { window[fn](); } catch(e) {} return; }
  }
  if (typeof window.onViewShow === 'function') window.onViewShow(name);
}

async function navigateTo(route) {
  const cfg = ROUTE_MAP[route];
  if (!cfg) return;
  setActiveLink(route);
  if (cfg.mode === 'local') return showLocalView(cfg.viewId);
  if (cfg.mode === 'fetch') return loadFetchView(cfg, route);
}

function initRouterBindings() {
  const links = document.querySelectorAll('[data-route]');
  links.forEach(a => {
    const newLink = a.cloneNode(true);
    a.parentNode.replaceChild(newLink, a);
    newLink.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(newLink.dataset.route);
    });
  });
}

window.addEventListener('popstate', () => {
  const route = location.hash.replace('#', '') || 'painel';
  navigateTo(route);
});

/* ============================================================
   5. LÓGICA DO PAINEL & DADOS
   ============================================================ */
const API_BASE = "http://127.0.0.1:8080/api/reports";

async function fetchJSON(url) {
  try {
    const headers = {};
    const token = localStorage.getItem('BIB_TOKEN');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const r = await fetch(url, { headers, cache: 'no-store' });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

async function fetchCurrentUserForReports(){
  try{
    const token = localStorage.getItem('BIB_TOKEN');
    if(!token) return null;
    const backend = (window.BACKEND_URL || '').replace(/\/$/, '') || '';
    const url = (backend || '') + '/api/auth/me';
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
    return res.ok ? await res.json() : null;
  } catch(e){ return null; }
}

async function initPanelView() {
  console.log("Atualizando Painel...");
  const me = await fetchCurrentUserForReports();
  const userQuery = (me && me.id) ? `?user_id=${encodeURIComponent(me.id)}` : '';
  
  await Promise.all([
    loadSummary(userQuery),
    loadChart(userQuery),
    loadTopBooks(userQuery),
    loadDueSoon(userQuery).then(list => {
      if(window.NotificationModule) window.NotificationModule.checkNow({dueList: list});
    })
  ]);
}

async function loadSummary(userQuery) {
  const data = await fetchJSON(`${API_BASE}/summary${userQuery}`);
  if (!data) return;
  const set = (id, val) => { const el=document.getElementById(id); if(el) el.innerText=val??'-'; };
  set("statLoans", data.loans_current ?? data.emprestimos_atuais);
  set("statDueSoon", data.loans_overdue ?? data.atrasados);
  set("statReserves", data.reservations_active ?? data.reservas);
  set("statRead", data.books_read_year ?? data.lidos_ano);
}

let _chart = null;
async function loadChart(userQuery) {
  const cvs = document.getElementById("readingChart");
  if (!cvs) return;
  const data = await fetchJSON(`${API_BASE}/monthly-loans${userQuery}`);
  const ctx = cvs.getContext("2d");
  if (_chart) { _chart.destroy(); _chart = null; }
  
  const grad = ctx.createLinearGradient(0,0,0,400);
  grad.addColorStop(0,'#38bdf8'); grad.addColorStop(1,'#1e3a8a');
  let vals = Array(12).fill(0);
  if (Array.isArray(data)) {
    data.forEach(i => {
      let m = parseInt(i.month||i.mes||0);
      let c = parseInt(i.count||i.total||0);
      if(m===0 && (i.date||i.read_at)) try{m=new Date(i.date||i.read_at).getMonth()+1;c=1}catch(e){}
      if(m>0 && m<=12) vals[m-1]+=c;
    });
  }
  _chart = new Chart(ctx, {
    type: "bar",
    data: { labels: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"], datasets: [{ label:"Livros", data:vals, backgroundColor:grad, borderRadius:6 }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ x:{grid:{display:false}}, y:{beginAtZero:true, grid:{borderDash:[5,5]}} } }
  });
}

async function loadTopBooks(userQuery) {
  const data = await fetchJSON(`${API_BASE}/top-books${userQuery}`);
  const tb = document.getElementById("tableTopBooks");
  if(!tb) return;
  tb.innerHTML = "";
  if(!data?.length) { tb.innerHTML='<tr><td colspan="2">Sem dados</td></tr>'; return; }
  data.forEach(b => tb.insertAdjacentHTML('beforeend', `<tr><td>${b.title}</td><td style="text-align:right;font-weight:700;color:#2563eb">${b.count}</td></tr>`));
  try { ensureTableScrollWrappers(); } catch(e){}
}

async function loadDueSoon(userQuery) {
  const data = await fetchJSON(`${API_BASE}/due-soon${userQuery}`);
  const tb = document.getElementById("tableDueSoon");
  if(!tb) return [];
  tb.innerHTML = "";
  if(!data?.length) { tb.innerHTML='<tr><td colspan="2">Nada próximo</td></tr>'; return []; }
  data.forEach(i => {
    let d = i.due_date||i.due_at; 
    try{d=new Date(d).toLocaleDateString('pt-BR')}catch{}
    tb.insertAdjacentHTML('beforeend', `<tr><td>${i.title}</td><td style="text-align:right;color:#ef4444;font-weight:600">${d}</td></tr>`);
  });
  try { ensureTableScrollWrappers(); } catch(e){}
  return data;
}

function ensureTableScrollWrappers() {
  document.querySelectorAll('.panel').forEach(panel => {
    const tbl = panel.querySelector('table');
    if (!tbl) return;
    if (tbl.parentElement && tbl.parentElement.classList.contains('table-scroll-wrapper')) return;
    
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll-wrapper'; 
    tbl.parentNode.insertBefore(wrap, tbl);
    wrap.appendChild(tbl);
  });
}

const NotificationModule = (function(){
  let seen = [];
  try { seen = JSON.parse(localStorage.getItem('REL_NOTIF_SEEN')||'[]'); } catch{}
  function notify(title, body) {
    const id = title+body;
    if(seen.includes(id)) return;
    const t = document.createElement('div');
    t.style.cssText = "position:fixed;right:20px;bottom:20px;background:#fff;padding:15px;box-shadow:0 5px 20px rgba(0,0,0,0.2);border-radius:10px;z-index:99999;font-family:sans-serif;";
    t.innerHTML = `<strong>${title}</strong><div style="font-size:12px">${body}</div>`;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 5000);
    seen.push(id);
    localStorage.setItem('REL_NOTIF_SEEN', JSON.stringify(seen));
  }
  function checkNow({dueList}={}) {
    if(!dueList) return;
    const now = new Date();
    dueList.forEach(i => {
      const d = new Date(i.due_date||i.due_at);
      const diff = Math.ceil((d-now)/(86400000));
      if(diff<=3 && diff>=0) notify("Devolução Próxima", `${i.title} vence em ${diff} dias.`);
    });
  }
  return { checkNow };
})();
window.NotificationModule = NotificationModule;

/* ============================================================
   6. INIT E BINDS DE BOTÕES
   ============================================================ */
window.addEventListener('load', async () => {
  if(mainContainer) mainContainer.style.opacity = '1';
  initRouterBindings();
  
  // Binds de botões do painel
  document.getElementById("refreshBtn")?.addEventListener("click", initPanelView);
  
  // *** AQUI ESTÁ A CORREÇÃO: Liga o botão de PDF ***
  document.getElementById("exportPdfBtn")?.addEventListener("click", exportarPDF);
  
  try { ensureTableScrollWrappers(); } catch(e){}
  const start = location.hash.replace('#', '') || 'painel';
  await navigateTo(start);
});
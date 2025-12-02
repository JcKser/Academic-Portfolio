// historico.js — Integrado com BIB_HISTORY e com paginação inteligente
(function(){
  'use strict';

  const BACKEND = (window.BACKEND_URL || '').replace(/\/$/, '') || '';
  const explicitHistory = (window.HISTORY_ENDPOINT || '').trim();

  const FALLBACK_ENDPOINTS = (explicitHistory ? [ explicitHistory ] : [
    '/api/history','/api/reports/history-full','/api/reports/history','/api/reports/history_full',
    '/api/user/history','/api/me/history','/api/users/me/history','/api/loans','/api/loans/history'
  ]).map(p => (p.startsWith('http') ? p : (BACKEND ? BACKEND + p : p)));

  const GENRES_BY_TITLE = {
    "Literatura Brasileira": "Literatura",
    "Programação em Python": "Tecnologia",
    "Engenharia de Software": "Tecnologia",
    "Sistemas Distribuídos": "Tecnologia",
    "Finanças Pessoais": "Finanças",
    "Estatística Aplicada": "Matemática",
    "Sustentabilidade e Tecnologia": "Tecnologia"
  };

  let state = {
    page: 1,
    perPage: 7,
    allItemsRaw: [],
    allItems: [],
    currentUser: null
  };

  function getToken(){ return localStorage.getItem('BIB_TOKEN'); }
  function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;'); }
  function formatDate(iso){ if(!iso) return '-'; try{ const d=new Date(iso); return isNaN(d)?iso:d.toLocaleDateString('pt-BR'); }catch{return iso;} }
  function isOverdue(item){ try{ const st=(item.status||'').toString().toLowerCase(); if(st.includes('atras')) return true; const due = item.due_at||item.due_date||item.due||item.dueAt; const returned = item.returned_at||item.returned||item.actual_returned_at||item.returnedAt; if(due && !returned){ const d=new Date(due); if(!isNaN(d)) return d < new Date(); } }catch(e){} return false; }

  async function tryFetch(url){
    try{
      const token = getToken();
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(url, { headers });
      const text = await res.text().catch(()=>null);
      let json = null;
      try{ json = text ? JSON.parse(text) : null; }catch(e){ json = null; }
      return { ok: res.ok, status: res.status, json, text };
    }catch(e){ return { ok:false, status:0, error:e, text:null, json:null }; }
  }

  async function fetchCurrentUser(){
    const token = getToken(); if(!token) return null;
    const tryUrl = async (url) => {
      try { const r = await fetch(url, { headers:{ 'Authorization': `Bearer ${token}` } }); if(!r.ok) return { ok:false, status:r.status, text: await r.text().catch(()=>null) }; const json = await r.json().catch(()=>null); return { ok:true, status:r.status, json }; } catch(e){ return { ok:false, status:0, error:e }; }
    };
    const base = (BACKEND || '').replace(/\/$/, '');
    const firstUrl = (base || '') + '/api/auth/me';
    let res = await tryUrl(firstUrl);
    if(!res.ok && res.status===404 && !BACKEND){
      const alt = 'http://127.0.0.1:8080/api/auth/me';
      res = await tryUrl(alt);
      if(res.ok) try{ window.BACKEND_URL = 'http://127.0.0.1:8080'; }catch(e){}
    }
    if(res.ok) return res.json;
    try{ const raw = localStorage.getItem('BIB_USER'); if(raw){ const parsed = JSON.parse(raw); if(parsed && (parsed.id||parsed.email)) return parsed; } }catch(e){}
    return null;
  }

  // --- CORREÇÃO PRINCIPAL AQUI ---
  // Agora lê BIB_HISTORY (compatível com app.js) além dos antigos BIB_LOANS
  async function fetchHistory(){
    for(const ep of FALLBACK_ENDPOINTS){
      const r = await tryFetch(ep);
      if(r.ok && Array.isArray(r.json)) return r.json;
      if(r.ok && r.json && typeof r.json === 'object'){
        if(Array.isArray(r.json.data)) return r.json.data;
        if(Array.isArray(r.json.items)) return r.json.items;
        for(const k of Object.keys(r.json)){ if(Array.isArray(r.json[k])) return r.json[k]; }
      }
    }
    // fallback localStorage
    try{
      const arr = [];
      
      // 1. Tenta ler o formato novo unificado (BIB_HISTORY) do app.js
      const unified = JSON.parse(localStorage.getItem('BIB_HISTORY') || '[]');
      unified.forEach(item => {
          arr.push({
              book_title: item.title || item.book_title || 'Livro sem título',
              user_id: item.userId || item.user_id,
              // Mapeia os campos para o formato que a tabela espera
              type: item.tipo || 'Empréstimo', 
              borrowed_at: (item.tipo === 'Empréstimo') ? item.data : null,
              date: item.data, // fallback
              status: item.status || 'Ativo'
          });
      });

      // 2. Se não tiver histórico unificado, tenta ler os antigos (legado)
      if(arr.length === 0) {
          const loans = JSON.parse(localStorage.getItem('BIB_LOANS') || '[]');
          const resv  = JSON.parse(localStorage.getItem('BIB_RESERVATIONS') || '[]');
          loans.forEach(l => arr.push({ book_title: l.bookTitle||l.book_title||('Livro '+(l.bookId||'')), user_id: l.user||l.user_id||'', borrowed_at: l.loanedAt||l.loaned_at||null, due_at: l.dueAt||l.due_at||l.due||null, returned_at: l.returnedAt||l.returned_at||null, status: l.returnedAt ? 'Concluido' : 'Emprestado' }));
          resv.forEach(r => arr.push({ book_title: r.bookTitle||r.book_title||('Livro '+(r.bookId||'')), user_id: r.user||r.user_id||'', type:'Reserva', date: r.time||r.createdAt||null, status: r.cancelled ? 'Cancelado' : 'Reservado' }));
      }

      if(arr.length) return arr;
    }catch(e){ console.warn("Erro ao ler localStorage", e); }
    
    // Se não achou nada, retorna array vazio em vez de erro para não quebrar a UI
    return [];
  }

  function normalizeItem(i){
    let genre = i.book_genre || i.genre || i.category || (i.book && (i.book.genre||i.book.category||i.book.category_name));
    if(!genre && (i.book_title||i.title||i.name)){
      const rawTitle = (i.book_title||i.title||i.name).toString().replace(/\s*—.*$/,'').trim();
      genre = GENRES_BY_TITLE[rawTitle] || null;
    }
    if(!genre) genre = "Gênero indefinido";
    const obj = {
      raw: i,
      title: i.book_title||i.title||i.name||'Sem título',
      user_id: String(i.user_id ?? i.userId ?? i.user ?? i.owner_id ?? ''),
      type: i.type || genre, // Prioriza o tipo gravado (Reserva/Empréstimo)
      status: i.status || i.state || (i.returned_at ? 'Concluido' : (isOverdue(i) ? 'Atrasado' : 'Emprestado')),
      date_loan: i.borrowed_at||i.loaned_at||i.loanedAt||i.date||null,
      date_due: i.due_at||i.due_date||i.due||i.dueAt||null,
      read_at: i.read_at||i.completed_at||i.finished_at||i.readAt||null,
      returned_at: i.returned_at||i.actual_returned_at||i.returnedAt||null
    };
    obj.isRead = !!obj.read_at;
    obj.isOverdue = isOverdue(i);
    // Ajuste lógico: É empréstimo se tiver data OU se o tipo for explicitamente Empréstimo
    obj.isLoan = (obj.type && obj.type.toString().toLowerCase() === 'empréstimo') || ((obj.type && obj.type.toString().toLowerCase() !== 'reserva') && ((i.borrowed_at||i.loaned_at||i.loanedAt) !== undefined));
    obj.isReservation = (obj.type||'').toString().toLowerCase().includes('reserva') || (i.type||i.kind||'').toString().toLowerCase().includes('reserv') || !!i.reservation;
    return obj;
  }

  function applyFilters(rawList, user, filterVal){
    if(!user || !user.id && !user.email) return []; // Aceita email tb como ID para demo
    const normalized = (rawList||[]).map(normalizeItem);
    
    const userIdStr = String(user.id || '');
    const userEmailStr = String(user.email || '');
    
    // Filtro mais permissivo para Demo (aceita match por ID ou Email)
    let list = normalized.filter(it => {
      const raw = it.raw || {};
      const rawUserId = String(raw.user_id ?? raw.userId ?? raw.user ?? '');
      return rawUserId === userIdStr || rawUserId === userEmailStr || rawUserId === 'user_demo';
    });

    if(!filterVal || filterVal==='all') list = list.filter(it => it.isRead || it.isLoan || it.isReservation || it.isOverdue);
    else if(filterVal==='loans') list = list.filter(it => it.isLoan);
    else if(filterVal==='reservations') list = list.filter(it => it.isReservation);
    else if(filterVal==='read') list = list.filter(it => it.isRead);
    else if(filterVal==='overdue') list = list.filter(it => it.isOverdue);
    
    list.sort((a,b)=> { const ta = new Date(a.date_loan||a.date_due||0).getTime(); const tb = new Date(b.date_loan||b.date_due||0).getTime(); return tb - ta; });
    return list;
  }

  function renderPage(){
    const tbody = document.querySelector('#historyTable tbody');
    const pageIndicator = document.getElementById('pageIndicator');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pagesContainer = document.querySelector('#pagesContainer');

    if(!tbody) return;
    tbody.innerHTML = '';

    if(state.allItems.length === 0){
      tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#94a3b8;">Nenhum histórico encontrado.</td></tr>`;
      if(pageIndicator) pageIndicator.innerText = "Página 1 de 1";
      if(pagesContainer) pagesContainer.innerHTML = '';
      return;
    }

    const totalPages = Math.max(1, Math.ceil(state.allItems.length / state.perPage));
    if(state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.perPage;
    const slice = state.allItems.slice(start, start + state.perPage);

    slice.forEach(it => {
      let badgeClass = 'done';
      if(it.isOverdue) badgeClass = 'overdue';
      else if(it.status === 'Cancelado') badgeClass = 'overdue'; // Usando vermelho para cancelado
      else if(it.isReservation) badgeClass = 'reservation'; // Classe nova se quiser estilizar diferente (amarelo)
      else if(it.isLoan && !it.isRead) badgeClass = 'onloan';
      else if(it.isRead) badgeClass = 'done';
      
      // Fallback visual para status
      const visualStatus = it.status === 'Ativo' && it.isLoan ? 'Emprestado' : (it.status === 'Ativo' && it.isReservation ? 'Reservado' : it.status);

      // Usar badge amarela se for reserva e não tiver classe específica
      if(visualStatus === 'Reservado' || visualStatus === 'Reserva') badgeClass = 'pending'; // ou 'warning' dependendo do seu CSS

      tbody.insertAdjacentHTML('beforeend', `
        <tr>
          <td style="font-weight:500; color:#fff;" title="${escapeHtml(it.title)}">${escapeHtml(it.title)}</td>
          <td style="color:#94a3b8;">Você</td>
          <td style="color:#94a3b8;">${escapeHtml(it.type)}</td>
          <td>${formatDate(it.date_loan || it.raw.date)}</td>
          <td>${formatDate(it.date_due || it.read_at)}</td>
          <td><span class="badge ${badgeClass}">${escapeHtml(visualStatus)}</span></td>
        </tr>
      `);
    });

    if(pageIndicator) pageIndicator.innerText = `Página ${state.page} de ${totalPages}`;

    if(prevBtn) prevBtn.disabled = state.page <= 1;
    if(nextBtn) nextBtn.disabled = state.page >= totalPages;

    if(pagesContainer){
      pagesContainer.innerHTML = '';
      const maxShow = 15;
      const half = Math.floor(maxShow/2);
      let startPage = Math.max(1, state.page - half);
      let endPage = Math.min(totalPages, startPage + maxShow - 1);
      startPage = Math.max(1, endPage - maxShow + 1);

      for(let p = startPage; p <= endPage; p++){
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = String(p);
        if(p === state.page) btn.classList.add('active');
        btn.onclick = (() => () => { state.page = p; renderPage(); })();
        pagesContainer.appendChild(btn);
      }
    }
  }

  function reajustarAlturaEPagina() {
    try{
      const card = document.querySelector('.history-panel.card') || document.querySelector('.card') || document.querySelector('.historico-page .card');
      const pagination = document.querySelector('.pagination-bar');
      const tableWrapper = document.querySelector('.table-wrapper');
      const table = document.querySelector('.history-table');

      if(!card || !pagination || !tableWrapper || !table) return;

      const cardRect = card.getBoundingClientRect();
      const cardTop = Math.max(0, cardRect.top);
      const vh = window.innerHeight;
      const paginationHeight = pagination.getBoundingClientRect().height || 0;
      const thead = table.querySelector('thead');
      const theadHeight = thead ? thead.getBoundingClientRect().height : 0;
      const availableForRows = Math.max(0, vh - cardTop - paginationHeight - theadHeight - 40); // -40 padding extra de segurança

      let sampleRow = table.querySelector('tbody tr');
      let tempRow = null;
      if(!sampleRow){
        tempRow = document.createElement('tr');
        tempRow.style.visibility = 'hidden';
        tempRow.innerHTML = '<td>Teste</td><td>Teste</td><td>Teste</td><td>Teste</td><td>Teste</td><td>Teste</td>';
        table.querySelector('tbody').appendChild(tempRow);
        sampleRow = tempRow;
      }
      const rowHeight = sampleRow.getBoundingClientRect().height || 56;
      if(tempRow && tempRow.parentNode) tempRow.parentNode.removeChild(tempRow);

      const perPageCalc = Math.max(1, Math.floor(availableForRows / rowHeight));
      const rowsTotalHeight = perPageCalc * rowHeight;
      const wrapperHeight = theadHeight + rowsTotalHeight + 2; // +2 borda

      tableWrapper.style.maxHeight = wrapperHeight + 'px';
      tableWrapper.style.height = wrapperHeight + 'px';
      tableWrapper.style.overflow = 'hidden';

      if(state.perPage !== perPageCalc){
        state.perPage = perPageCalc;
        state.page = 1;
        renderPage();
      }
    }catch(e){
      console.warn('reajustarAlturaEPagina falhou', e);
    }
  }

  async function init(){
    state.page = 1;
    const btnRefresh = document.getElementById('btnRefresh');
    const filterType = document.getElementById('filterType');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const tbody = document.querySelector('#historyTable tbody');

    if(!tbody){ console.warn('Tabela não encontrada no DOM'); return; }

    const token = getToken();
    // Modo demo: permite carregar mesmo sem token se tiver algo no localStorage
    if(!token && !localStorage.getItem('BIB_HISTORY')){
      tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center;">Sessão não encontrada. <a href="#perfil">Faça login</a> para ver seu histórico.</td></tr>`;
      return;
    }

    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:20px;">Carregando...</td></tr>`;

    state.currentUser = await fetchCurrentUser() || { email: 'user_demo', id: 'user_demo' }; // Mock user se falhar

    try{
      const raw = await fetchHistory();
      state.allItemsRaw = raw || [];
      const filterVal = filterType ? filterType.value : 'all';
      state.allItems = applyFilters(state.allItemsRaw, state.currentUser, filterVal);
      renderPage();
      setTimeout(reajustarAlturaEPagina, 40);
    }catch(e){
      console.error('Erro fetchHistory:', e);
      tbody.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center; color:#f87171;">Erro ao carregar histórico.</td></tr>`;
    }

    if(btnRefresh){
      btnRefresh.onclick = async () => { try { await init(); } catch(e){} };
    }

    if(filterType){
      filterType.onchange = () => {
        state.allItems = applyFilters(state.allItemsRaw, state.currentUser, filterType.value);
        state.page = 1;
        renderPage();
        setTimeout(reajustarAlturaEPagina, 40);
      };
    }

    if(prevBtn){
      prevBtn.onclick = () => { if(state.page > 1){ state.page--; renderPage(); } };
    }

    if(nextBtn){
      nextBtn.onclick = () => {
        const max = Math.ceil(state.allItems.length / state.perPage);
        if(state.page < max){ state.page++; renderPage(); }
      };
    }
  }

  window.initHistorico = init;

  window.addEventListener('resize', function(){ setTimeout(reajustarAlturaEPagina, 80); });
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) setTimeout(reajustarAlturaEPagina,100); });

  document.addEventListener('DOMContentLoaded', () => {
    if(typeof window.initHistorico === 'function') window.initHistorico();
    setTimeout(reajustarAlturaEPagina, 150);
  });

  setTimeout(reajustarAlturaEPagina, 200);

})();
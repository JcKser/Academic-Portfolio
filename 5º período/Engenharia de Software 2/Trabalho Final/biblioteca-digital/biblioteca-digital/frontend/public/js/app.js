// app.js — Versão completa, corrigida e otimizada (COM NOTIFICAÇÕES + SEARCH CENTRALIZADA)
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     CONFIG & CONSTANTS
  ========================= */
  const API_BASE = 'https://www.googleapis.com/books/v1/volumes';
  const GOOGLE_BOOKS_API_KEY = ''; // opcional
  const CATEGORIES = ['All','Ficção','Ciência','Programação','Negócios','Finanças','Educação','Terror','Fantasia','Sci-Fi'];

  const COLUMNS = 8;
  const ROWS_PER_PAGE = 3;
  const ITEMS_PER_PAGE = COLUMNS * ROWS_PER_PAGE; // 24
  const PREVIEW_COUNT = COLUMNS; // 8
  const PER_PAGE_API = 24; // google books max 40

  /* =========================
     STATE
  ========================= */
  let recommendedBooks = [];
  let recommendedFiltered = [];
  let recCurrentPage = 1;
  let recIsExpanded = false;
  let recCurrentFetchPage = 0;
  let recTotalPagesFromApi = 1;
  let recTotalItems = 0;
  let isFetchingRecommended = false;

  let categoryBooks = [];
  let catFiltered = [];
  let catCurrentPage = 1;
  let catIsExpanded = false;
  let catCurrentFetchPage = 0;
  let catTotalPagesFromApi = 1;
  let catTotalItems = 0;
  let activeCategory = 'All';
  let filterOpen = false;

  /* =========================
     SELECTORS
  ========================= */
  const carousel = document.getElementById('carousel');
  const seeAllBtn = document.getElementById('seeAllBtn');

  const categoryList = document.getElementById('categoryList');
  const categoryCarousel = document.getElementById('categoryCarousel');
  const categoryPaginationContainer = document.getElementById('categoryPaginationContainer');
  const categorySeeAllBtn = document.getElementById('categorySeeAllBtn');

  const sidepanel = document.getElementById('sidepanel');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closePanel');
  const btnReserve = document.getElementById('btnReserve');
  const btnLoan = document.getElementById('btnLoan');
  const searchInput = document.getElementById('searchInput');
  const mainContent = document.getElementById('mainContent');

  const paginationContainer = document.getElementById('paginationContainer');

  const avatarBtn = document.getElementById('avatarBtn');
  const profileArea = document.getElementById('profileArea');
  const userDropdown = document.getElementById('userDropdown');
  const notifBtn = document.getElementById('notifBtn');
  const notifBadge = document.getElementById('notifBadge');
  const sideNav = document.getElementById('sideNav');
  const sidebarFooter = document.getElementById('sidebarFooter');

  const advancedFilterBtn = document.getElementById('advancedFilterBtn');
  const advancedFilterModal = document.getElementById('closeAdvancedFilter') ? document.getElementById('advancedFilterModal') : document.getElementById('advancedFilterModal');
  const closeAdvancedFilter = document.getElementById('closeAdvancedFilter');
  const applyFiltersBtn = document.getElementById('applyFiltersBtn');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');

  /* =========================
     SESSION (mock)
  ========================= */
  let currentUser = null;
  let isLogged = false;
  (function loadSession(){
    try {
      currentUser = JSON.parse(localStorage.getItem('BIB_USER'));
      isLogged = !!localStorage.getItem('BIB_TOKEN');
    } catch { currentUser = null; isLogged = false; }
  })();

  /* =========================
     HELPERS
  ========================= */
  function generateRandomPastelColor() {
    const colors = ["#f7e7d7","#d7f7e9","#d7e7ff","#fff2d7","#f0d7ff","#e2f0cb","#ffdfd3"];
    return colors[Math.floor(Math.random()*colors.length)];
  }
  function firstName(fullName){ if(!fullName) return ''; return fullName.trim().split(/\s+/)[0]; }
  function escapeHtml(str){ if(!str && str !== 0) return ''; return String(str).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
  function clearChildren(el){ while(el && el.firstChild) el.removeChild(el.firstChild); }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function shortDescription(text, maxChars = 220) {
    if(!text) return '';
    const trimmed = text.replace(/\s+/g,' ').trim();
    if(trimmed.length <= maxChars) return trimmed;
    const end = trimmed.lastIndexOf('.', maxChars);
    if(end > Math.floor(maxChars * 0.4)) return trimmed.slice(0, end+1) + ' …';
    return trimmed.slice(0, maxChars).replace(/\s+\S*$/,'') + ' …';
  }

  function proxify(src, w = 420, h = 630, q = 85) {
    if(!src) return null;
    try {
      const normalized = String(src).replace(/^https?:\/\//i,'');
      const u = encodeURIComponent(normalized);
      return `https://images.weserv.nl/?url=${u}&w=${w}&h=${h}&fit=cover&q=${q}&output=webp`;
    } catch(e){
      return src;
    }
  }

  /* debounce util */
  function debounce(fn, wait=300){
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(()=> fn(...args), wait); };
  }

  /* =========================
     GOOGLE BOOKS FETCH
  ========================= */
  async function fetchBooksFromApi(page = 1, per_page = PER_PAGE_API, q = 'subject:fiction') {
    const safeQ = encodeURIComponent((q || '').trim() || 'subject:fiction');
    const pageNum = Math.max(1, page);
    const maxPerPage = Math.min(40, Math.max(1, per_page));
    const startIndex = (pageNum - 1) * maxPerPage;

    let url = `${API_BASE}?q=${safeQ}&startIndex=${startIndex}&maxResults=${maxPerPage}`;
    if(GOOGLE_BOOKS_API_KEY) url += `&key=${GOOGLE_BOOKS_API_KEY}`;

    const res = await fetch(url);
    if(!res.ok) throw new Error(`Google Books API error ${res.status}`);
    const data = await res.json();

    const itemsRaw = data.items || [];
    const totalItemsLocal = data.totalItems || 0;
    const total_pages = Math.max(1, Math.ceil(totalItemsLocal / maxPerPage));

    return { items: itemsRaw, page: pageNum, total_pages, totalItems: totalItemsLocal, raw: data };
  }

  function mapApiItemToBook(i){
    const info = i.volumeInfo || {};

    const imgs = info.imageLinks || {};
    const candidate =
      imgs.extraLarge ||
      imgs.large ||
      imgs.medium ||
      imgs.thumbnail ||
      imgs.smallThumbnail ||
      null;

    const candidateUrl = candidate ? String(candidate).replace(/^http:\/\//i,'https://') : null;
    const proxyUrl = candidateUrl ? proxify(candidateUrl, 420, 630, 85) : null;

    return {
      id: i.id || (info.industryIdentifiers?.[0]?.identifier) || Math.random().toString(36).slice(2,9),
      title: info.title || 'Sem Título',
      author: (info.authors && info.authors[0]) || 'Autor Desconhecido',
      category: (info.categories && info.categories[0]) || info.subtitle || 'Geral',
      pages: info.pageCount || 0,
      rating: info.averageRating || 0,
      available: 5,
      desc: info.description || '',
      color: generateRandomPastelColor(),
      thumbnail: candidateUrl,
      thumbnailProxy: proxyUrl,
      imageLinks: imgs
    };
  }

  function categoryToQuery(cat) {
    if(!cat || cat === 'All') return (searchInput?.value || '').trim() || 'subject:fiction';
    const map = {
      'Ficção': 'subject:fiction',
      'Ciência': 'subject:science',
      'Programação': 'programming',
      'Negócios': 'subject:business',
      'Finanças': 'subject:finance',
      'Educação': 'subject:education',
      'Terror': 'subject:horror',
      'Fantasia': 'subject:fantasy',
      'Sci-Fi': 'subject:science fiction'
    };
    return map[cat] || `subject:${cat.toLowerCase()}`;
  }

  /* =========================
     HISTORY PERSISTENCE (adicionado)
     - salva no localStorage em BIB_HISTORY no formato usado por historico.js
  ========================= */
  function addToHistory(book, tipo = 'Empréstimo'){
    try{
      const histKey = 'BIB_HISTORY';
      const existing = JSON.parse(localStorage.getItem(histKey) || '[]');
      const userId = (currentUser && (currentUser.id || currentUser.email)) || 'user_demo';
      const entry = {
        id: 'h_' + Math.random().toString(36).slice(2,9),
        title: book.title || book.book_title || 'Livro sem título',
        book_title: book.title || book.book_title || 'Livro sem título',
        userId: userId,
        user_id: userId,
        tipo: tipo,
        type: tipo,
        data: new Date().toISOString(),
        borrowed_at: tipo === 'Empréstimo' ? new Date().toISOString() : null,
        date: new Date().toISOString(),
        status: tipo === 'Empréstimo' ? 'Ativo' : 'Reservado'
      };
      existing.push(entry);
      try{ localStorage.setItem(histKey, JSON.stringify(existing)); }catch(e){ console.warn('Não foi possível salvar histórico', e); }

      // dispara notificação se módulo disponível
      if(window.DigiTaleNotifications && typeof window.DigiTaleNotifications.push === 'function'){
        window.DigiTaleNotifications.push({
          id: 'notif_' + Math.random().toString(36).slice(2,8),
          title: tipo === 'Empréstimo' ? 'Empréstimo iniciado' : 'Reserva registrada',
          body: `${entry.book_title}`,
          url: '#/history',
          time: new Date().toISOString()
        });
      }

      // tenta atualizar a página de histórico caso esteja aberta
      if(typeof window.initHistorico === 'function'){
        try{ window.initHistorico(); }catch(e){/* ignore */}
      }

      return entry;
    }catch(e){ console.error('addToHistory failed', e); return null; }
  }

  /* =========================
     FETCH: Recommended & Category
  ========================= */

  async function fetchRecommended(page = 1, append = false){
    if(!carousel) return;
    if(isFetchingRecommended) return;
    isFetchingRecommended = true;
    try{
      if(!append) carousel.innerHTML = '<div style="padding:20px;">Carregando recomendações...</div>';
      const q = (searchInput?.value || '').trim() || 'subject:fiction';
      const data = await fetchBooksFromApi(page, PER_PAGE_API, q);
      const items = (data.items || []).map(mapApiItemToBook);
      recCurrentFetchPage = data.page || page || 1;
      recTotalPagesFromApi = data.total_pages || 1;
      recTotalItems = data.totalItems || 0;
      if(append) recommendedBooks = recommendedBooks.concat(items);
      else recommendedBooks = items.slice();
      recommendedFiltered = recommendedBooks.slice();
      recCurrentPage = 1;
      updateRecommendedView();

      if (activeCategory === 'All') {
        categoryBooks = recommendedBooks.slice();
        catFiltered = categoryBooks.slice();
        catCurrentPage = 1;
        updateCategoryView();
      }

    } catch(err){
      console.error('fetchRecommended error', err);
      carousel.innerHTML = `<div style="padding:20px;color:#d9534f;">Erro: ${escapeHtml(err.message)}</div>`;
    } finally {
      isFetchingRecommended = false;
    }
  }

  async function fetchBooksByCategory(category, page = 1, append = false){
    if(!categoryCarousel) return;
    try{
      if(!append) categoryCarousel.innerHTML = `<div style="padding:20px;">Buscando categoria "${escapeHtml(category)}" ...</div>`;
      const q = categoryToQuery(category);
      const data = await fetchBooksFromApi(page, PER_PAGE_API, q);
      const items = (data.items || []).map(mapApiItemToBook);
      catCurrentFetchPage = data.page || page || 1;
      catTotalPagesFromApi = data.total_pages || 1;
      catTotalItems = data.totalItems || 0;
      if(append) categoryBooks = categoryBooks.concat(items); else categoryBooks = items.slice();
      catFiltered = categoryBooks.slice();
      catCurrentPage = 1;
      updateCategoryView();
    } catch(err){
      console.error('fetchBooksByCategory error', err);
      categoryCarousel.innerHTML = `<div style="padding:20px;color:#d9534f;">Erro: ${escapeHtml(err.message)}</div>`;
      categoryBooks = []; catFiltered = [];
    }
  }

  /* =========================
     PAGINATION HELPERS
  ========================= */
  async function ensureRecItemsForPage(page){
    try{
      const needed = page * ITEMS_PER_PAGE;
      while(recommendedFiltered.length < needed && recCurrentFetchPage < recTotalPagesFromApi){
        await fetchRecommended(recCurrentFetchPage + 1, true);
      }
    } catch(e){ console.warn(e); }
  }

  async function ensureCatItemsForPage(page){
    try{
      const needed = page * ITEMS_PER_PAGE;
      while(catFiltered.length < needed && catCurrentFetchPage < catTotalPagesFromApi){
        await fetchBooksByCategory(activeCategory, catCurrentFetchPage + 1, true);
      }
    } catch(e){ console.warn(e); }
  }

  async function navigateRecToPage(page){
    await ensureRecItemsForPage(page);
    const totalAfter = Math.max(1, Math.ceil(recommendedFiltered.length / ITEMS_PER_PAGE));
    if(page > totalAfter) page = totalAfter;
    recCurrentPage = page;
    updateRecommendedView();
    document.getElementById('rec-title')?.scrollIntoView({behavior:'smooth'});
  }

  async function navigateCatToPage(page){
    await ensureCatItemsForPage(page);
    const totalAfter = Math.max(1, Math.ceil(catFiltered.length / ITEMS_PER_PAGE));
    if(page > totalAfter) page = totalAfter;
    catCurrentPage = page;
    updateCategoryView();
    document.getElementById('cat-title')?.scrollIntoView({behavior:'smooth'});
  }

  function renderPagination(container, currentPageLocal, totalItems, onPrev, onClick, onNext){
    if(!container) return;
    clearChildren(container);
    const totalPagesLocal = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
    const maxBtns = 5;
    let start = Math.max(1, currentPageLocal - 2);
    let end = start + maxBtns - 1;
    if(end > totalPagesLocal){ end = totalPagesLocal; start = Math.max(1, end - maxBtns + 1); }

    const prevBtn = document.createElement('button'); prevBtn.className='page-btn arrow-btn'; prevBtn.textContent='‹'; prevBtn.disabled = currentPageLocal===1;
    prevBtn.addEventListener('click', onPrev);
    container.appendChild(prevBtn);

    for(let i=start;i<=end;i++){
      const b = document.createElement('button'); b.className = 'page-btn' + (i===currentPageLocal? ' active':''); b.textContent = i;
      b.addEventListener('click', () => onClick(i));
      container.appendChild(b);
    }

    const nextBtn = document.createElement('button'); nextBtn.className='page-btn arrow-btn'; nextBtn.textContent='›';
    const atEndAndBackendDone = (currentPageLocal >= totalPagesLocal && ((container===paginationContainer ? recCurrentFetchPage : catCurrentFetchPage) >= (container===paginationContainer ? recTotalPagesFromApi : catTotalPagesFromApi)) && totalItems <= totalPagesLocal * ITEMS_PER_PAGE);
    nextBtn.disabled = atEndAndBackendDone;
    nextBtn.addEventListener('click', onNext);
    container.appendChild(nextBtn);
  }

  /* =========================
     CARD / RENDER
  ========================= */
  function createCardElement(book){
    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('role','listitem');

    const coverWrapper = document.createElement('div');
    coverWrapper.className = 'book-cover';
    coverWrapper.style.minHeight = '160px';
    coverWrapper.style.borderRadius = '10px';
    coverWrapper.style.overflow = 'hidden';
    coverWrapper.style.display = 'flex';
    coverWrapper.style.alignItems = 'center';
    coverWrapper.style.justifyContent = 'center';
    coverWrapper.style.background = book.color || generateRandomPastelColor();

    if(book.thumbnail || book.thumbnailProxy){
      const img = document.createElement('img');

      const srcBest = book.thumbnailProxy || book.thumbnail;

      const srcsetParts = [];
      if(book.thumbnailProxy) srcsetParts.push(`${book.thumbnailProxy} 420w`);
      if(book.imageLinks){
        if(book.imageLinks.small) srcsetParts.push(`${book.imageLinks.small.replace(/^http:\/\//i,'https://')} 240w`);
        if(book.imageLinks.medium) srcsetParts.push(`${book.imageLinks.medium.replace(/^http:\/\//i,'https://')} 360w`);
        if(book.imageLinks.large) srcsetParts.push(`${book.imageLinks.large.replace(/^http:\/\//i,'https://')} 480w`);
        if(book.imageLinks.extraLarge) srcsetParts.push(`${book.imageLinks.extraLarge.replace(/^http:\/\//i,'https://')} 800w`);
      }
      if(book.thumbnail) srcsetParts.push(`${book.thumbnail} 200w`);
      if(srcsetParts.length) img.srcset = srcsetParts.join(', ');

      img.sizes = `(max-width: 900px) 160px, (max-width: 1200px) 220px, 240px`;
      img.src = srcBest || (book.thumbnail ? book.thumbnail : '');
      img.alt = book.title || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      img.style.display = 'block';

      img.addEventListener('error', function(){
        if(img.parentNode) img.parentNode.removeChild(img);
        coverWrapper.style.background = book.color || generateRandomPastelColor();
        coverWrapper.textContent = (book.title||'').slice(0,3).toUpperCase();
        coverWrapper.style.color = '#333'; coverWrapper.style.fontWeight = '700';
      });

      coverWrapper.appendChild(img);
    } else {
      coverWrapper.textContent = (book.title||'').slice(0,3).toUpperCase();
      coverWrapper.style.color = '#333'; coverWrapper.style.fontWeight = '700';
    }

    const title = document.createElement('div'); title.className='book-title'; title.textContent = book.title || 'Sem Título';
    const author = document.createElement('div'); author.className='book-author'; author.textContent = book.author || 'Autor Desconhecido';

    card.appendChild(coverWrapper); card.appendChild(title); card.appendChild(author);

    // hover animation (subtle)
    card.addEventListener('mouseenter', ()=> card.style.transform = 'translateY(-6px) scale(1.02)');
    card.addEventListener('mouseleave', ()=> card.style.transform = '');

    card.addEventListener('click', () => openPanel(book));
    return card;
  }

  /* =========================
     VIEWS - Recommended / Category
  ========================= */
  function updateRecommendedView(){
    if(!carousel) return;
    clearChildren(carousel);
    if(paginationContainer) clearChildren(paginationContainer);

    if(!recommendedFiltered || recommendedFiltered.length===0){
      carousel.innerHTML = '<div style="padding:20px;">Nenhum livro encontrado.</div>';
      if(paginationContainer) paginationContainer.style.display = 'none';
      carousel.classList.remove('expanded','spread'); carousel.style.overflowX=''; carousel.style.width=''; carousel.style.margin='';
      return;
    }

    carousel.style.width='100%'; carousel.style.maxWidth='100%'; carousel.style.margin='0 auto'; carousel.style.boxSizing='border-box';

    if(!recIsExpanded){
      carousel.classList.remove('expanded','spread');
      carousel.style.removeProperty('grid-template-columns');

      const previewItems = recommendedFiltered.slice(0, PREVIEW_COUNT);
      previewItems.forEach(b => carousel.appendChild(createCardElement(b)));

      if(paginationContainer) paginationContainer.style.display = 'none';
      if(seeAllBtn){ seeAllBtn.textContent='Ver todos'; seeAllBtn.setAttribute('aria-expanded','false'); }

      const visibleCount = carousel.querySelectorAll('.card-item').length;
      let gap = 30;
      try{ const s = getComputedStyle(carousel); const g = s.gap || s.columnGap || s.gridColumnGap || ''; if(g){ const p=parseFloat(g); if(!Number.isNaN(p)) gap=p; }}catch(_){ }

      if(visibleCount>0 && visibleCount<=COLUMNS){
        carousel.classList.add('spread');
        const containerWidth = Math.max(0, carousel.clientWidth || carousel.getBoundingClientRect().width || carousel.offsetWidth || 0);
        const totalGapsPx = Math.max(0, visibleCount-1) * gap;
        const basisPx = Math.max(120, Math.floor((containerWidth - totalGapsPx) / visibleCount));
        carousel.style.display='flex'; carousel.style.justifyContent='space-between'; carousel.style.alignItems='flex-start'; carousel.style.overflowX='hidden';
        carousel.querySelectorAll('.card-item').forEach(c => { c.style.flex=`0 0 ${basisPx}px`; c.style.maxWidth=`${basisPx}px`; c.style.boxSizing='border-box'; });
      } else {
        carousel.classList.remove('spread'); carousel.style.display='flex'; carousel.style.justifyContent=''; carousel.style.alignItems='flex-start'; carousel.style.overflowX='auto';
        carousel.querySelectorAll('.card-item').forEach(c => { c.style.flex=''; c.style.maxWidth=''; c.style.boxSizing=''; });
      }
      return;
    }

    // expanded
    carousel.classList.add('expanded'); carousel.classList.remove('spread');
    carousel.style.display=''; carousel.style.overflowX='visible';
    const start = (recCurrentPage - 1) * ITEMS_PER_PAGE;
    const itemsToShow = recommendedFiltered.slice(start, start + ITEMS_PER_PAGE);
    itemsToShow.forEach(b => carousel.appendChild(createCardElement(b)));
    if(paginationContainer) paginationContainer.style.display = 'flex';
    if(seeAllBtn){ seeAllBtn.textContent='Mostrar menos'; seeAllBtn.setAttribute('aria-expanded','true'); }

    renderPagination(paginationContainer, recCurrentPage, recommendedFiltered.length,
      async () => await navigateRecToPage(recCurrentPage-1),
      async (i) => await navigateRecToPage(i),
      async () => await navigateRecToPage(recCurrentPage+1)
    );

    try{
      if(itemsToShow.length < ITEMS_PER_PAGE && recCurrentFetchPage < recTotalPagesFromApi){
        ensureRecItemsForPage(recCurrentPage).then(()=> {
          const newSlice = recommendedFiltered.slice(start, start + ITEMS_PER_PAGE);
          if(newSlice.length > itemsToShow.length) updateRecommendedView();
        }).catch(e=>console.warn(e));
      }
    } catch(e){ console.warn(e); }
  }

  function updateCategoryView(){
    if(!categoryCarousel) return;
    clearChildren(categoryCarousel);
    if(categoryPaginationContainer) clearChildren(categoryPaginationContainer);

    if(!catFiltered || catFiltered.length===0){
      categoryCarousel.innerHTML = '<div style="padding:20px;">Nenhum livro encontrado.</div>';
      if(categoryPaginationContainer) categoryPaginationContainer.style.display = 'none';
      categoryCarousel.classList.remove('expanded','spread'); categoryCarousel.style.overflowX=''; categoryCarousel.style.width=''; categoryCarousel.style.margin='';
      return;
    }

    categoryCarousel.style.width='100%'; categoryCarousel.style.maxWidth='100%'; categoryCarousel.style.margin='0 auto'; categoryCarousel.style.boxSizing='border-box';

    if(!catIsExpanded){
      categoryCarousel.classList.remove('expanded','spread');
      categoryCarousel.style.removeProperty('grid-template-columns');

      const previewItems = catFiltered.slice(0, PREVIEW_COUNT);
      previewItems.forEach(b => categoryCarousel.appendChild(createCardElement(b)));

      if(categoryPaginationContainer) categoryPaginationContainer.style.display = 'none';
      if(categorySeeAllBtn){ categorySeeAllBtn.textContent='Ler todos'; categorySeeAllBtn.setAttribute('aria-expanded','false'); }

      const visibleCount = categoryCarousel.querySelectorAll('.card-item').length;
      let gap = 30;
      try{ const s = getComputedStyle(categoryCarousel); const g = s.gap || s.columnGap || s.gridColumnGap || ''; if(g){ const p=parseFloat(g); if(!Number.isNaN(p)) gap=p; }}catch(_){ }

      if(visibleCount>0 && visibleCount<=COLUMNS){
        categoryCarousel.classList.add('spread');
        const containerWidth = Math.max(0, categoryCarousel.clientWidth || categoryCarousel.getBoundingClientRect().width || categoryCarousel.offsetWidth || 0);
        const totalGapsPx = Math.max(0, visibleCount-1) * gap;
        const basisPx = Math.max(120, Math.floor((containerWidth - totalGapsPx) / visibleCount));
        categoryCarousel.style.display='flex'; categoryCarousel.style.justifyContent='space-between'; categoryCarousel.style.alignItems='flex-start'; categoryCarousel.style.overflowX='hidden';
        categoryCarousel.querySelectorAll('.card-item').forEach(c => { c.style.flex=`0 0 ${basisPx}px`; c.style.maxWidth=`${basisPx}px`; c.style.boxSizing='border-box'; });
      } else {
        categoryCarousel.classList.remove('spread'); categoryCarousel.style.display='flex'; categoryCarousel.style.justifyContent=''; categoryCarousel.style.alignItems='flex-start'; categoryCarousel.style.overflowX='auto';
        categoryCarousel.querySelectorAll('.card-item').forEach(c => { c.style.flex=''; c.style.maxWidth=''; c.style.boxSizing=''; });
      }
      return;
    }

    // expanded category
    categoryCarousel.classList.add('expanded'); categoryCarousel.classList.remove('spread');
    categoryCarousel.style.display=''; categoryCarousel.style.overflowX='visible';
    const start = (catCurrentPage - 1) * ITEMS_PER_PAGE;
    const itemsToShow = catFiltered.slice(start, start + ITEMS_PER_PAGE);
    itemsToShow.forEach(b => categoryCarousel.appendChild(createCardElement(b)));
    if(categoryPaginationContainer) categoryPaginationContainer.style.display = 'flex';
    if(categorySeeAllBtn){ categorySeeAllBtn.textContent='Mostrar menos'; categorySeeAllBtn.setAttribute('aria-expanded','true'); }

    renderPagination(categoryPaginationContainer, catCurrentPage, catFiltered.length,
      async () => await navigateCatToPage(catCurrentPage-1),
      async (i) => await navigateCatToPage(i),
      async () => await navigateCatToPage(catCurrentPage+1)
    );

    try{
      if(itemsToShow.length < ITEMS_PER_PAGE && catCurrentFetchPage < catTotalPagesFromApi){
        ensureCatItemsForPage(catCurrentPage).then(()=> {
          const newSlice = catFiltered.slice(start, start + ITEMS_PER_PAGE);
          if(newSlice.length > itemsToShow.length) updateCategoryView();
        }).catch(e=>console.warn(e));
      }
    } catch(e){ console.warn(e); }
  }

  /* =========================
     RENDER CATEGORY PILLS
  ========================= */
  function renderCategoryPills(activeIndex = 0) {
    const container = document.getElementById('categoryList');
    if (!container) return;

    container.dataset.rendered = '1';
    container.innerHTML = '';

    CATEGORIES.forEach((cat, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat' + (i === activeIndex ? ' active' : '');
      btn.dataset.catIndex = i;
      btn.textContent = cat;

      btn.addEventListener('click', async () => {
        container.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = cat;
        catIsExpanded = false;
        catCurrentPage = 1;
        categoryBooks = [];
        catFiltered = [];

        if (cat === 'All') {
          categoryBooks = recommendedBooks.slice();
          catFiltered = categoryBooks.slice();
          catCurrentPage = 1;
          updateCategoryView();
        } else {
          await fetchBooksByCategory(cat, 1, false);
        }
      });

      container.appendChild(btn);
    });
  }

  /* =========================
     Advanced filter popover logic
  ========================= */
  function positionFilterPopover() {
    if(!advancedFilterModal || !advancedFilterBtn) return;
    advancedFilterModal.style.display = 'block';
    advancedFilterModal.style.position = 'fixed';
    advancedFilterModal.style.zIndex = 1300;
    const btnRect = advancedFilterBtn.getBoundingClientRect();
    const modalRect = advancedFilterModal.getBoundingClientRect();
    let left = Math.max(12, btnRect.right - modalRect.width);
    if(left + modalRect.width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - modalRect.width - 12);
    let top = btnRect.bottom + 8;
    if (top + modalRect.height > window.innerHeight - 12) {
      top = btnRect.top - modalRect.height - 8;
    }
    advancedFilterModal.style.left = `${left}px`;
    advancedFilterModal.style.top = `${top}px`;
  }

  function openFilterPopover() {
    if(!advancedFilterModal) return;
    if(sidepanel && sidepanel.classList.contains('visible')) closePanel();
    positionFilterPopover();
    advancedFilterModal.classList.add('visible');
    advancedFilterModal.setAttribute('aria-hidden', 'false');
    filterOpen = true;
    document.body.style.overflow = 'hidden';
    const firstInput = advancedFilterModal.querySelector('select, input, button');
    if(firstInput) firstInput.focus();
  }

  function closeFilterPopover() {
    if(!advancedFilterModal) return;
    advancedFilterModal.classList.remove('visible');
    advancedFilterModal.setAttribute('aria-hidden', 'true');
    advancedFilterModal.style.left = ''; advancedFilterModal.style.top = '';
    filterOpen = false;
    document.body.style.overflow = '';
    if(advancedFilterBtn) advancedFilterBtn.focus();
  }

  advancedFilterBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if(filterOpen) closeFilterPopover(); else openFilterPopover();
  });

  closeAdvancedFilter?.addEventListener('click', (e) => { e.preventDefault(); closeFilterPopover(); });

  document.addEventListener('click', (e) => {
    if(!filterOpen) return;
    if(advancedFilterModal && !advancedFilterModal.contains(e.target) && !advancedFilterBtn.contains(e.target)) {
      closeFilterPopover();
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') {
      if(filterOpen) closeFilterPopover();
    }
  });

  window.addEventListener('resize', () => { if(filterOpen) positionFilterPopover(); });
  window.addEventListener('scroll', () => { if(filterOpen) positionFilterPopover(); }, true);

  applyFiltersBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    const g = document.getElementById('filterGenre')?.value || '';
    const lang = document.getElementById('filterLang')?.value || '';
    const yearFrom = document.getElementById('filterYearFrom')?.value || '';
    const rating = document.getElementById('filterRating')?.value || '';
    const onlyAvailable = !!document.getElementById('filterAvailable')?.checked;

    let q = (activeCategory === 'All') ? ((searchInput?.value || '').trim() || 'subject:fiction') : categoryToQuery(activeCategory);
    if(g) q += ` ${g}`;
    if(lang) q += ` ${lang}`;

    await fetchBooksByCategory(q, 1, false);

    let arr = catFiltered.slice();
    if(yearFrom) arr = arr.filter(b => (b.pages ? (b.pages >= parseInt(yearFrom,10)) : true));
    if(rating) arr = arr.filter(b => (b.rating >= parseFloat(rating)));
    if(onlyAvailable) arr = arr.filter(b => (b.available && b.available > 0));

    catFiltered = arr;
    catCurrentPage = 1;
    updateCategoryView();
    closeFilterPopover();
  });

  clearFiltersBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const fields = ['filterGenre','filterLang','filterYearFrom','filterRating','filterAvailable'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if(!el) return;
      if(el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
  });

  /* =========================
     SIDEPANEL (detalhes)
  ========================= */
  function openPanel(book){
    if(!sidepanel) return;

    const sideTitle = document.getElementById('sideTitle');
    const sideAuthor = document.getElementById('sideAuthor');
    const sideDesc = document.getElementById('sideDesc');
    const sidePages = document.getElementById('sidePages');
    const sideRating = document.getElementById('sideRating');
    const sideAvailability = document.getElementById('sideAvailability');
    const coverEl = document.getElementById('sideCover');

    function safe(v){ return (v===0 || v)? v : '—'; }

    if(sideTitle) sideTitle.textContent = book.title || '';
    if(sideAuthor) sideAuthor.textContent = book.author || '';

    if(sideDesc) sideDesc.textContent = shortDescription(book.desc || '', 220);

    if(sidePages) sidePages.textContent = safe(book.pages ?? '—');
    if(sideRating) sideRating.textContent = safe(book.rating ?? '—');
    if(sideAvailability) sideAvailability.textContent = safe(book.available ?? '—');

    if(coverEl){
      coverEl.innerHTML = '';
      coverEl.style.backgroundImage = '';
      coverEl.style.backgroundRepeat = 'no-repeat';
      coverEl.style.backgroundPosition = 'center';
      coverEl.style.backgroundSize = 'contain';
      coverEl.style.display = 'block';
      coverEl.style.boxShadow = 'none';
      coverEl.style.backgroundColor = 'transparent';
      coverEl.style.borderRadius = coverEl.style.borderRadius || '12px';
      coverEl.style.height = coverEl.style.height || '260px';
      coverEl.style.margin = '36px auto 12px auto';

      const imgUrl = book.thumbnailProxy || book.thumbnail || null;
      if(imgUrl){
        coverEl.style.backgroundImage = `url('${imgUrl}')`;
      } else {
        coverEl.style.backgroundImage = '';
        coverEl.style.backgroundColor = book.color || '#122033';
        coverEl.textContent = (book.title || '').slice(0,3).toUpperCase();
        coverEl.style.color = '#fff';
        coverEl.style.display = 'flex';
        coverEl.style.alignItems = 'center';
        coverEl.style.justifyContent = 'center';
        coverEl.style.fontWeight = '700';
        coverEl.style.fontSize = '24px';
      }
    }

    // stars + score
    let ratingRow = sidepanel.querySelector('.rating-row');
    if(!ratingRow){
      ratingRow = document.createElement('div');
      ratingRow.className = 'rating-row';
      if(sideAuthor && sideAuthor.parentNode){
        sideAuthor.parentNode.insertBefore(ratingRow, sideAuthor.nextSibling);
      } else {
        sidepanel.querySelector('.side-body')?.appendChild(ratingRow);
      }
    }
    ratingRow.innerHTML = '';
    const stars = document.createElement('div');
    stars.className = 'stars';
    const ratingValue = Math.round((book.rating || 0) * 2) / 2;
    const full = Math.floor(ratingValue);
    const half = (ratingValue - full) >= 0.5;
    for(let i=0;i<5;i++){
      const iEl = document.createElement('i');
      if(window.FontAwesome || document.querySelector('link[href*="font-awesome"], script[src*="fontawesome"]')) {
        if(i < full) iEl.className = 'fa-solid fa-star';
        else if(i === full && half) iEl.className = 'fa-solid fa-star-half-stroke';
        else iEl.className = 'fa-regular fa-star';
      } else {
        iEl.textContent = (i < full ? '★' : '☆');
        iEl.style.fontSize = '16px';
        iEl.style.lineHeight = '1';
      }
      stars.appendChild(iEl);
    }
    const score = document.createElement('div');
    score.className = 'score';
    score.textContent = (book.rating && book.rating > 0) ? Number(book.rating).toFixed(1) : '—';
    ratingRow.appendChild(stars);
    ratingRow.appendChild(score);

    // meta chips
    let metaRow = sidepanel.querySelector('.meta');
    if(!metaRow){
      metaRow = document.createElement('div');
      metaRow.className = 'meta';
      const c1 = document.createElement('div'); c1.className = 'chip'; c1.id = 'sidePagesChip'; c1.innerHTML = `<strong>—</strong><div class="small">Pages</div>`;
      const c2 = document.createElement('div'); c2.className = 'chip'; c2.id = 'sideRatingChip'; c2.innerHTML = `<strong>—</strong><div class="small">Rating</div>`;
      const c3 = document.createElement('div'); c3.className = 'chip'; c3.id = 'sideReviewsChip'; c3.innerHTML = `<strong>—</strong><div class="small">Reviews</div>`;
      metaRow.appendChild(c1); metaRow.appendChild(c2); metaRow.appendChild(c3);
      if(sideDesc && sideDesc.parentNode) sideDesc.parentNode.insertBefore(metaRow, sideDesc.nextSibling);
      else sidepanel.querySelector('.side-body')?.appendChild(metaRow);
    }

    const pagesChip = document.getElementById('sidePagesChip');
    const ratingChip = document.getElementById('sideRatingChip');
    const reviewsChip = document.getElementById('sideReviewsChip');
    if(pagesChip) pagesChip.querySelector('strong').textContent = safe(book.pages ?? '—');
    if(ratingChip) ratingChip.querySelector('strong').textContent = (book.rating && book.rating>0) ? Number(book.rating).toFixed(1) : '—';
    if(reviewsChip) reviewsChip.querySelector('strong').textContent = (book.reviews !== undefined ? safe(book.reviews) : safe(book.available ?? '—'));

    // open panel
    if(filterOpen) closeFilterPopover && closeFilterPopover();
    sidepanel.classList.add('visible');
    overlay?.classList.add('visible');
    sidepanel.setAttribute('aria-hidden','false');
    mainContent?.classList.add('panel-open');
    sidepanel.dataset.bookId = book.id || '';

    // focus in action button
    setTimeout(()=> {
      const loanBtn = document.getElementById('btnLoan');
      if(loanBtn) loanBtn.focus();
    }, 220);

    // === atualiza handlers para que o botão saiba qual livro gravar no histórico ===
    if(btnReserve){
      btnReserve.onclick = (e) => {
        e.preventDefault();
        addToHistory(book, 'Reserva');
        // feedback visual rápido
        try{ if(window.DigiTaleNotifications && window.DigiTaleNotifications.push){} }catch(e){}
        // manter a UX: fecha painel e mostra mensagem
        closePanel();
      };
    }
    if(btnLoan){
      btnLoan.onclick = (e) => {
        e.preventDefault();
        addToHistory(book, 'Empréstimo');
        closePanel();
      };
    }
  }

  function closePanel(){
    if(!sidepanel) return;
    sidepanel.classList.remove('visible'); overlay?.classList.remove('visible');
    sidepanel.setAttribute('aria-hidden','true'); mainContent?.classList.remove('panel-open');
    delete sidepanel.dataset.bookId;
  }

  /* =========================
     UI EVENTS
  ========================= */
  seeAllBtn?.addEventListener('click', async (e)=> {
    e.preventDefault();
    recIsExpanded = !recIsExpanded;
    if(recIsExpanded){
      await ensureRecItemsForPage(1);
      recCurrentPage = 1;
      updateRecommendedView();
      document.getElementById('rec-title')?.scrollIntoView({behavior:'smooth'});
    } else {
      recCurrentPage = 1;
      updateRecommendedView();
    }
  });

  categorySeeAllBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    catIsExpanded = !catIsExpanded;
    if(catIsExpanded){
      await ensureCatItemsForPage(1);
      catCurrentPage = 1;
      updateCategoryView();
      document.getElementById('cat-title')?.scrollIntoView({behavior:'smooth'});
    } else {
      catCurrentPage = 1;
      updateCategoryView();
    }
  });

  overlay?.addEventListener('click', closePanel);
  closeBtn?.addEventListener('click', closePanel);
  document.addEventListener('keydown', e=> { if(e.key === 'Escape') closePanel(); });

  // NOTE: notifBtn behavior replaced by notification module below (so remove simple alert)
  if(notifBadge) notifBadge.textContent = '3';

  // dropdown caret
  let caretEl = null;
  (function ensureCaret(){
    if(!profileArea) return;
    caretEl = profileArea.querySelector('.caret');
    if(!caretEl){
      caretEl = document.createElement('span');
      caretEl.className = 'caret';
      caretEl.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';
      const nameNode = profileArea.querySelector('.name');
      if(nameNode && nameNode.parentNode) nameNode.parentNode.insertBefore(caretEl, nameNode.nextSibling);
      else profileArea.appendChild(caretEl);
    }
  })();

  function toggleDropdown(e){ if(!isLogged) return window.location.href = 'outras_telas/login/login.html'; e.stopPropagation(); if(!userDropdown) return; userDropdown.classList.toggle('show'); if(caretEl) caretEl.classList.toggle('open', userDropdown.classList.contains('show')); }
  avatarBtn?.addEventListener('click', toggleDropdown);
  profileArea?.querySelector('.name')?.addEventListener('click', toggleDropdown);
  document.addEventListener('click', (e) => { if(userDropdown && !userDropdown.contains(e.target) && !profileArea.contains(e.target)){ userDropdown.classList.remove('show'); if(caretEl) caretEl.classList.remove('open'); } });

  /* =========================
     MENU / AUTH (mock)
  ========================= */
  const PATHS = {
    LOGIN: 'outras_telas/login/login.html',
    REGISTER: 'outras_telas/registrar/registro.html',
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    FAVORITES: '/favorites'
  };

  const ITEMS_LOGGED_OUT = [
    { key:'discover', label:'Descubra', icon:'fa-solid fa-house' , href:'#' },
    { key:'categories', label:'Categorias', icon:'fa-solid fa-book-open', href:'#' },
    { key:'audio', label:'Audio Books', icon:'fa-solid fa-headphones', href:'#' },
  ];

  const ITEMS_IN_TOP = [
    { key:'discover', label:'Descubra', icon:'fa-solid fa-house', href:'#' },
    { key:'categories', label:'Categorias', icon:'fa-regular fa-folder', href:'#' },
    { key:'library', label:'Minha Biblioteca', icon:'fa-regular fa-folder-open', href:'#' },
    { key:'audio', label:'Audio Books', icon:'fa-solid fa-headphones', href:'#' },
    { key:'favs', label:'Favoritos', icon:'fa-regular fa-heart', href:'#' },
  ];

  const ITEMS_IN_BOTTOM = [
    { key:'support', label:'Suporte', icon:'fa-regular fa-life-ring', href:'#' },
    { key:'settings', label:'Ajustes', icon:'fa-solid fa-gear', href:'#' },
    { key:'logout', label:'Sair', icon:'fa-solid fa-right-from-bracket', href:'#' }
  ];

  function makeNavItem(item){
    const a = document.createElement('a');
    a.className = 'nav-item';
    a.href = item.href || '#';
    a.dataset.key = item.key;
    a.innerHTML = `<span class="nav-icon"><i class="${item.icon}"></i></span><span class="nav-label">${item.label}</span>`;
    a.addEventListener('click', (e)=> {
      if(item.key === 'logout'){ e.preventDefault(); handleLogout(); return; }
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      a.classList.add('active');
      if(item.key === 'discover'){
        recIsExpanded = false; recCurrentPage = 1; updateRecommendedView(); mainContent?.scrollTo({top:0,behavior:'smooth'});
      }
    });
    return a;
  }

  function renderMenu(){
    if(!sideNav || !sidebarFooter) return;
    sideNav.innerHTML = '';
    sidebarFooter.innerHTML = '';
    sidebarFooter.style.display = 'flex';

    if(!isLogged) {
      ITEMS_LOGGED_OUT.forEach(it => sideNav.appendChild(makeNavItem(it)));
      sidebarFooter.innerHTML = `
        <button id="registerBtn" class="btn-register">Criar Conta</button>
        <button id="loginBtn" class="btn-login">Entrar</button>
      `;
      document.getElementById('registerBtn').onclick = ()=> window.location.href = PATHS.REGISTER;
      document.getElementById('loginBtn').onclick = ()=> window.location.href = PATHS.LOGIN;
    } else {
      ITEMS_IN_TOP.forEach(it => sideNav.appendChild(makeNavItem(it)));
      ITEMS_IN_BOTTOM.forEach(it => {
        const navEl = makeNavItem(it);
        sidebarFooter.appendChild(navEl);
      });
    }
  }

  function handleLogout(){ localStorage.removeItem('BIB_TOKEN'); localStorage.removeItem('BIB_USER'); currentUser=null; isLogged=false; renderMenu(); applyLoggedOutUI(); buildUserDropdown(); }
  function applyLoggedOutUI(){ if(!avatarBtn) return; avatarBtn.classList.add('logged-out'); avatarBtn.innerHTML = `<i class="fa-regular fa-user"></i>`; const nameEl = profileArea?.querySelector('.name'); if(nameEl) nameEl.textContent = 'Login'; if(caretEl) caretEl.style.display='none'; if(profileArea) profileArea.onclick = () => window.location.href = PATHS.LOGIN; }
  function applyLoggedInUI(){ if(!avatarBtn) return; avatarBtn.classList.remove('logged-out'); let n = (currentUser && currentUser.name) || 'User'; avatarBtn.textContent = n.charAt(0).toUpperCase(); const nameEl = profileArea?.querySelector('.name'); if(nameEl) nameEl.textContent = firstName(n); if(caretEl) caretEl.style.display=''; if(profileArea) profileArea.onclick=null; buildUserDropdown(); }

  function buildUserDropdown() {
    if (!userDropdown) return;
    userDropdown.innerHTML = '';
    if (!isLogged) return;

    const add = (txt, url, icon) => {
        const a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = url;
        a.innerHTML = `<i class="${icon}" style="width: 20px; text-align: center; margin-right: 8px;"></i> ${txt}`;
        userDropdown.appendChild(a);
        return a;
    };

    add('Perfil', 'outras_telas/relatorio/relatorio.html#perfil', 'fa-regular fa-user');

    add('Empréstimos', 'outras_telas/relatorio/relatorio.html#emprestimos', 'fa-solid fa-book-open');
    add('Relatórios', 'outras_telas/relatorio/relatorio.html', 'fa-solid fa-chart-pie');
    add('Ajustes', '#', 'fa-solid fa-gear');

    const sep = document.createElement('div');
    sep.style.height = '1px';
    sep.style.backgroundColor = '#fff';
    sep.style.margin = '6px 0';
    userDropdown.appendChild(sep);

    const logoutItem = add('Sair', '#', 'fa-solid fa-right-from-bracket');
    logoutItem.onclick = (e) => {
      e.preventDefault(); e.stopPropagation(); handleLogout();
    };
  }

  /* =========================
     SEARCH (debounced)
  ========================= */
  const debouncedSearch = debounce(() => {
    recommendedBooks = []; recommendedFiltered = [];
    recCurrentFetchPage = 0; recTotalPagesFromApi = 1;
    fetchRecommended(1, false);
  }, 420);

  searchInput?.addEventListener('input', debouncedSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      debouncedSearch();
    }
  });

  /* =========================
     INITIALIZE
  ========================= */
  renderMenu();
  renderCategoryPills(0);
  if(isLogged) applyLoggedInUI(); else applyLoggedOutUI();
  buildUserDropdown();

  fetchRecommended(1, false);

  /* =========================
     UTILITY: close filter popover (internal)
  ========================= */
  function closeFilterPopover(){
    if(!advancedFilterModal) return;
    advancedFilterModal.classList.remove('visible');
    advancedFilterModal.setAttribute('aria-hidden','true');
    advancedFilterModal.style.left = ''; advancedFilterModal.style.top = '';
    filterOpen = false;
    document.body.style.overflow = '';
    if(advancedFilterBtn) advancedFilterBtn.focus();
  }

  /* =================================================
     NOTIFICATIONS MODULE (integrated, corrigido)
     - Persistência: localStorage (DIGITALE_NOTIFS_V1)
     - Painel anexado ao body e posicionado dinamicamente
     - API pública: window.DigiTaleNotifications.push(...)
     ================================================= */
  (function initNotificationsModule(){

    if(!document.getElementById) return;
    const notifBtnLocal = document.getElementById('notifBtn');
    const notifBadgeLocal = document.getElementById('notifBadge');
    if(!notifBtnLocal || !notifBadgeLocal) return;

    const STORAGE_KEY = 'DIGITALE_NOTIFS_V1';
    let notifs = [];

    // Garante wrapper apenas visual (mantém markup existente)
    let wrapper = notifBtnLocal.parentElement;
    if(!wrapper || !wrapper.classList.contains('notif-wrapper')){
      const newWrapper = document.createElement('div');
      newWrapper.className = 'notif-wrapper';
      notifBtnLocal.parentNode.insertBefore(newWrapper, notifBtnLocal);
      newWrapper.appendChild(notifBtnLocal);
      wrapper = newWrapper;
    }

    // Cria painel (anexado ao body para evitar clipping)
    let notifPanel = document.querySelector('.notif-panel');
    if(!notifPanel){
      notifPanel = document.createElement('div');
      notifPanel.className = 'notif-panel hidden-init';
      notifPanel.setAttribute('role','region');
      notifPanel.setAttribute('aria-label','Notificações');
      notifPanel.setAttribute('aria-hidden','true');
      notifPanel.style.position = 'fixed';
      notifPanel.style.zIndex = 3000;
      notifPanel.innerHTML = `
        <div class="panel-header">
          <h4 style="margin:0;font-size:1rem;">Notificações</h4>
          <div class="panel-actions">
            <button class="small-btn" data-action="markAllRead" title="Marcar todas como lidas">Marcar todas</button>
            <button class="small-btn" data-action="clearAll" title="Limpar todas">Limpar</button>
          </div>
        </div>
        <div class="list" role="list" aria-label="Lista de notificações"></div>
        <div class="panel-footer" style="padding:10px;border-top:1px solid rgba(0,0,0,0.04);text-align:center;"><a href="#/notifications">Ver todos ›</a></div>
      `;
      document.body.appendChild(notifPanel);
    }

    const listEl = notifPanel.querySelector('.list');
    const markAllBtn = notifPanel.querySelector('[data-action="markAllRead"]');
    const clearAllBtn = notifPanel.querySelector('[data-action="clearAll"]');

    function loadFromStorage(){
      try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return [];
        return JSON.parse(raw);
      }catch(e){ return []; }
    }
    function saveToStorage(){
      try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs)); }catch(e){}
    }

    function timeAgo(ts){
      if(!ts) return '';
      const diff = Math.floor((Date.now() - new Date(ts).getTime())/1000);
      if(diff < 60) return `${diff}s`;
      if(diff < 3600) return `${Math.floor(diff/60)}m`;
      if(diff < 86400) return `${Math.floor(diff/3600)}h`;
      return `${Math.floor(diff/86400)}d`;
    }

    function updateBadge(animation = false){
      const unread = notifs.filter(n => !n.read).length;
      if(unread <= 0){
        notifBadgeLocal.style.opacity = '0';
        notifBadgeLocal.style.pointerEvents = 'none';
        notifBadgeLocal.textContent = '';
        notifBtnLocal.setAttribute('aria-label','Notificações (nenhuma nova)');
      } else {
        notifBadgeLocal.style.opacity = '1';
        notifBadgeLocal.style.pointerEvents = 'auto';
        notifBadgeLocal.textContent = unread > 99 ? '99+' : String(unread);
        notifBtnLocal.setAttribute('aria-label', `Notificações (${unread} não lidas)`);
        if(animation){
          notifBadgeLocal.style.animation = 'notif-pulse .48s ease';
          setTimeout(()=> notifBadgeLocal.style.animation = '', 520);
        }
      }
    }

    function escapeHtmlShort(s){ if(!s && s !== 0) return ''; return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }

    function renderPanel(){
      listEl.innerHTML = '';
      if(!notifs || notifs.length === 0){
        listEl.innerHTML = `<div style="padding:18px;color:#9aa7bf;text-align:center">Sem notificações</div>`;
        updateBadge();
        return;
      }

      // mais recentes primeiro
      notifs.slice().reverse().forEach(n => {
        const item = document.createElement('div');
        item.className = 'notif-item' + (n.read ? '' : ' unread');
        item.setAttribute('role','listitem');
        item.dataset.id = n.id;
        item.tabIndex = 0;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = (n.title || 'N')[0].toUpperCase();

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `<div class="title">${escapeHtmlShort(n.title)}</div><div class="body">${escapeHtmlShort(n.body)}</div>`;

        const time = document.createElement('div');
        time.className = 'time';
        time.textContent = timeAgo(n.time);

        item.appendChild(avatar);
        item.appendChild(meta);
        item.appendChild(time);

        // clique na notificação: marca como lida e segue URL (se houver)
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          markAsRead(n.id);
          if(n.url) {
            setTimeout(()=> window.location.href = n.url, 80);
          }
        });

        // Enter/space keyboard activate
        item.addEventListener('keydown', (e) => {
          if(e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });

        listEl.appendChild(item);
      });

      updateBadge();
    }

    function markAsRead(id){
      const idx = notifs.findIndex(x => x.id === id);
      if(idx >= 0 && !notifs[idx].read){
        notifs[idx].read = true;
        saveToStorage();
        renderPanel();
      }
    }
    function markAllRead(){
      let changed = false;
      notifs.forEach(n => { if(!n.read){ n.read = true; changed = true; }});
      if(changed){ saveToStorage(); renderPanel(); }
    }
    function clearAll(){
      notifs = [];
      saveToStorage();
      renderPanel();
    }

    // positioning helpers — garante que o painel fique dentro da viewport
    function positionNotifPanel(){
      if(!notifPanel || !notifBtnLocal) return;
      const btnRect = notifBtnLocal.getBoundingClientRect();
      const panelRect = notifPanel.getBoundingClientRect();

      // prefer align to top-right of the button
      let top = Math.round(btnRect.bottom + 8);
      let right = Math.round(window.innerWidth - btnRect.right);

      // if panel would go beyond bottom, try to place above button
      if(top + panelRect.height > window.innerHeight - 12){
        top = Math.round(btnRect.top - panelRect.height - 8);
      }
      // ensure top not < 8
      top = Math.max(8, top);

      // ensure right not negative
      right = Math.max(8, right);

      notifPanel.style.top = top + 'px';
      notifPanel.style.right = right + 'px';
      notifPanel.style.left = 'auto';
    }

    function openPanel(){
      positionNotifPanel();
      notifPanel.classList.add('open');
      notifPanel.setAttribute('aria-hidden','false');
      const first = notifPanel.querySelector('.notif-item');
      if(first) first.focus();
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeyDown);
    }
    function closePanelLocal(){
      notifPanel.classList.remove('open');
      notifPanel.setAttribute('aria-hidden','true');
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeyDown);
    }
    function togglePanel(){
      if(notifPanel.classList.contains('open')) closePanelLocal();
      else openPanel();
    }

    function onDocClick(e){
      if(!notifPanel.contains(e.target) && !notifBtnLocal.contains(e.target)){
        closePanelLocal();
      }
    }
    function onKeyDown(e){
      if(e.key === 'Escape') closePanelLocal();
      if((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('notif-item')){
        document.activeElement.click();
      }
    }

    function pushNotification({ id, title, body, url, time } = {}){
      if(!id) id = 'n_' + Math.random().toString(36).slice(2,9);
      if(notifs.some(n => n.id === id)) return;
      const item = { id, title: title||'Notificação', body: body||'', url: url || null, time: time || new Date().toISOString(), read: false };
      notifs.push(item);
      saveToStorage();
      renderPanel();
      updateBadge(true);
    }

    // init
    notifs = loadFromStorage() || [];

    // se vazio, insere demo welcome (apenas uma vez - id fixo)
    if(!notifs || notifs.length === 0){
      pushNotification({
        id: 'welcome_v1',
        title: 'Bem vindo à DigiTale',
        body: 'Veja aqui suas atualizações, recomendações e mensagens.',
        url: '#',
        time: new Date().toISOString()
      });
    }

    // event hooks
    notifBtnLocal.addEventListener('click', (e) => { e.stopPropagation(); togglePanel(); });
    markAllBtn?.addEventListener('click', (e) => { e.stopPropagation(); markAllRead(); });
    clearAllBtn?.addEventListener('click', (e) => { e.stopPropagation(); clearAll(); });

    // recompute position on resize/scroll to keep panel visible
    window.addEventListener('resize', debounce(() => {
      if(notifPanel.classList.contains('open')) positionNotifPanel();
    }, 80));
    window.addEventListener('scroll', debounce(() => {
      if(notifPanel.classList.contains('open')) positionNotifPanel();
    }, 80), true);

    renderPanel();

    // API pública
    window.DigiTaleNotifications = {
      push: pushNotification,
      markAllRead,
      clearAll,
      getAll: () => notifs.slice()
    };

  })();

  /* -------------------------
     2) Centralizar searchbar na navbar (aplica inline styles responsivos)
     - não altera a sua marcação HTML, apenas aplica estilos seguros via JS
     ------------------------- */
  (function centerSearchBar(){
    const topnav = document.getElementById('topnav');
    const searchbarWrapper = searchInput ? searchInput.parentElement : null;
    if(!topnav || !searchbarWrapper || !searchInput) return;

    // ensure topnav position is relative for absolute centering
    topnav.style.position = topnav.style.position || 'relative';

    function applyCentering(){
      // constraints: keep searchInput responsive but centered
      searchbarWrapper.style.position = 'absolute';
      searchbarWrapper.style.left = '50%';
      searchbarWrapper.style.top = '50%';
      searchbarWrapper.style.transform = 'translate(-50%, -50%)';
      searchbarWrapper.style.width = 'min(760px, 55vw)';
      searchbarWrapper.style.maxWidth = 'calc(100% - 220px)'; // leave room for sidebar
      searchbarWrapper.style.zIndex = '200';
      // ensure the input itself is full width of wrapper
      searchInput.style.width = '100%';
      searchInput.style.boxSizing = 'border-box';
    }

    // call once and on resize for responsiveness
    applyCentering();
    window.addEventListener('resize', debounce(() => applyCentering(), 120));
  })();

  /* =================================================
     FIM das adições
     (todo o restante do seu código foi mantido)
     ================================================= */

});

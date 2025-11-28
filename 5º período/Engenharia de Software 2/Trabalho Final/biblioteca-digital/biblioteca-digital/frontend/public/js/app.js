// app.js - versão sem quickFilters duplicado nem botão "More"
document.addEventListener('DOMContentLoaded', () => {

  /* =========================
     CONFIG
  ========================= */
  const PATHS = {
    LOGIN: 'outras telas/login/login.html',
    REGISTER: 'outras telas/registrar/registro.html',
    PROFILE: '/profile',
    DASHBOARD: '/dashboard',
    HISTORY: '/history',
    FAVORITES: '/favorites'
  };

  const API_BASE = 'http://127.0.0.1:8080/api/books/search';
  const CATEGORIES = ['All','Ficção','Ciência','Programação','Negócios','Finanças','Educação'];

  /* =========================
     STATE / GRID FIXO
  ========================= */
  let recommendedBooks = [];
  let recommendedFiltered = [];
  let recCurrentPage = 1;
  let recIsExpanded = false;
  let recCurrentFetchPage = 0;
  let recTotalPagesFromApi = 1;

  let categoryBooks = [];
  let catFiltered = [];
  let catCurrentPage = 1;
  let catIsExpanded = false;
  let catCurrentFetchPage = 0;
  let catTotalPagesFromApi = 1;
  let activeCategory = 'All';

  const COLUMNS = 8;
  const ROWS_PER_PAGE = 3;
  const ITEMS_PER_PAGE = COLUMNS * ROWS_PER_PAGE; // 24
  const PREVIEW_COUNT = COLUMNS; // 8
  const PER_PAGE_API = 40;

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
  const advancedFilterModal = document.getElementById('advancedFilterModal');
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

  /* =========================
     BACKEND FETCH (generic)
  ========================= */
  async function fetchBooksFromApi(page = 1, per_page = PER_PAGE_API, q = 'tecnologia') {
    const safeQ = encodeURIComponent((q || '').trim() || 'tecnologia');
    const url = `${API_BASE}?q=${safeQ}&page=${page}&per_page=${per_page}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data;
  }

  function mapApiItemToBook(i){
    if(i.title && (i.thumbnail || i.color || i.id)){
      return {
        id: i.id || Math.random().toString(36).slice(2,9),
        title: i.title,
        author: Array.isArray(i.authors) ? i.authors[0] : (i.author || 'Autor Desconhecido'),
        category: Array.isArray(i.categories) ? i.categories[0] : (i.category || 'Geral'),
        pages: i.pageCount || i.pages || 0,
        rating: i.averageRating || i.rating || 0,
        available: i.available || 5,
        desc: i.description || i.desc || '',
        color: i.color || generateRandomPastelColor(),
        thumbnail: i.thumbnail || i.image || i.imageLinks?.thumbnail || null
      };
    }
    const info = i.volumeInfo || i;
    return {
      id: i.id || info.id || Math.random().toString(36).slice(2,9),
      title: info.title || 'Sem Título',
      author: (info.authors && info.authors[0]) || info.author || 'Autor Desconhecido',
      category: (info.categories && info.categories[0]) || 'Geral',
      pages: info.pageCount || 0,
      rating: info.averageRating || 0,
      available: 5,
      desc: info.description || '',
      color: generateRandomPastelColor(),
      thumbnail: info.imageLinks?.thumbnail || info.thumbnail || null
    };
  }

  /* =========================
     FETCH: Recommended
  ========================= */
  async function fetchRecommended(page = 1, append = false){
    if(!carousel) return;
    try{
      if(!append) carousel.innerHTML = '<div style="padding:20px;">Carregando recomendações...</div>';
      const q = (searchInput?.value || '').trim() || 'tecnologia';
      const data = await fetchBooksFromApi(page, PER_PAGE_API, q);
      const items = (data.items || []).map(mapApiItemToBook);
      recCurrentFetchPage = data.page || page || 1;
      recTotalPagesFromApi = data.total_pages || 1;
      if(append) recommendedBooks = recommendedBooks.concat(items); else recommendedBooks = items.slice();
      recommendedFiltered = recommendedBooks.slice();
      recCurrentPage = 1;
      updateRecommendedView();

      // SYNC: se a categoria ativa for 'All', preenche bloco de categorias
      if (activeCategory === 'All') {
        categoryBooks = recommendedBooks.slice();
        catFiltered = categoryBooks.slice();
        catCurrentPage = 1;
        updateCategoryView();
      }

    } catch(err){
      console.error('fetchRecommended error', err);
      carousel.innerHTML = `<div style="padding:20px;color:#d9534f;">Erro: ${escapeHtml(err.message)}</div>`;
    }
  }

  /* =========================
     FETCH: Category
  ========================= */
  async function fetchBooksByCategory(category, page = 1, append = false){
    if(!categoryCarousel) return;
    try{
      if(!append) categoryCarousel.innerHTML = `<div style="padding:20px;">Buscando categoria "${escapeHtml(category)}" ...</div>`;
      const q = category === 'All' ? (searchInput?.value || '').trim() || 'tecnologia' : category;
      const data = await fetchBooksFromApi(page, PER_PAGE_API, q);
      const items = (data.items || []).map(mapApiItemToBook);
      catCurrentFetchPage = data.page || page || 1;
      catTotalPagesFromApi = data.total_pages || 1;
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
     PAGINAÇÃO HELPERS
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

  /* =========================
     RENDER PAGINATION (reusável)
  ========================= */
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

    if(book.thumbnail){
      const img = document.createElement('img');
      img.src = String(book.thumbnail).replace(/^http:\/\//i,'https://');
      img.alt = book.title || '';
      img.loading = 'lazy';
      img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover';
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
    card.addEventListener('click', () => openPanel(book));
    return card;
  }

  /* =========================
     UPDATE VIEWS (Recommended + Category)
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
      if(seeAllBtn){ seeAllBtn.textContent='See All'; seeAllBtn.setAttribute('aria-expanded','false'); }

      const visibleCount = carousel.querySelectorAll('.card-item').length;
      let gap = 30;
      try{ const s = getComputedStyle(carousel); const g = s.gap || s.columnGap || s.gridColumnGap || ''; if(g){ const p=parseFloat(g); if(!Number.isNaN(p)) gap=p; }}catch(_){}

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
    if(seeAllBtn){ seeAllBtn.textContent='Show Less'; seeAllBtn.setAttribute('aria-expanded','true'); }

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
      if(categorySeeAllBtn){ categorySeeAllBtn.textContent='See All'; categorySeeAllBtn.setAttribute('aria-expanded','false'); }

      const visibleCount = categoryCarousel.querySelectorAll('.card-item').length;
      let gap = 30;
      try{ const s = getComputedStyle(categoryCarousel); const g = s.gap || s.columnGap || s.gridColumnGap || ''; if(g){ const p=parseFloat(g); if(!Number.isNaN(p)) gap=p; }}catch(_){}

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
    if(categorySeeAllBtn){ categorySeeAllBtn.textContent='Show Less'; categorySeeAllBtn.setAttribute('aria-expanded','true'); }

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
     renderCategoryPills (único lugar que cria os botões)
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
        // UI
        container.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');

        // state
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
     Advanced filter popover logic (sem alterações relevantes)
  ========================= */
  let filterOpen = false;

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

    let q = activeCategory === 'All' ? '' : activeCategory;
    if(g) q = (q ? q + ' ' : '') + g;
    if(lang) q = (q ? q + ' ' : '') + lang;
    if(!q) q = 'tecnologia';

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
     SIDE PANEL
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

    if(sideTitle) sideTitle.textContent = book.title || '';
    if(sideAuthor) sideAuthor.textContent = book.author || '';
    if(sideDesc) sideDesc.textContent = book.desc || '';
    if(sidePages) sidePages.textContent = book.pages ?? '—';
    if(sideRating) sideRating.textContent = book.rating ?? '—';
    if(sideAvailability) sideAvailability.textContent = book.available ?? '—';

    if(coverEl){
      if(book.thumbnail){
        coverEl.style.background = `url('${String(book.thumbnail).replace(/^http:\/\//i,'https://')}') center/cover no-repeat`;
        coverEl.textContent = '';
      } else {
        coverEl.style.background = book.color || generateRandomPastelColor();
        coverEl.textContent = '';
      }
    }

    if(filterOpen) closeFilterPopover();

    sidepanel.classList.add('visible'); overlay?.classList.add('visible');
    sidepanel.setAttribute('aria-hidden','false'); mainContent?.classList.add('panel-open');
    sidepanel.dataset.bookId = book.id;
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

  btnReserve?.addEventListener('click', ()=> alert('Reserva solicitada!'));
  btnLoan?.addEventListener('click', ()=> alert('Empréstimo iniciado!'));

  notifBtn?.addEventListener('click', e=> { e.stopPropagation(); alert('Sem notificações.'); });
  if(notifBadge) notifBadge.textContent = '3';

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

  function toggleDropdown(e){ if(!isLogged) return window.location.href = PATHS.LOGIN; e.stopPropagation(); if(!userDropdown) return; userDropdown.classList.toggle('show'); if(caretEl) caretEl.classList.toggle('open', userDropdown.classList.contains('show')); }
  avatarBtn?.addEventListener('click', toggleDropdown);
  profileArea?.querySelector('.name')?.addEventListener('click', toggleDropdown);
  document.addEventListener('click', (e) => { if(userDropdown && !userDropdown.contains(e.target) && !profileArea.contains(e.target)){ userDropdown.classList.remove('show'); if(caretEl) caretEl.classList.remove('open'); } });

  /* =========================
     MENU / AUTH (mock)
  ========================= */
  const ITEMS_LOGGED_OUT = [
    { key:'discover', label:'Descubra', icon:'fa-solid fa-house' , href:'#' },
    { key:'categories', label:'Categorias', icon:'fa-solid fa-book-open', href:'#' },
    { key:'audio', label:'Audio Books', icon:'fa-solid fa-headphones', href:'#' },
    { key:'support', label:'Suporte', icon:'fa-regular fa-life-ring', href:'#' },
  ];
  const ITEMS_LOGGED_IN = [
    { key:'discover', label:'Descubra', icon:'fa-solid fa-house', href:'#' },
    { key:'categories', label:'Categorias', icon:'fa-regular fa-folder', href:'#' },
    { key:'library', label:'My Library', icon:'fa-regular fa-folder-open', href:'#' },
    { key:'downloads', label:'Downloads', icon:'fa-solid fa-download', href:'#' },
    { key:'audio', label:'Audio Books', icon:'fa-solid fa-headphones', href:'#' },
    { key:'favs', label:'Favoritos', icon:'fa-regular fa-heart', href:'#' },
    { key:'separator' },
    { key:'settings', label:'Settings', icon:'fa-solid fa-gear', href:'#' },
    { key:'logout', label:'Logout', icon:'fa-solid fa-right-from-bracket', href:'#' }
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
    if(!sideNav) return;
    sideNav.innerHTML = '';
    const list = isLogged ? ITEMS_LOGGED_IN : ITEMS_LOGGED_OUT;
    list.forEach(it => {
      if(it.key === 'separator'){ const sep = document.createElement('div'); sep.className='menu-separator'; sideNav.appendChild(sep); return; }
      sideNav.appendChild(makeNavItem(it));
    });
    if(sidebarFooter){
      if(isLogged) sidebarFooter.style.display = 'none';
      else {
        sidebarFooter.style.display = 'flex';
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        if(loginBtn) loginBtn.onclick = ()=> window.location.href = PATHS.LOGIN;
        if(registerBtn) registerBtn.onclick = ()=> window.location.href = PATHS.REGISTER;
      }
    }
  }

  function handleLogout(){ localStorage.removeItem('BIB_TOKEN'); localStorage.removeItem('BIB_USER'); currentUser=null; isLogged=false; renderMenu(); applyLoggedOutUI(); buildUserDropdown(); }
  function applyLoggedOutUI(){ if(!avatarBtn) return; avatarBtn.classList.add('logged-out'); avatarBtn.innerHTML = `<i class="fa-regular fa-user"></i>`; const nameEl = profileArea?.querySelector('.name'); if(nameEl) nameEl.textContent = 'Login'; if(caretEl) caretEl.style.display='none'; if(profileArea) profileArea.onclick = () => window.location.href = PATHS.LOGIN; }
  function applyLoggedInUI(){ if(!avatarBtn) return; avatarBtn.classList.remove('logged-out'); let n = (currentUser && currentUser.name) || 'User'; avatarBtn.textContent = n.charAt(0).toUpperCase(); const nameEl = profileArea?.querySelector('.name'); if(nameEl) nameEl.textContent = firstName(n); if(caretEl) caretEl.style.display=''; if(profileArea) profileArea.onclick=null; buildUserDropdown(); }
  function buildUserDropdown(){ if(!userDropdown) return; userDropdown.innerHTML=''; if(!isLogged) return; const add=(txt,url)=>{ const a=document.createElement('a'); a.className='dropdown-item'; a.textContent=txt; a.href=url; userDropdown.appendChild(a); }; add('Perfil', PATHS.PROFILE); add('Sair','#'); const last=userDropdown.lastChild; if(last) last.onclick=(e)=>{ e.preventDefault(); handleLogout(); }; }

  /* =========================
     INITIALIZE
  ========================= */
  renderMenu();
  renderCategoryPills(0);
  if(isLogged) applyLoggedInUI(); else applyLoggedOutUI();

  // initial fetches
  fetchRecommended(1, false);

});

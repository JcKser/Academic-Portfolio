// main.js
import { debounce } from './utils.js';
import { fetchFromApi, mapApiItem, PER_PAGE } from './api.js';
import { createCardElement, setContainerFullWidth } from './ui.js';

/* ===== SELECTORS: ajuste os IDs no seu HTML conforme necessário ===== */
const recommendedContainer = document.getElementById('recommended-carousel'); // bloco Recommended
const categoriesContainer = document.getElementById('categories-carousel');   // bloco Categories (separado)
const categoriesPagination = document.getElementById('categories-pagination');
const recommendedSeeAll = document.getElementById('seeAllRecommended');
const categoriesSeeAll = document.getElementById('seeAllCategories');
const categoryList = document.getElementById('categoryList'); // botões .cat
const searchInput = document.getElementById('searchInput');

/* ===== ESTADOS separados ===== */
let recommendedBooks = [];  // controla apenas o bloco Recommended
let categoriesBooks = [];   // controla apenas o bloco Categories (resultado da busca por categoria)
let categoriesPage = 1;
let categoriesIsExpanded = false;

/* CONFIG */
const COLUMNS = 8; const ROWS = 3;
const ITEMS_PER_PAGE = COLUMNS * ROWS; // 24
const PREVIEW_COUNT = COLUMNS; // 8 preview

/* ===== HELPERS ===== */
function clearChildren(el){ while(el && el.firstChild) el.removeChild(el.firstChild); }

/* ===== RECOMMENDED (IA / independente) =====
   - Este bloco NÃO será afetado pelas categorias.
   - Keep it simple: load default query 'tecnologia' or call your AI endpoint.
*/
async function loadRecommended(q = 'tecnologia'){
  if(!recommendedContainer) return;
  setContainerFullWidth(recommendedContainer);
  recommendedContainer.innerHTML = '<div style="padding:18px">Carregando recomendados...</div>';
  try {
    const data = await fetchFromApi({ q, page: 1, per_page: PER_PAGE });
    const items = (data.items || []).map(mapApiItem);
    recommendedBooks = items; // replace
    renderRecommended();
  } catch(err){
    recommendedContainer.innerHTML = `<div style="padding:18px;color:#c00">Erro: ${err.message}</div>`;
    console.error('loadRecommended', err);
  }
}

function renderRecommended(){
  if(!recommendedContainer) return;
  clearChildren(recommendedContainer);
  setContainerFullWidth(recommendedContainer);

  // preview ou show all
  const toShow = recommendedBooks.slice(0, PREVIEW_COUNT);
  toShow.forEach(b => recommendedContainer.appendChild(createCardElement(b, openPanel)));
  // botão See All específico para Recommended (se quiser colocar paginação também, pode)
  // Note: não vamos tocar nas categoriasBooks aqui.
}

/* ===== CATEGORIES block =====
   - Quando o usuário clica numa categoria (.cat) vamos buscar somente para esse bloco
   - Esse bloco tem paginação própria
*/
async function fetchCategoriesByQuery(q = '', page = 1){
  if(!categoriesContainer) return;
  try {
    if(page === 1) {
      categoriesContainer.innerHTML = '<div style="padding:18px">Carregando categorias...</div>';
    }
    const data = await fetchFromApi({ q: q || 'tecnologia', page, per_page: PER_PAGE });
    const items = (data.items || []).map(mapApiItem);
    // on first page we replace; you may want to append for load-more behavior
    if(page === 1) categoriesBooks = items;
    else categoriesBooks = categoriesBooks.concat(items);

    renderCategories();
  } catch(err){
    categoriesContainer.innerHTML = `<div style="padding:18px;color:#c00">Erro: ${err.message}</div>`;
    console.error('fetchCategoriesByQuery', err);
  }
}

function renderCategories(){
  if(!categoriesContainer) return;
  clearChildren(categoriesContainer);
  setContainerFullWidth(categoriesContainer);

  if(!categoriesBooks || categoriesBooks.length === 0){
    categoriesContainer.innerHTML = '<div style="padding:16px">Nenhum livro nesta categoria.</div>';
    if(categoriesPagination) categoriesPagination.style.display = 'none';
    return;
  }

  if(!categoriesIsExpanded){
    const preview = categoriesBooks.slice(0, PREVIEW_COUNT);
    preview.forEach(b => categoriesContainer.appendChild(createCardElement(b, openPanel)));
    if(categoriesPagination) categoriesPagination.style.display = 'none';
    if(categoriesSeeAll) categoriesSeeAll.textContent = 'See All';
    return;
  }

  // expanded with pagination
  const start = (categoriesPage - 1) * ITEMS_PER_PAGE;
  const itemsToShow = categoriesBooks.slice(start, start + ITEMS_PER_PAGE);
  itemsToShow.forEach(b => categoriesContainer.appendChild(createCardElement(b, openPanel)));

  // render pagination (simple 5-button window + arrows)
  renderCategoriesPagination();
  if(categoriesSeeAll) categoriesSeeAll.textContent = 'Show Less';
}

function renderCategoriesPagination(){
  if(!categoriesPagination) return;
  clearChildren(categoriesPagination);
  categoriesPagination.style.display = 'flex';

  const totalPages = Math.max(1, Math.ceil(categoriesBooks.length / ITEMS_PER_PAGE));
  const maxBtns = 5;
  let start = Math.max(1, categoriesPage - 2);
  let end = start + maxBtns - 1;
  if(end > totalPages){
    end = totalPages;
    start = Math.max(1, end - maxBtns + 1);
  }

  const prev = document.createElement('button'); prev.className='page-btn'; prev.textContent='‹';
  prev.disabled = categoriesPage === 1;
  prev.addEventListener('click', async () => { if(categoriesPage>1){ categoriesPage--; await ensureCategoriesItems(categoriesPage); renderCategories(); }});
  categoriesPagination.appendChild(prev);

  for(let i=start;i<=end;i++){
    const btn = document.createElement('button'); btn.className = 'page-btn' + (i===categoriesPage ? ' active' : '');
    btn.textContent = i;
    btn.addEventListener('click', async ()=> { categoriesPage = i; await ensureCategoriesItems(categoriesPage); renderCategories(); });
    categoriesPagination.appendChild(btn);
  }

  const next = document.createElement('button'); next.className='page-btn'; next.textContent='›';
  next.disabled = (categoriesPage >= totalPages);
  next.addEventListener('click', async () => { if(categoriesPage < totalPages){ categoriesPage++; await ensureCategoriesItems(categoriesPage); renderCategories(); }});
  categoriesPagination.appendChild(next);
}

// ensure we have enough items loaded locally for page (calls backend if needed)
async function ensureCategoriesItems(page){
  const needed = page * ITEMS_PER_PAGE;
  if(categoriesBooks.length >= needed) return;
  // fetch next backend page(s) - here we calculate which backend page to request (simple)
  // NOTE: backend pagination might differ; we call fetchCategoriesByQuery with page param to append.
  const backendPage = Math.floor(categoriesBooks.length / PER_PAGE) + 1;
  await fetchCategoriesByQuery(lastCategoryQuery || 'tecnologia', backendPage);
}

/* ===== EVENTS: categories clicks (isolated) ===== */
let lastCategoryQuery = '';

function setupCategoryButtons(){
  if(!categoryList) return;
  categoryList.querySelectorAll('.cat').forEach(btn => {
    btn.addEventListener('click', async () => {
      categoryList.querySelectorAll('.cat').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const catText = btn.textContent.trim();
      // *** IMPORTANT: this search updates ONLY the Categories block (NOT Recommended) ***
      lastCategoryQuery = catText === 'All' ? '' : catText;
      categoriesPage = 1;
      categoriesIsExpanded = true; // option: auto expand when you click a category
      await fetchCategoriesByQuery(lastCategoryQuery, 1);
    });
  });
}

/* ===== See All toggles (each block independent) ===== */
recommendedSeeAll?.addEventListener('click', (e) => {
  e.preventDefault();
  // For recommended block we can implement expand if desired (kept simple here)
  // Example: toggle to load more and render full recommendedBooks
  if(recommendedBooks.length <= PREVIEW_COUNT) return;
  // quick toggle: if preview -> show all (no pagination)
  if(recommendedContainer.dataset.expanded === '1'){
    recommendedContainer.dataset.expanded = '0';
    renderRecommended();
    recommendedSeeAll.textContent = 'See All';
  } else {
    recommendedContainer.dataset.expanded = '1';
    clearChildren(recommendedContainer);
    recommendedBooks.forEach(b => recommendedContainer.appendChild(createCardElement(b, openPanel)));
    recommendedSeeAll.textContent = 'Show Less';
  }
});

categoriesSeeAll?.addEventListener('click', async (e) => {
  e.preventDefault();
  categoriesIsExpanded = !categoriesIsExpanded;
  if(categoriesIsExpanded){
    // ensure first page
    await ensureCategoriesItems(1);
    categoriesPage = 1;
  }
  renderCategories();
});

/* ===== Search in top searchbar should NOT affect Recommended.
         We'll use it to search globally AND optionally update categories only.
         Here: searching updates categories block only. Recommended stays as IA.
*/
searchInput?.addEventListener('input', debounce(async (ev) => {
  const q = (ev.target.value || '').trim();
  // Search behavior: update categories block only
  lastCategoryQuery = q;
  categoriesPage = 1;
  categoriesIsExpanded = true;
  await fetchCategoriesByQuery(lastCategoryQuery || '', 1);
}, 350));

/* ===== Panel open callback (single function used by both blocks) ===== */
function openPanel(book){
  // pre-existing logic or minimal: abrir sidepanel, preencher campos...
  const sidepanel = document.getElementById('sidepanel');
  if(!sidepanel) { console.log('Open panel', book); return; }
  const sideTitle = document.getElementById('sideTitle');
  const sideAuthor = document.getElementById('sideAuthor');
  const sideDesc = document.getElementById('sideDesc');
  const coverEl = document.getElementById('sideCover');
  if(sideTitle) sideTitle.textContent = book.title || '';
  if(sideAuthor) sideAuthor.textContent = book.author || '';
  if(sideDesc) sideDesc.textContent = book.desc || '';
  if(coverEl){
    if(book.thumbnail) coverEl.style.background = `url('${String(book.thumbnail).replace(/^http:\/\//i,'https://')}') center/cover no-repeat`;
    else coverEl.style.background = book.color || '#eee';
  }
  sidepanel.classList.add('visible');
  document.getElementById('overlay')?.classList.add('visible');
}

/* ===== INITIALIZE ===== */
(function init(){
  setupCategoryButtons();
  loadRecommended('tecnologia');       // IA-driven / independent
  // initial categories: load nothing or default content (optional)
  // fetchCategoriesByQuery('tecnologia', 1);
})();

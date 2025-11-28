// js/api.js
(function(global){
  const API_BASE = 'http://127.0.0.1:8080/api/books/search';
  const PER_PAGE_API = 40;

  async function fetchBooksFromApi(page = 1, per_page = PER_PAGE_API, q = 'tecnologia'){
    const safeQ = encodeURIComponent((q || '').trim() || 'tecnologia');
    const url = `${API_BASE}?q=${safeQ}&page=${page}&per_page=${per_page}`;
    const res = await fetch(url);
    if(!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }

  function mapApiItemToBook(i){
    if(i.title && (i.thumbnail || i.color || i.id)){
      return {
        id: i.id || Math.random().toString(36).slice(2,9),
        title: i.title,
        author: Array.isArray(i.authors) ? i.authors[0] : (i.author || i.authors || 'Autor Desconhecido'),
        category: Array.isArray(i.categories) ? i.categories[0] : (i.category || 'Geral'),
        pages: i.pageCount || i.pages || 0,
        rating: i.averageRating || i.rating || 0,
        available: i.available || 5,
        desc: i.description || i.desc || '',
        color: i.color || window.generateRandomPastelColor(),
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
      color: window.generateRandomPastelColor(),
      thumbnail: info.imageLinks?.thumbnail || info.thumbnail || null
    };
  }

  global.fetchBooksFromApi = fetchBooksFromApi;
  global.mapApiItemToBook = mapApiItemToBook;
  global.PER_PAGE_API = PER_PAGE_API;
  global.API_BASE = API_BASE;
})(window);

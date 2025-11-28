// js/ui.js
(function(global){
  function createCardElement(book, openPanel){
    const card = document.createElement('div');
    card.className = 'card-item';
    card.setAttribute('role','listitem');

    const cover = document.createElement('div');
    cover.className = 'book-cover';
    cover.style.background = book.color || window.generateRandomPastelColor();

    if(book.thumbnail){
      const img = document.createElement('img');
      img.src = String(book.thumbnail).replace(/^http:\/\//i,'https://');
      img.alt = book.title || '';
      img.loading = 'lazy';
      img.style.width='100%';
      img.style.height='100%';
      img.style.objectFit='cover';
      img.addEventListener('error', ()=> {
        if(img.parentNode) img.parentNode.removeChild(img);
        cover.textContent = (book.title||'').slice(0,3).toUpperCase();
      });
      cover.appendChild(img);
    } else {
      cover.textContent = (book.title||'').slice(0,3).toUpperCase();
      cover.style.color = '#333';
      cover.style.fontWeight = '700';
    }

    const title = document.createElement('div');
    title.className = 'book-title';
    title.textContent = book.title || 'Sem Título';

    const author = document.createElement('div');
    author.className = 'book-author';
    author.textContent = book.author || 'Autor Desconhecido';

    card.appendChild(cover);
    card.appendChild(title);
    card.appendChild(author);

    card.addEventListener('click', ()=> openPanel && openPanel(book));
    return card;
  }

  global.createCardElement = createCardElement;
})(window);

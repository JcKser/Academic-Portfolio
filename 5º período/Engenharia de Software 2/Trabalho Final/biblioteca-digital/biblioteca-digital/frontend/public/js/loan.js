/* loan.js
   Responsabilidades:
   - lógica de empréstimo e reserva (frontend)
   - persistência local (localStorage) + hooks para chamadas reais ao backend
   - integração com UI (sidepanel, detail page, botões btnLoan / btnReserve)
   - integra com DigiTaleNotifications (se existir)
*/

(function () {
  'use strict';

  /* ---------- CONFIG ---------- */
  const LOANS_KEY = 'DIGITALE_LOANS_V1';
  const RESERVES_KEY = 'DIGITALE_RESERVES_V1';
  const LOAN_PERIOD_DAYS_DEFAULT = 14;
  const RESERVATION_EXPIRY_DAYS = 7;
  const BACKEND_PREFIX = window.__BACKEND_BASE__ || '';

  /* ---------- HELPERS ---------- */
  const nowISO = () => new Date().toISOString();
  const addDaysISO = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString(); };
  const uid = (p = 'x') => p + '_' + Math.random().toString(36).slice(2, 9);

  const readStorage = (k) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
  const writeStorage = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { } };

  const getCurrentUser = () => { try { return JSON.parse(localStorage.getItem('BIB_USER')); } catch { return null; } };

  function notify(t, b, url = null) {
    if (window.DigiTaleNotifications?.push)
      window.DigiTaleNotifications.push({ title: t, body: b, url, time: nowISO() });
    else
      console.info('notify:', t, b);
  }

  /* ---------- BOOK CONTEXT ---------- */
  function getBookFromContext() {
    const side = document.getElementById('sidepanel');
    if (side?.dataset?.book) {
      try { return JSON.parse(side.dataset.book); } catch { }
    }
    if (window.lastBook) return window.lastBook;
    return null;
  }

  function updateAvailabilityInUI(book) {
    if (!book) return;
    const sideAvail = document.getElementById('sideAvailability');
    if (sideAvail) sideAvail.textContent = String(book.available ?? '—');

    const detailAvail = document.getElementById('detailAvailability');
    if (detailAvail) detailAvail.textContent = String(book.available ?? '—');

    refreshButtonsState(book);
  }

  function refreshButtonsState(book) {
    const btnLoan = document.getElementById('btnLoan');
    const btnReserve = document.getElementById('btnReserve');
    if (!book || !btnLoan) return;

    const user = getCurrentUser();

    const hasLoan = user
      ? loansAll().some(l => l.bookId === book.id && l.userId === user.id && !l.returned)
      : false;

    const hasReserve = user
      ? reservesAll().some(r => r.bookId === book.id && r.userId === user.id && !r.fulfilled)
      : false;

    const available = Number(book.available || 0);

    // Already borrowed
    if (hasLoan) {
      btnLoan.textContent = 'Devolver';
      btnLoan.dataset.action = 'return';
      btnLoan.disabled = false;

      if (btnReserve) {
        btnReserve.textContent = hasReserve ? 'Reservado' : 'Reservar';
        btnReserve.disabled = !!hasReserve;
      }
      return;
    }

    // No copies available
    if (available <= 0) {
      btnLoan.textContent = 'Indisponível';
      btnLoan.disabled = true;

      if (btnReserve) {
        btnReserve.textContent = hasReserve ? 'Reservado' : 'Reservar';
        btnReserve.disabled = hasReserve;
      }
      return;
    }

    // Normal case
    btnLoan.textContent = 'Emprestar';
    btnLoan.disabled = false;
    btnLoan.dataset.action = 'loan';

    if (btnReserve) {
      btnReserve.textContent = 'Reservar';
      btnReserve.disabled = false;
    }
  }

  /* ---------- Storage queries ---------- */
  const loansAll = () => readStorage(LOANS_KEY);
  const reservesAll = () => readStorage(RESERVES_KEY);

  const loansForUser = (uid) => loansAll().filter(l => l.userId === uid);
  const reservesForUser = (uid) => reservesAll().filter(r => r.userId === uid);

  const saveLoanRecord = (rec) => { const a = loansAll(); a.push(rec); writeStorage(LOANS_KEY, a); return rec; };
  const saveReserveRecord = (rec) => { const a = reservesAll(); a.push(rec); writeStorage(RESERVES_KEY, a); return rec; };

  /* ---------- BACKEND CALLS (reais) ---------- */

  async function apiLoanBook(bookId, userId, dueDateISO) {
    const url = `${BACKEND_PREFIX}/api/loans`;
    const payload = { bookId, userId, dueDate: dueDateISO };

    const res = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`API loan failed (${res.status})`);
    return res.json();
  }

  async function apiReserveBook(bookId, userId, expiresAtISO) {
    const url = `${BACKEND_PREFIX}/api/reservations`;
    const payload = { bookId, userId, expiresAt: expiresAtISO };

    const res = await fetch(url, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`API reserve failed (${res.status})`);
    return res.json();
  }

  /* ---------- ACTIONS (EXPOR AQUI PARA O APP) ---------- */

  async function handleLoan(book) {
    const user = getCurrentUser();
    if (!user) return alert("Faça login primeiro.");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    try {
      await apiLoanBook(book.id, user.id, dueDate.toISOString());
      alert("Empréstimo registrado!");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar empréstimo.");
    }
  }

  async function handleReserve(book) {
    const user = getCurrentUser();
    if (!user) return alert("Faça login primeiro.");

    const expires = new Date();
    expires.setDate(expires.getDate() + 2);

    try {
      await apiReserveBook(book.id, user.id, expires.toISOString());
      alert("Reserva registrada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar reserva.");
    }
  }

  // EXPOSE TO WINDOW (SEM EXPORT)
  window.handleLoan = handleLoan;
  window.handleReserve = handleReserve;

  /* ---------- FULL BUTTON LOGIC (EMPRES / RESERVA / DEVOLVER) ---------- */

  async function handleLoanClick(ev) {
    ev?.preventDefault();
    const btn = ev?.currentTarget;
    if (!btn) return;

    const book = getBookFromContext();
    if (!book) return;

    // Redirect no login
    const user = getCurrentUser();
    if (!user) {
      notify('Login necessário', 'Faça login para emprestar.');
      document.getElementById('loginBtn')?.click();
      return;
    }

    // If returning
    if (btn.dataset.action === 'return') {
      const all = loansForUser(user.id);
      const loan = all.find(l => l.bookId === book.id && !l.returned);
      if (!loan) return;

      loan.returned = true;
      loan.returnedAt = nowISO();

      const arr = loansAll();
      const i = arr.findIndex(x => x.id === loan.id);
      if (i >= 0) arr[i] = loan;
      writeStorage(LOANS_KEY, arr);

      book.available = Number(book.available || 0) + 1;
      updateAvailabilityInUI(book);

      notify('Devolvido', `"${book.title}" foi devolvido.`);
      refreshButtonsState

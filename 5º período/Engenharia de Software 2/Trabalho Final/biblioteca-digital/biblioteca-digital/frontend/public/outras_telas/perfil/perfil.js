/* frontend/public/outras_telas/perfil/perfil.js */
(function(){
  
  // ============================================================
  // 1. CONFIGURAÇÕES DE API
  // ============================================================
  const API_HOST = "http://127.0.0.1:8080";
  
  // Rotas (Certifique-se que seu Python tem essas rotas ou ajuste aqui)
  const GET_PROFILE_URL = `${API_HOST}/api/auth/me`; 
  const SAVE_PROFILE_URL = `${API_HOST}/api/users/update`; // Você precisará criar essa rota no Python
  
  const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3 MB
  const TRANSPARENT_SRC = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

  // ============================================================
  // 2. HELPERS DE REDE (FETCH COM TOKEN)
  // ============================================================
  
  function getToken() {
    return localStorage.getItem('BIB_TOKEN');
  }

  async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    const headers = { ...options.headers };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Se NÃO for FormData (upload), define JSON
    // Se for FormData, o browser define o Content-Type multipart automaticamente
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);
      
      // Se der erro de auth (401), talvez redirecionar pro login
      if (response.status === 401) {
        console.warn("Sessão expirada");
        // window.location.href = '/login.html'; // Opcional
      }

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || response.statusText);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // ============================================================
  // 3. UI HELPERS (TOASTS)
  // ============================================================
  function showToast(msg, {timeout = 4000, type = 'info'} = {}) {
    try {
      let wrap = document.getElementById('perfil-toast-wrap');
      if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'perfil-toast-wrap';
        wrap.style.cssText = "position:fixed; right:18px; bottom:18px; z-index:999999; display:flex; flex-direction:column; gap:10px;";
        document.body.appendChild(wrap);
      }
      const t = document.createElement('div');
      t.className = 'perfil-toast';
      t.style.cssText = `
        min-width: 220px; max-width: 360px; padding: 12px 16px; border-radius: 10px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15); font-family: 'Inter', sans-serif; font-size: 13px;
        background: ${type === 'error' ? '#fee2e2' : (type === 'success' ? '#ecfdf5' : '#ffffff')};
        color: ${type === 'error' ? '#991b1b' : (type === 'success' ? '#065f46' : '#0f172a')};
        opacity: 0; transform: translateY(10px); transition: all 0.3s ease;
      `;
      t.innerText = msg;
      wrap.appendChild(t);
      
      // Animação de entrada
      requestAnimationFrame(() => {
        t.style.opacity = '1';
        t.style.transform = 'translateY(0)';
      });

      setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(10px)';
        setTimeout(() => t.remove(), 300);
      }, timeout);
    } catch (e) { console.warn('toast erro', e); }
  }

  // ============================================================
  // 4. ESTADO E LÓGICA DO FORMULÁRIO
  // ============================================================
  let state = {
    inited: false,
    handlers: [],
    currentAvatarFile: null,
    removedAvatar: false,
    wrapperEl: null,
    _avatarBehaviorBound: false
  };

  function cleanup() {
    if (!state.inited) return;
    state.handlers.forEach(({el, ev, fn}) => {
      try { el.removeEventListener(ev, fn); } catch(e) {}
    });
    state.handlers = [];
    state.currentAvatarFile = null;
    state.removedAvatar = false;
    state.inited = false;
    state.wrapperEl = null;
    state._avatarBehaviorBound = false;
  }

  function addHandler(el, ev, fn) {
    if (!el) return;
    el.addEventListener(ev, fn);
    state.handlers.push({el, ev, fn});
  }

  // --- Lógica de Avatar ---
  function getInitialFromName(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    return (parts[0] && parts[0][0]) ? parts[0][0].toUpperCase() : '';
  }

  function showImageAvatar(wrapperEl, src) {
    const avatarImg = wrapperEl.querySelector('#avatarPreview');
    if (avatarImg) {
      avatarImg.src = src || TRANSPARENT_SRC;
      // Garante que não está escondido
      avatarImg.style.display = 'block';
    }
  }

  // --- Preencher Formulário com Dados do Backend ---
  function populateForm(data = {}) {
    const name = state.wrapperEl.querySelector('#profileName');
    const email = state.wrapperEl.querySelector('#profileEmail');
    const updatedAt = state.wrapperEl.querySelector('#profileUpdatedAt');
    const surname = state.wrapperEl.querySelector('#profileSurname');
    const dob = state.wrapperEl.querySelector('#profileDob');

    if (name) name.value = data.name || '';
    if (surname) surname.value = data.surname || ''; // Se o backend retornar sobrenome
    if (email) email.value = data.email || '';
    
    if (dob && data.dob) {
      try { dob.value = new Date(data.dob).toISOString().slice(0,10); } catch(e){ dob.value = ''; }
    }
    
    if (updatedAt) {
      updatedAt.innerText = data.created_at ? new Date(data.created_at).toLocaleDateString() : 'Hoje';
    }

    // Avatar
    if (data.avatar_url) {
      showImageAvatar(state.wrapperEl, data.avatar_url);
    }
  }

  // --- Validação ---
  function validateForm() {
    const name = state.wrapperEl.querySelector('#profileName')?.value?.trim();
    const email = state.wrapperEl.querySelector('#profileEmail')?.value?.trim();
    const pass = state.wrapperEl.querySelector('#profilePass')?.value || '';
    const passConfirm = state.wrapperEl.querySelector('#profilePassConfirm')?.value || '';

    if (!name) return { ok: false, message: 'Preencha seu nome.' };
    if (!email) return { ok: false, message: 'Preencha seu e-mail.' };
    
    if (pass || passConfirm) {
      if (pass !== passConfirm) return { ok: false, message: 'As senhas não conferem.' };
      if (pass.length < 6) return { ok: false, message: 'Senha muito curta (mínimo 6 caracteres).' };
    }
    return { ok: true, name, email };
  }

  // --- Salvar Perfil ---
  async function saveProfile(ev) {
    if (ev && ev.preventDefault) ev.preventDefault();
    
    const submitBtn = state.wrapperEl.querySelector('#saveProfileBtn');
    const v = validateForm();
    
    if (!v.ok) { showToast(v.message, {type: 'error'}); return; }

    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerText = 'Salvando...'; }

    try {
      // Usa FormData para suportar envio de arquivo
      const fd = new FormData();
      fd.append('name', v.name);
      fd.append('email', v.email);
      
      const surname = state.wrapperEl.querySelector('#profileSurname')?.value;
      if (surname) fd.append('surname', surname);

      const pass = state.wrapperEl.querySelector('#profilePass')?.value;
      if (pass) fd.append('password', pass);
      
      // Envio do arquivo
      if (state.currentAvatarFile) {
        fd.append('avatar', state.currentAvatarFile);
      }

      // Envia para o Backend
      const res = await fetchWithAuth(SAVE_PROFILE_URL, {
        method: 'PUT', // ou POST, depende do seu backend
        body: fd
      });

      showToast('Perfil atualizado com sucesso!', {type: 'success'});
      
      // Limpa campos de senha
      state.wrapperEl.querySelector('#profilePass').value = '';
      state.wrapperEl.querySelector('#profilePassConfirm').value = '';

    } catch (err) {
      console.error('Erro ao salvar:', err);
      showToast('Erro ao salvar: ' + (err.message || 'Erro desconhecido'), {type: 'error'});
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.innerText = 'Salvar alterações'; }
    }
  }

  // --- Carregar Dados Iniciais ---
  async function loadProfile() {
    try {
      const data = await fetchWithAuth(GET_PROFILE_URL);
      if (data) {
        populateForm(data);
      } else {
        showToast('Não foi possível carregar os dados.', {type:'error'});
      }
    } catch (err) {
      console.warn('loadProfile erro:', err);
      // Se for 401, o fetchWithAuth já avisa no console, mas podemos mostrar toast
      if(err.message.includes('401')) {
        showToast('Sessão expirada. Faça login novamente.', {type:'error'});
      }
    }
  }

  // --- Manipulador de Avatar (Preview Local) ---
  function handleAvatarSelect(inputEl) {
    return function(e) {
      const file = inputEl.files && inputEl.files[0];
      if (!file) return;

      if (file.size > MAX_AVATAR_BYTES) {
        showToast('Imagem muito grande (Max 3MB).', {type:'error'});
        return;
      }

      const fr = new FileReader();
      fr.onload = () => showImageAvatar(state.wrapperEl, fr.result);
      fr.readAsDataURL(file);
      
      state.currentAvatarFile = file;
    };
  }

  // ============================================================
  // 5. INICIALIZAÇÃO (MAIN FUNCTION)
  // ============================================================
  function initPerfil() {
    cleanup();
    const wrapper = document.querySelector('[data-init="initPerfil"]');
    
    if (!wrapper) {
      console.warn('initPerfil: wrapper não encontrado no DOM');
      return;
    }
    state.wrapperEl = wrapper;
    state.inited = true;

    // Referências aos elementos
    const avatarInput = wrapper.querySelector('#avatarInput');
    const avatarCircle = wrapper.querySelector('.avatar-circle');
    const removeBtn = wrapper.querySelector('#removeAvatarBtn');
    const form = wrapper.querySelector('#profileForm');
    const saveBtn = wrapper.querySelector('#saveProfileBtn');

    // Eventos
    if (avatarInput) addHandler(avatarInput, 'change', handleAvatarSelect(avatarInput));
    
    if (avatarCircle && avatarInput) {
      addHandler(avatarCircle, 'click', () => avatarInput.click());
    }

    if (removeBtn) {
      addHandler(removeBtn, 'click', () => {
        showImageAvatar(wrapper, TRANSPARENT_SRC); // Limpa visualmente
        state.currentAvatarFile = null;
        // Aqui você poderia adicionar flag para o backend deletar a foto
        showToast('Avatar removido (clique em Salvar para confirmar)', {type:'info'});
      });
    }

    if (saveBtn) {
      addHandler(saveBtn, 'click', saveProfile);
    }
    
    if (form) {
      addHandler(form, 'submit', saveProfile);
    }

    // Carrega dados do servidor
    loadProfile();

    // Exporta cleanup globalmente se precisar
    window.destroyPerfil = cleanup;
  }

  // Expor globalmente para o Router chamar
  window.initPerfil = initPerfil;

  // Auto-init de segurança (caso o router não chame)
  setTimeout(() => {
    if (!state.inited && document.querySelector('[data-init="initPerfil"]')) {
      initPerfil();
    }
  }, 200);

})();
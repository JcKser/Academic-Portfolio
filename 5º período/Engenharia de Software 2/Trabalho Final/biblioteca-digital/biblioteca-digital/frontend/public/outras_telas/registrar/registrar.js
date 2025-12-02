// registrar.js
(() => {
  const BASE = "http://127.0.0.1:8080";

  const form = document.getElementById("registerForm");
  const errorBox = document.getElementById("formError");

  if(!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const pass = form.password.value;
    const confirm = form.confirm.value;

    if (!name || !email || !pass || !confirm) {
      showError("Por favor, preencha todos os campos.");
      return;
    }
    if (pass.length < 6) {
      showError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (pass !== confirm) {
      showError("As senhas não coincidem.");
      return;
    }

    try {
      const res = await fetch(`${BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        const detail = data?.detail || data?.message || JSON.stringify(data);
        showError(`Erro ${res.status}: ${detail}`);
        return;
      }

      // Salva usuário + token
      if (data.access_token) localStorage.setItem("BIB_TOKEN", data.access_token);
      if (data.user) localStorage.setItem("BIB_USER", JSON.stringify(data.user));

      // Vai direto para o menu (index.html)
      window.location.href = "/frontend/public/index.html";
    } catch (err) {
      showError("Erro ao conectar com servidor.");
      console.error(err);
    }
  });

  function showError(msg) {
    if(!errorBox) return alert(msg);
    errorBox.textContent = msg;
    errorBox.style.display = "block";
  }
  function hideError() {
    if(!errorBox) return;
    errorBox.style.display = "none";
    errorBox.textContent = "";
  }
})();

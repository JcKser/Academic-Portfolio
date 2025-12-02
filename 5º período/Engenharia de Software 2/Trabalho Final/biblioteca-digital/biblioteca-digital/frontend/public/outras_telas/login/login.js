// login.js
(() => {
  const BASE = "http://127.0.0.1:8080";

  const form = document.querySelector("form");
  if(!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const passInput = form.querySelector('input[type="password"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passInput.value;

    if (!email || !password) {
      alert("Preencha email e senha.");
      return;
    }

    try {
      const res = await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }

      if (!res.ok) {
        alert(data.detail || data.message || "Erro ao logar.");
        return;
      }

      if (data.access_token) localStorage.setItem("BIB_TOKEN", data.access_token);
      if (data.user) localStorage.setItem("BIB_USER", JSON.stringify(data.user));

      window.location.href = "/frontend/public/index.html";
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    }
  });
})();

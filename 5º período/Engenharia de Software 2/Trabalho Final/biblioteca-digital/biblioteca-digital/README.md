# 📚 DigiTale — Plataforma de Biblioteca Digital

Este projeto é uma aplicação web de biblioteca digital desenvolvida como parte de um projeto de Iniciação Científica (PUC Minas). O sistema permite buscar livros, visualizar detalhes, e simular empréstimos e reservas utilizando a API do Google Books e persistência local.

## 🎥 Vídeos do Projeto

Confira abaixo a demonstração do sistema funcionando e a apresentação oficial do projeto:

| 📱 Demonstração do Sistema | 🎤 Apresentação do Projeto |
| :---: | :---: |
| [![Demo de DigiTale](https://img.youtube.com/vi/_BA_gz6C1Fc/0.jpg)]([https://www.youtube.com/watch?v=_BA_gz6C1Fc](https://youtu.be/SsAu7LIHFBM)) | [![Apresentação DigiTale](https://img.youtube.com/vi/onhJrS40Qm4/0.jpg)](https://www.youtube.com/watch?v=onhJrS40Qm4) |

---

## 🚀 Funcionalidades

- **Busca de Livros:** Integração em tempo real com a **Google Books API**.
- **Categorias Dinâmicas:** Filtragem por gêneros (Ficção, Tecnologia, Negócios, etc.).
- **Painel de Detalhes:** Visualização de capa, autor, rating e descrição ao clicar no livro.
- **Simulação de Empréstimo/Reserva:**
  - Funcionalidade de "Ler Agora" e "Reservar".
  - Os dados são salvos no **LocalStorage** do navegador (simulando um Banco de Dados).
- **Histórico do Usuário:** Visualização dos livros emprestados ou reservados na área de relatórios.
- **Notificações:** Sistema de notificações visuais ao realizar ações.

## 🛠️ Tecnologias Utilizadas

- **HTML5 & CSS3** (Layout Responsivo e Moderno).
- **JavaScript (ES6+)** (Lógica de fetch, DOM manipulation e LocalStorage).
- **Google Books API** (Fonte de dados dos livros).
- **FontAwesome** (Ícones).

---

## 📦 Como Rodar o Projeto

Como o projeto é estático (não depende de um backend Node.js/Python rodando), você tem duas opções principais:

### Opção 1: VS Code + Live Server (Recomendado)

Esta é a melhor forma para garantir que todos os caminhos de arquivos e ícones carreguem corretamente.

1. Abra a pasta do projeto no **VS Code**.
2. Instale a extensão **Live Server** (caso não tenha).
3. Clique com o botão direito no arquivo `index.html`.
4. Selecione **"Open with Live Server"**.
5. O projeto abrirá automaticamente no seu navegador padrão (geralmente em `http://127.0.0.1:5500`).

### Opção 2: Execução Simples

1. Navegue até a pasta do projeto.
2. Dê um **duplo clique** no arquivo `index.html`.
3. **Nota:** Alguns navegadores podem bloquear requisições de API (CORS) rodando direto do arquivo (`file://`). Se a busca não funcionar, use a Opção 1.

---

## 🧪 Como Testar as Funcionalidades

1. **Buscar Livros:** Digite um termo na barra de pesquisa ou clique em uma categoria (ex: "Sci-Fi").
2. **Realizar Empréstimo:**
   - Clique na capa de qualquer livro.
   - No painel lateral que abrir, clique em **"Read now"** (Empréstimo) ou **"Reserve"**.
   - Verifique o ícone de sino (Notificações) no topo direito.
3. **Verificar Histórico:**
   - Clique no seu Avatar (canto superior direito).
   - Selecione **"Histórico"** ou **"Empréstimos"**.
   - Você verá a tabela com o livro que acabou de selecionar.

---

## 📂 Estrutura de Pastas Importantes

- `index.html`: Página principal (Home/Busca).
- `styles.css`: Estilos globais.
- `js/app.js`: Lógica principal, conexão com API e controle de ações.
- `outras_telas/`:
  - `login/`: Tela de Login.
  - `relatorio/`: Tela onde fica o Histórico e Perfil.

---

## ⚠️ Observações

- **Persistência de Dados:** O sistema utiliza `localStorage`. Se você limpar o cache do navegador ou abrir em aba anônima, o histórico de empréstimos será resetado.
- **API Key:** O projeto está configurado para usar a cota pública da Google Books API. Caso a busca pare de funcionar por excesso de requisições, pode ser necessário inserir uma API Key no arquivo `app.js`.

---

**Autor:** Júlio César
**Instituição:** PUC Minas
**Área:** Inteligência Artificial / Desenvolvimento Web

# 🪟 Janela Inteligente — IoT com Docker, HiveMQ e InfluxDB

Sistema IoT completo para controle e monitoramento de uma **janela inteligente**, integrando:

- **ESP32/Arduino** → publica medições (umidade, temperatura, posição)
- **HiveMQ Cloud (MQTT)** → broker para comunicação em tempo real
- **Telegraf** → ponte MQTT → InfluxDB
- **InfluxDB Cloud** → armazena dados de telemetria
- **FastAPI Gateway** → API + WebSocket entre front e backend
- **React + Vite** → painel web interativo

---

## 🧱 Arquitetura geral

```mermaid
graph LR
A[ESP32 / Arduino] -- MQTT --> B[HiveMQ Cloud]
B -- MQTT Consumer --> C[Telegraf]
C -- Line Protocol --> D[InfluxDB]
D -- HTTP / Query --> E[FastAPI Gateway]
E -- WebSocket / REST --> F[React Frontend]
```

## 🛠️ Pré-requisitos

* [Docker Desktop]()
* [Node.js 18+]()
* Conta gratuita no [HiveMQ Cloud]()
* Conta no [InfluxDB Cloud](https://cloud2.influxdata.com/)

---

## ⚙️ Estrutura do projeto

<pre class="overflow-visible!" data-start="1262" data-end="1674"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>janela-inteligente/
├─ back/                  </span><span># Backend FastAPI</span><span>
│  ├─ main.py
│  └─ requirements.txt
├─ front/                 </span><span># Frontend React (Vite)</span><span>
│  ├─ index.html
│  ├─ vite.config.ts
│  └─ src/
│     ├─ main.tsx
│     └─ JanelaPanel.tsx
├─ telegraf.conf          </span><span># Configuração MQTT → Influx</span><span>
├─ docker-compose.yml     </span><span># Orquestra Telegraf e Gateway</span><span>
└─ .</span><span>env</span><span></span><span># Variáveis de ambiente</span><span>
</span></span></code></div></div></pre>

---

## 🌍 Variáveis de ambiente (.env)

Crie um arquivo `.env` na raiz do projeto com:

<pre class="overflow-visible!" data-start="1765" data-end="2100"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ini"><span><span># HiveMQ</span><span>
</span><span>MQTT_BROKER_HOST</span><span>=<seu-host>.s1.eu.hivemq.cloud
</span><span>MQTT_BROKER_PORT</span><span>=</span><span>8883</span><span>
</span><span>MQTT_USERNAME</span><span>=<usuario>
</span><span>MQTT_PASSWORD</span><span>=<senha>
</span><span>DEFAULT_DEVICE_ID</span><span>=dev06

</span><span># InfluxDB</span><span>
</span><span>INFLUX_URL</span><span>=https://us-east-</span><span>1</span><span>-</span><span>1</span><span>.aws.cloud2.influxdata.com
</span><span>INFLUX_TOKEN</span><span>=<token>
</span><span>INFLUX_ORG</span><span>=<org>
</span><span>INFLUX_BUCKET</span><span>=TI-V-Smart-Window

</span><span># API</span><span>
</span><span>API_BIND</span><span>=</span><span>0.0</span><span>.</span><span>0.0</span><span>
</span><span>API_PORT</span><span>=</span><span>8080</span><span>
</span></span></code></div></div></pre>

---

## 🐳 Subindo tudo com Docker

1. Entre na pasta do projeto:
   <pre class="overflow-visible!" data-start="2171" data-end="2217"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cd</span><span> D:\PUC\quinto_Periodo\TI5
   </span></span></code></div></div></pre>
2. Suba os serviços:
   <pre class="overflow-visible!" data-start="2243" data-end="2281"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker compose up -d
   </span></span></code></div></div></pre>
3. Verifique:
   <pre class="overflow-visible!" data-start="2300" data-end="2394"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker ps
   docker logs -f janela-gateway
   docker logs -f janela-telegraf
   </span></span></code></div></div></pre>
4. Teste o backend:
   <pre class="overflow-visible!" data-start="2419" data-end="2494"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>curl http://localhost:8080/api/health
   </span><span># → {"ok": true}</span><span>
   </span></span></code></div></div></pre>

---

## 📡 Publicando telemetria (teste)

Publique via `mosquitto_pub` ou script Python (`publisher.py`):

<pre class="overflow-visible!" data-start="2603" data-end="2860"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>mosquitto_pub -h <seu-host>.s1.eu.hivemq.cloud -p 8883 \
  --capath </span><span>"C:\Program Files\Git\mingw64\ssl\certs"</span><span> \
  -u <usuario> -P <senha> \
  -t sensors/dev06/telemetry -q 1 \
  -m </span><span>'{"device_id":"dev06","humidity":58.3,"temp":25.4,"position":50}'</span><span>
</span></span></code></div></div></pre>

Verifique o endpoint:

<pre class="overflow-visible!" data-start="2884" data-end="3018"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>curl </span><span>"http://localhost:8080/api/telemetry/last?device_id=dev06"</span><span>
</span><span># → {"humidity":58.3,"temp":25.4,"position":50,"ts":"..."}</span><span>
</span></span></code></div></div></pre>

---

## 🧩 Rodando o Frontend

### 🔹 Modo Desenvolvimento (Vite)

<pre class="overflow-visible!" data-start="3087" data-end="3125"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cd</span><span> front
npm i
npm run dev
</span></span></code></div></div></pre>

Acesse: [http://localhost:5173](http://localhost:5173)

✅ O proxy do Vite manda:

* `/api` → `http://localhost:8080`
* `/ws` → `ws://localhost:8080`

### 🔹 Modo Produção (build servida pelo backend)

<pre class="overflow-visible!" data-start="3327" data-end="3423"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cd</span><span> front
npm run build
</span><span>cd</span><span> ..
docker compose up -d --force-recreate --no-deps gateway
</span></span></code></div></div></pre>

Acesse: [http://localhost:8080](http://localhost:8080)

---

## 🧠 Como funciona

* O **ESP32** publica telemetria no tópico MQTT `sensors/<device_id>/telemetry`.
* O **Telegraf** lê essas mensagens e grava no **InfluxDB** como measurement `telemetry`.
* O **Gateway FastAPI** consulta o Influx e expõe endpoints REST e WebSocket.
* O **Frontend React** exibe cards, gráficos e envia comandos via `/api/command`.

---

## 🧪 Endpoints principais

| Endpoint                                | Método | Descrição                                     |
| --------------------------------------- | ------- | ----------------------------------------------- |
| `/api/health`                         | GET     | Teste de status do backend                      |
| `/api/telemetry/last?device_id=dev06` | GET     | Último ponto (umidade, temp, posição)        |
| `/api/telemetry?last=-30m`            | GET     | Histórico para gráficos                       |
| `/api/command`                        | POST    | Envia comando MQTT (`open`,`close`,`set`) |
| `/ws`                                 | WS      | Canal de telemetria em tempo real               |

---

## 🧰 Dicas de debug

* Logs Telegraf:
  <pre class="overflow-visible!" data-start="4316" data-end="4362"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker logs -f janela-telegraf
  </span></span></code></div></div></pre>
* Logs Gateway:
  <pre class="overflow-visible!" data-start="4381" data-end="4426"><div class="contain-inline-size rounded-2xl relative bg-token-sidebar-surface-primary"><div class="sticky top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>docker logs -f janela-gateway
  </span></span></code></div></div></pre>
* Logs Front (modo dev): ver Console (F12) no navegador.

---

## ⚙️ Segurança e boas práticas

* Use **TLS (porta 8883)** no HiveMQ.
* Rotacione tokens e senhas no `.env`.
* Use `retained` apenas em `/state` (status do dispositivo).
* Mantenha `tag_keys = ["device_id"]` no Telegraf.
* Em produção, prefira rodar o front compilado via gateway (porta 8080).

---

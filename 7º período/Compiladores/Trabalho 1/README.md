# Compiladores — Trabalho Prático N.01 (linguagem COOL)

Interpretador de uma máquina de pilha escrito em Cool. Entrega **individual**,
vale 4 pontos extras.

**Status: ambiente pronto, implementação a fazer.**

---

## 1. Ambiente (já resolvido)

O compilador da disciplina exige **Linux x86**. O WSL desta máquina está com o
serviço `WSLService` desativado — religar exige PowerShell como administrador:

```powershell
Set-Service -Name WSLService -StartupType Manual
Start-Service WSLService
```

A alternativa usada foi um **GitHub Codespace** (Ubuntu x86_64, roda no
navegador), que é a "instância gratuita de nuvem" sugerida no enunciado.
Já foi criado e configurado — basta reabrir em `github.com/codespaces`.

Se precisar refazer do zero:

```bash
sudo apt-get update
sudo apt-get install -y g++ make csh sharutils flex bison

sudo mkdir -p /var/tmp/cool && sudo chown $(whoami) /var/tmp/cool
cp 7*/Compiladores/x86_64.u /var/tmp/cool/
cd /var/tmp/cool && uudecode x86_64.u && tar xpf x86_64.tar.gz && make install
```

## 2. Gerar o PA1

```bash
mkdir -p ~/PA1 && cd ~/PA1
make -f /var/tmp/cool/assignments/PA1/Makefile
```

Isso cria `Makefile README atoi.cl stack.cl stack.test`. O `stack.cl` vem como
esqueleto — é ele que precisa ser escrito.

## 3. Ciclo de trabalho

```bash
make test     # compila com coolc e roda no spim usando stack.test como entrada
```

Para testar interativamente:

```bash
/var/tmp/cool/bin/coolc stack.cl atoi.cl
/var/tmp/cool/bin/spim -file stack.s
```

## 4. Desenho sugerido (sem código)

O enunciado recomenda solução orientada a objetos. Um caminho que funciona:

**Hierarquia de comandos** — uma classe raiz (`StackCommand`) que declara as
operações genéricas, e uma subclasse por tipo de item que pode ficar na pilha:
o inteiro, o `+` e o `s`. As operações que a raiz precisa declarar são, no
mínimo: como o item se exibe no comando `d`, e o que ele faz quando o comando
`e` é emitido e ele está no topo.

**A sacada do `e`** — não precisa de cadeia de `if`. A tabela de três casos do
enunciado vira despacho dinâmico: pergunte ao elemento do topo o que fazer, e
cada subclasse responde por si. O caso "inteiro no topo → pilha inalterada"
sai de graça como comportamento padrão da raiz.

**A pilha** — Cool não tem lista na biblioteca padrão, então é lista encadeada
na mão: uma classe de célula com o item e a próxima, e uma referência `void`
marcando o fim. Lembre que Cool tem herança **simples**: se a pilha precisar
imprimir, ela vai precisar herdar `IO`.

**Conversão string ↔ inteiro** — use a classe `A2I` de `atoi.cl` (métodos
`a2i` e `i2a`). Cool não permite herdar de duas classes, então guarde um `A2I`
como atributo em vez de tentar herdar.

**Armadilha** — se a entrada acabar sem um `x` (rodando com `< stack.test`),
`in_string()` devolve string vazia para sempre. Decida o que fazer com isso.

Referência de tamanho do enunciado: ~200 linhas.

## 5. Entrega

Responder as três perguntas no fim do `README` gerado, e então:

```bash
cd .. && tar cvzf PA1.tar.gz PA1
uuencode PA1.tar.gz PA1.tar.gz > PA1.u && rm PA1.tar.gz
```

Sobe o `PA1.u` no SGA.

## Estrutura

```
Compiladores/
├── docs/          # documentação oficial da linguagem COOL
│   ├── cool-manual.pdf   # o manual — a referência de sintaxe
│   ├── cool-tour.pdf
│   ├── cool-paper.pdf
│   └── cool-runtime.pdf
├── x86_64.u       # material da disciplina (coolc, spim, examples)
└── README.md
```

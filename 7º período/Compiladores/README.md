# Compiladores — Trabalho Prático N.01 (linguagem COOL)

Entrega preliminar do trabalho prático, **individual**. Interpretador de uma
máquina de pilha escrito em Cool.

## Status

- [x] O código implementado compila e executa corretamente.
- [x] README do PA1 preenchido com as respostas das três perguntas.

Verificado em 18/08/2026: `make test` produz saída **byte a byte idêntica** ao
gabarito impresso no enunciado, e o exemplo interativo do PDF (`1 + 2 s d e e d x`)
também reproduz o resultado esperado.

## Ambiente

O compilador da disciplina roda em **Linux x86**. Como o WSL desta máquina está
com o serviço desativado, o trabalho foi feito em um **GitHub Codespace**
(Ubuntu 24.04, x86_64) — que é a "instância gratuita de nuvem" sugerida no
enunciado.

```bash
# dependências
sudo apt-get install -y g++ make csh sharutils flex bison

# instalação do material da disciplina
sudo mkdir -p /var/tmp/cool && sudo chown $(whoami) /var/tmp/cool
cp x86_64.u /var/tmp/cool/ && cd /var/tmp/cool
uudecode x86_64.u && tar xpf x86_64.tar.gz && make install

# geração e execução do PA1
mkdir -p ~/PA1 && cd ~/PA1
make -f /var/tmp/cool/assignments/PA1/Makefile
cp <caminho>/stack.cl stack.cl
make test

# empacotamento da entrega
cd .. && tar cvzf PA1.tar.gz PA1
uuencode PA1.tar.gz PA1.tar.gz > PA1.u && rm PA1.tar.gz
```

## Estrutura

```
Compiladores/
├── docs/          # documentação oficial da linguagem COOL
│   ├── cool-manual.pdf
│   ├── cool-tour.pdf
│   ├── cool-paper.pdf
│   └── cool-runtime.pdf
├── x86_64.u       # material da disciplina (compilador, spim, exemplos)
├── PA1/
│   ├── stack.cl      # a implementação
│   └── respostas.txt # respostas anexadas ao README do PA1
└── README.md
```

## Desenho da solução

| Classe | Papel |
|---|---|
| `StackCommand` | raiz da hierarquia; operações genéricas `toStr()`, `value()`, `eval(st)` |
| `IntCommand` | inteiro empilhado; herda o `eval` padrão (pilha inalterada) |
| `PlusCommand` | desempilha `+`, soma os dois inteiros seguintes, empilha o resultado |
| `SwapCommand` | desempilha `s`, troca os dois seguintes de lugar |
| `StackNode` | célula da lista encadeada (`void` = fim da lista) |
| `Stack` | a pilha; herda `IO` para se imprimir no comando `d` |
| `Main` | laço de leitura, prompt `>`, despacho dos comandos |

O comando `e` não faz análise de casos: `Main` pergunta ao elemento do topo com
`stack.peek().eval(stack)` e o despacho dinâmico escolhe o comportamento.

Único desvio em relação ao enunciado: string vazia (EOF) também encerra o laço,
além do `x`. Sem isso, rodar com um arquivo de entrada sem `x` no final vira
laço infinito empilhando zeros.

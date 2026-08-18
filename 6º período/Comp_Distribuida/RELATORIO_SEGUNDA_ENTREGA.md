# Jogo de Corrida Distribuído: Tratamento de Falhas e Controle de Réplicas

*Distributed Racing Game: Fault Handling and Replica Control*

**Autores:** Bernardo Temponi, Gabriel Schlegel, Júlio César, Lucas Cabral, Pedro Gaioso, Priscila Goulart e Rafael Vilefort

**Instituição:** Instituto de Informática - Pontifícia Universidade Católica de Minas Gerais (PUC Minas), Belo Horizonte - MG - Brasil

## Abstract

This paper presents the evolution of a distributed multiplayer racing game whose shared state is maintained by a cluster of server processes. Communication uses a custom request-response protocol with newline-delimited JSON over TCP; although the first report called it a custom RPC, the implementation does not provide stubs, an interface definition language, or the transparency of conventional RPC frameworks. Server nodes order messages with Lamport logical clocks, elect a coordinator with the Bully algorithm, and apply a primary-backup replication strategy. The second stage adds leadership terms, state versions, replica acknowledgements, bounded exponential backoff, failure detection, failover, client redirection, and state synchronization before a recovered node can lead again. In five local crash-stop trials, all failovers preserved the player state and the mean externally observed recovery time was 3.022 seconds.

**Keywords:** distributed systems, fault tolerance, leader election, replication, Lamport clocks, multiplayer games.

## Resumo

Este artigo apresenta a evolução de um jogo de corrida multiplayer distribuído cujo estado compartilhado é mantido por um conjunto de processos servidores. A comunicação utiliza um protocolo próprio de requisição-resposta, com mensagens JSON delimitadas por quebra de linha sobre TCP; embora o primeiro relatório o tenha chamado de RPC próprio, a implementação não possui stubs, linguagem de definição de interfaces ou a transparência oferecida por frameworks RPC convencionais. Os nós servidores ordenam mensagens com relógios lógicos de Lamport, elegem um coordenador pelo algoritmo Bully e adotam replicação primário-réplica. Na segunda etapa foram acrescentados termos de liderança, versões de estado, confirmações das réplicas, backoff exponencial, detecção de falhas, failover, redirecionamento de clientes e sincronização antes que um nó recuperado volte a liderar. Em cinco ensaios locais com queda abrupta, todos os failovers preservaram o jogador e o tempo médio observado de recuperação foi 3,022 segundos.

**Palavras-chave:** sistemas distribuídos, tolerância a falhas, eleição de líder, replicação, relógios de Lamport, jogos multiplayer.

## 1. Introdução e problema escolhido

Jogos multiplayer em tempo real exigem que diferentes participantes observem uma evolução suficientemente coerente do mesmo mundo, mesmo quando comandos chegam em instantes distintos ou um processo servidor deixa de responder. Em uma arquitetura centralizada, a queda do servidor interrompe a partida e elimina o estado mantido apenas em memória. O problema escolhido foi, portanto, desenvolver um jogo de corrida em que vários jogadores compartilham pista, posições, velocidades, checkpoints e voltas, enquanto um conjunto de servidores mantém uma cópia atualizada da simulação e elege automaticamente um novo coordenador diante de falhas.

O objetivo não é acelerar a física por divisão de dados. A distribuição é empregada para disponibilidade, ordenação de eventos e recuperação. A simulação possui um escritor ativo por vez: o líder recebe entradas e executa a física; os seguidores mantêm réplicas em espera ativa. Essa decisão reduz conflitos concorrentes e permite que um seguidor assuma usando o último estado aceito. A interface Pygame permanece separada da comunicação por uma thread, evitando que timeouts bloqueiem a renderização.

Na primeira etapa foram escolhidos três itens: comunicação inspirada em chamadas remotas, relógios lógicos de Lamport e eleição Bully. Na segunda etapa foi escolhido **controle de réplicas**, além do tratamento obrigatório de falhas. A revisão também corrige imprecisões do primeiro texto, que descrevia cabeçalho fixo, tamanho de payload e Ping/Pong inexistentes no código.

## 2. Arquitetura e comunicação

### 2.1 Entidades e responsabilidades

O **cliente** captura o teclado, envia `join_player` e `submit_input`, recebe snapshots e desenha o jogo. Ele guarda endereços aprendidos nas respostas e tenta outros nós quando o destino atual falha. O **líder** é o único servidor que altera o mundo: executa a física a 60 atualizações por segundo e produz snapshots completos aproximadamente 15 vezes por segundo. O **seguidor** aplica snapshots, responde a sondagens, acompanha o coordenador e participa da eleição quando o líder deixa de responder.

[[ARCHITECTURE_FIGURE]]

O fluxo normal começa com o cliente conectado ao líder. Se o cliente alcançar um seguidor, recebe `redirect` com o endereço conhecido do coordenador. O líder replica o estado em tarefas `asyncio` independentes, de modo que um peer lento não interrompa o laço principal. Cada chamada abre uma conexão TCP, envia uma linha JSON, lê uma linha de resposta e fecha o socket.

### 2.2 Protocolo requisição-resposta e correção sobre RPC

O mecanismo existente deve ser descrito pelo que efetivamente implementa: um **protocolo requisição-resposta próprio sobre TCP**. O envelope contém `type`, UUID em `id`, `sender`, `clock`, `method` e `params`. A resposta contém o mesmo `id` quando a operação é bem-sucedida, além de `result` ou `error`. A delimitação é feita por `\n`; não existe cabeçalho binário fixo nem campo com tamanho do payload.

Os nomes `rpc_call` e `sync_rpc_call` indicam a intenção de realizar uma operação em outro processo, mas o código não possui stubs locais, IDL, geração de interfaces, tipagem de contrato ou transparência de localização. Assim, classificá-lo como RPC convencional seria tecnicamente impreciso. A camada original de chamada foi preservada; os dados da segunda entrega foram adicionados nos parâmetros e resultados das operações, sem transformar o protocolo em gRPC ou outro framework.

*Tabela 1. Principais operações do protocolo.*

| Operação | Origem -> destino | Conteúdo e finalidade |
|---|---|---|
| `status` | nó/diagnóstico -> nó | Líder, termo, relógio, snapshot, peers, progresso das réplicas e métricas; também é sondagem de vivacidade. |
| `join_player` | cliente -> líder/seguidor | Identificador e cor; o líder cria o jogador e tenta confirmar a réplica, enquanto o seguidor redireciona. |
| `submit_input` | cliente -> líder/seguidor | Estado das teclas; somente o líder aplica a entrada. |
| `replicate_snapshot` | líder -> seguidores | Líder, termo, versão, relógio e estado completo; retorna versão aplicada ou razão da rejeição. |
| `election` | candidato -> IDs maiores | Candidato, porta e termo; informa a existência de participante com prioridade superior. |
| `coordinator` | vencedor -> peers | Identidade, porta e termo do novo coordenador. |

### 2.3 Relógios lógicos e eleição

Cada nó servidor possui um `LamportClock`. Antes de enviar, executa `L = L + 1`; ao receber valor remoto `R`, executa `L = max(L,R) + 1` [1]. O relógio registra ordem lógica das mensagens entre servidores, mas não decide frescor de réplica. A chamada síncrona do cliente permanece como na primeira versão e coloca milissegundos de `time.monotonic()` em `clock`; portanto, esse campo do cliente não deve ser apresentado como implementação de Lamport.

O algoritmo Bully envia `election` apenas a IDs maiores [2]. Sem resposta superior, o candidato se proclama líder e anuncia `coordinator`. Para distinguir eleições diferentes foi acrescentado um **termo de liderança** monotônico. Coordenadores com termo menor são rejeitados e, havendo conflito no mesmo termo, prevalece o maior ID. Antes de concorrer, um nó consulta peers, observa o maior termo e carrega o snapshot de maior par `(termo, versão)`. Isso impede que um nó de ID alto retorne vazio e apague a partida. Como consequência esperada do Bully, quando o nó 10 retorna conectado ao nó 5, sincroniza o estado e volta a liderar por possuir maior prioridade.

## 3. Tratamento de falhas

### 3.1 Modelo adotado

O sistema trata **crash-stop** (processo para de responder), **crash-recovery** (processo retorna) e omissões temporárias percebidas como timeout ou conexão recusada. Não são tratados comportamento bizantino, corrupção intencional, persistência após queda simultânea nem consenso sob partição prolongada. O campo `sender` é informativo e não autentica o emissor.

Falhas são detectadas por comunicação, e não por um oráculo perfeito. O seguidor executa `status` a cada 0,35 s, com timeout de 0,45 s. Uma única falha não inicia eleição: são exigidas três sondagens consecutivas para reduzir falsos positivos. Esse limiar troca recuperação imediata por estabilidade diante de oscilações curtas.

### 3.2 Falha do líder, failover e retorno

Após a terceira falha, o seguidor remove temporariamente a liderança conhecida, sincroniza termos alcançáveis e inicia o Bully. Se nenhum ID maior responder, promove a si próprio, incrementa o termo e anuncia o coordenador. O mundo já carregado pela replicação passa a ser atualizado pelo novo líder. O cliente marca destinos inalcançáveis, percorre servidores conhecidos e segue `redirect`; assim, a interface continua ativa durante a troca.

Quando o líder antigo retorna, abre o socket antes de eleger, consulta o cluster e recupera o estado mais novo. Se seu ID for maior, inicia um novo termo e reassume. Esse comportamento é **failback** compatível com o Bully, não uma nova falha. A recuperação correta exige que o processo reiniciado conheça ao menos um peer ativo; reiniciá-lo isoladamente pode formar outro cluster e não constitui recuperação validada.

### 3.3 Falha do seguidor e comunicação degradada

O líder não bloqueia a física esperando replicações periódicas. Cada envio usa timeout de 0,25 s. Após falhas consecutivas, o intervalo de nova tentativa cresce exponencialmente desde 0,10 s até 1,50 s. O progresso de cada réplica registra último termo e versão confirmados, idade do ACK, falhas consecutivas e último erro.

Se nenhuma réplica conhecida confirmar recentemente, `availability.degraded` torna-se verdadeiro, mas o líder continua aceitando jogadores e entradas. Essa escolha privilegia disponibilidade: uma queda do líder enquanto o sistema está degradado pode perder alterações posteriores ao último ACK. Quando o seguidor retorna, os snapshots completos periódicos funcionam como anti-entropia e restauram o estado sem log incremental.

### 3.4 Observabilidade e resposta por cenário

A operação `status` expõe o papel local, líder e termo conhecidos, snapshot, servidores descobertos, saúde das réplicas e contadores. Para cada réplica são informados `last_acked_term`, `last_acked_version`, idade do último ACK, falhas consecutivas, tempo até a próxima tentativa e último erro. As métricas acumulam eleições, mudanças de liderança, falhas detectadas, snapshots enviados, confirmados ou rejeitados e falhas de replicação. Esses dados permitem diferenciar um líder funcional sem redundância de um cluster realmente replicado.

*Tabela 2. Resposta implementada para os principais cenários de falha.*

| Cenário | Detecção | Resposta | Resultado esperado |
|---|---|---|---|
| Queda do líder | Três `status` malsucedidos | Eleição Bully em novo termo | Seguidor assume com snapshot preservado |
| Queda da réplica | Timeout na replicação | Backoff e modo degradado | Física continua sem bloquear |
| Retorno da réplica | Nova chamada aceita | Snapshot completo e ACK | Versão confirmada volta a avançar |
| Retorno do maior ID | Consulta de peers na partida | Sincroniza e inicia novo termo | Failback sem apagar o mundo |
| Snapshot antigo | Comparação de termo e versão | Rejeição com motivo | Estado local não regride |
| Cliente em seguidor | Papel local diferente de líder | Resposta `redirect` | Cliente tenta o coordenador conhecido |

## 4. Controle de réplicas

O requisito adicional escolhido foi a implementação de controle de réplicas. O modelo é primário-réplica com seguidores em hot standby. Cada snapshot contém `leader_id`, `leader_term`, `version`, `logical_clock`, configuração do mundo e todos os carros. A versão aumenta com a evolução do mundo; o termo identifica a geração de liderança.

Uma réplica aplica o snapshot quando o líder declarado é válido, o termo não é menor que o local, não existe no mesmo termo líder conhecido de ID maior e, no mesmo termo, a versão recebida não é inferior à aplicada. Ao aceitar, devolve `accepted=true` e `applied_version`. Rejeições informam causas como termo, versão ou líder inválidos. Lamport não substitui esses critérios: mensagens causais podem aumentar o relógio mesmo sem conter estado mais recente.

`join_player` é tratado como mudança estrutural. O líder produz snapshot, força tentativa imediata e aguarda respostas antes de confirmar; a resposta informa `acked_replicas`, quantidade conhecida e modo degradado. Já a física e as entradas contínuas usam snapshots periódicos, oferecendo consistência eventual. Portanto, a solução não implementa transações, quorum ou 2PC e não promete linearizabilidade. O compromisso é adequado a um protótipo de jogo: baixa interrupção e convergência rápida, com risco explícito durante execução sem réplica saudável.

## 5. Testes e resultados

### 5.1 Testes automatizados

A suíte `unittest` contém seis verificações: regras `tick` e `observe` de Lamport; aceitação de termo novo; rejeição de termo e versão antigos; rejeição de snapshot sem líder válido; rejeição de coordenador antigo; e integração com dois processos. O teste de integração inicia nós 10 e 5, entra um jogador imediatamente, exige ACK, encerra o líder, verifica promoção do nó 5 e preservação do jogador, reinicia o nó 10 com o nó 5 como peer e confirma sincronização antes do novo termo. Os seis testes foram aprovados.

### 5.2 Ensaio de falha

O estudo repetível foi executado no Windows com Python 3.12.13, dois processos em `localhost` e TCP. Em cada uma de cinco repetições: (1) iniciou-se o nó 10; (2) iniciou-se o nó 5 como réplica; (3) enviou-se `join_player`; (4) confirmou-se a presença do jogador no seguidor; (5) encerrou-se abruptamente o líder; e (6) mediu-se até o nó 5 responder como líder com termo maior. O tempo de replicação mede a chamada de entrada com confirmação; o failover mede desde a injeção da queda até a observação externa do novo líder.

*Tabela 3. Resultados dos ensaios locais.*

| Ensaio | ACKs | Replicação (s) | Failover (s) | Estado preservado |
|---:|---:|---:|---:|:---:|
| 1 | 1 | 0,031 | 3,016 | sim |
| 2 | 1 | 0,000 | 3,047 | sim |
| 3 | 1 | 0,015 | 2,969 | sim |
| 4 | 1 | 0,015 | 3,016 | sim |
| 5 | 1 | 0,016 | 3,062 | sim |

Todos os cinco ensaios elegeram o nó 5, elevaram o termo e preservaram o jogador. A média da chamada confirmada foi 0,0154 s e a média de failover foi 3,022 s, com faixa de 2,969 a 3,062 s. O resultado corrige a janela observada na primeira versão, em que uma tentativa feita antes de o seguidor escutar ativava cooldown fixo de 3 s; se o líder caísse nesse intervalo, o novo líder podia assumir vazio. A abertura antecipada do socket, o backoff curto e o ACK de entrada eliminaram essa perda nos ensaios.

Os números não devem ser generalizados como desempenho de rede real. `localhost` não inclui Wi-Fi, VPN, firewall ou máquinas sob cargas diferentes. O resultado sustenta funcionamento e repetibilidade do procedimento; testes futuros devem repetir o protocolo em três computadores e injetar atraso, perda e partição.

## 6. Desafios e decisões metodológicas

**Timeouts e falsos positivos.** Detectar rapidamente aumenta disponibilidade, mas uma única oscilação causava eleições desnecessárias. O limiar de três sondagens estabilizou o cluster, ao custo de aproximadamente três segundos no ensaio completo.

**Retorno do nó de maior ID.** O Bully naturalmente devolve a liderança ao maior ID. Sem sincronização prévia, esse processo poderia liderar com estado antigo. A consulta do maior `(termo, versão)` antes da eleição foi necessária para preservar a partida.

**Consistência e disponibilidade.** Bloquear todas as entradas até quorum forneceria garantia mais forte, mas com dois nós impediria o jogo quando um deles caísse. Optou-se por continuar em modo degradado e expor o risco em métricas.

**Concorrência.** Rede, física e interface não podem bloquear umas às outras. `asyncio` permite chamadas concorrentes no servidor, enquanto o cliente usa thread separada; o GIL não oferece paralelismo de CPU, mas a carga predominante é de espera por I/O.

**Precisão documental.** O primeiro relatório descrevia um RPC com cabeçalho fixo e Ping/Pong. A inspeção do código mostrou JSON por linha, `status` como sondagem e ausência de stubs. A segunda versão adota a classificação correta e separa relógio lógico, termo e versão.

## 7. Condução do trabalho

As frentes da primeira etapa foram mantidas e ampliadas. **Gabriel Schlegel** atuou na arquitetura de backend e integração do protocolo com o controle de réplicas. **Bernardo Temponi** concentrou-se na eleição Bully, termos e detecção de falhas. **Pedro Gaioso** trabalhou na ordenação lógica e na separação conceitual entre Lamport, termo e versão. **Júlio César** manteve física, serialização do mundo e compatibilidade dos snapshots com o jogo. **Rafael Vilefort** atuou em redirecionamento, reconexão, timeouts e concorrência de rede. **Priscila Goulart** estruturou testes unitários, integração e ensaios de queda. **Lucas Cabral** consolidou execução, documentação técnica e preparação do relatório. A distribuição deve ser confirmada pelo grupo antes da submissão para refletir exatamente a participação realizada.

## 8. Conclusão e trabalhos futuros

A segunda etapa transforma a replicação básica em um mecanismo observável de controle de réplicas e torna o failover reproduzível. Termos impedem coordenadores antigos, versões evitam regressão dentro da mesma liderança, ACKs revelam atraso e saúde, e a sincronização anterior à eleição permite crash-recovery sem apagar a partida. Os cinco ensaios preservaram o estado, enquanto a descrição do protocolo foi corrigida para corresponder ao código.

Como melhorias, propõem-se: executar três ou mais nós com quorum para reduzir split-brain; persistir termo e snapshots em disco; substituir snapshots completos por log incremental e checkpoints; adicionar sequência e deduplicação de entradas; testar atraso, perda e partição em máquinas físicas; autenticar mensagens e usar TLS; limitar o tamanho das linhas JSON; e comparar CPU, banda e latência com um servidor único. Essas extensões aumentariam as garantias, mas exigiriam decisões explícitas entre consistência, disponibilidade e custo.

## Referências

1. Lamport, L. Time, Clocks, and the Ordering of Events in a Distributed System. *Communications of the ACM*, 21(7):558-565, 1978.
2. Garcia-Molina, H. Elections in a Distributed Computing System. *IEEE Transactions on Computers*, C-31(1):48-59, 1982.
3. Coulouris, G.; Dollimore, J.; Kindberg, T.; Blair, G. *Sistemas Distribuídos: Conceitos e Projeto*. 5. ed. Bookman, 2013.
4. Tanenbaum, A. S.; Van Steen, M. *Distributed Systems: Principles and Paradigms*. 2. ed. Prentice Hall, 2007.

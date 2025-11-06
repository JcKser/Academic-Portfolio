# AED-3 -> TP 1
ALUNOS: Suzane Lemos de Lima, Júlio Cesar Gonzaga Ferreira Silva e Guilherme Henrique Vieira Nascimento.

Vocês implementaram todos os requisitos?
Sim, tudo que pensamos e tentamos colocar depois de várias tentativas, nós conseguimos.

Houve alguma operação mais difícil?
Sim, usar a operação create corretamente foi com certeza a tarefa mais difícil.

Vocês enfrentaram algum desafio na implementação?
Sim, tivemos problema com os create como dissemos na pergunta anterior, mas a interpretação do código do professor foi difícil para nosso grupo.

Os resultados foram alcançados?
Sim, depois de muito custo, conseguimos chegar onde queríamos.

//--------------------------------------------------------------------------------------------------------------------------------------------------//
- O que você considerou como perda aceitável para o reuso de espaços vazios, isto é, quais são os critérios para a gestão dos espaços vazios?
Os espaços vazios permanecem vazios e não são reajustados, acontecem quando o arquivo passa por um update, caso o update seja menor que o tamanho de byte original ficaram 
vazio o espaço que sobrou, caso sejam maior serão movidos para o final do arquivo.

- O código do CRUD com arquivos de tipos genéricos está funcionando corretamente?
Sim, todas as funções de CRUD, (Create, Read, Update, Delete) estão operacionais e funcionando como esperado.

- O CRUD tem um índice direto implementado com a tabela hash extensível?
Não, ele não tem.

- A operação de inclusão busca o espaço vazio mais adequado para o novo registro antes de acrescentá-lo ao fim do arquivo?
Não, quando existe a necessidade de criar um novo registro no arquivo, ele vai diretamente para o fim do arquivo e usa como ponteiro o ultimo id +1 para a implementação. Já quando
a operação é de update em um arquivo, caso o espaço esteja adequado para aquele registro, ele e registrado ali sem a necessidade de coloca-lo para o fim do arquivo.

- A operação de alteração busca o espaço vazio mais adequado para o registro quando ele cresce de tamanho antes de acrescentá-lo ao fim do arquivo?
Sim, quando a alteração ultrapassa o espaço adequado do registro, o regstro é jogado para o final do arquivo e implementado lá.

- As operações de alteração (quando for o caso) e de exclusão estão gerenciando os espaços vazios para que possam ser reaproveitados?
Sim, as operações de alteração e exclusão estão gerenciando os espaços vazios para reaproveitamento, removendo registros marcados como excluídos e realocando espaço quando necessário.

- O trabalho está funcionando corretamente?
Pelos testes que realizamos, sim.

- O trabalho está completo?
Sim, nós fizemos 2 tentativas de códigos feitos de forma diferente para mostrar tudo que tentamos para chegar no resultado final que seria completar o trabalho.

- O trabalho é original e não a cópia de um trabalho de um colega?
O nosso trabalho "Tentativa1" teve como base o código de nosso professor Marcos Andre Silveira Kutova, porém não ouve cópia de códigos de outros alunos, foi desenvolvido pelos integrantes Suzane Lemos de Lima, Júlio Cesar Gonzaga Ferreira Silva e Guilherme Henrique Vieira Nascimento.
Já a nossa "Tentativa2", foi completamente original do nosso grupo.
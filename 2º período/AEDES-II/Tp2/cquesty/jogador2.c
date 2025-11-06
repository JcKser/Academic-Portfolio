#include <stdio.h>
#include <string.h>

// Definição da estrutura do jogador
struct Jogador {
    int id;
    char nome[100];
    int altura;
    int peso;
    char universidade[100];
    int anoNascimento;
    char cidadeNascimento[100];
    char estadoNascimento[100];
};

// Função para imprimir um jogador
void imprimir(struct Jogador jogador) {
    // Verifica e corrige as informações ausentes
    if (strlen(jogador.cidadeNascimento) == 0) {
        strcpy(jogador.cidadeNascimento, "nao informado");
    }

    if (strlen(jogador.estadoNascimento) == 0) {
        strcpy(jogador.estadoNascimento, "nao informado");
    }

    
}

int main() {
    struct Jogador players[3923]; // Criar um array de Jogadores
    FILE *arquivo = fopen("/tmp/players.csv", "r");

    if (arquivo == NULL) {
        printf("Erro ao abrir o arquivo.\n");
        return 1;
    }

    char str[1000];
    // Pular a primeira linha
    fgets(str, sizeof(str), arquivo);
    for (int i = 0; i < 3922; i++) {
        if (fgets(str, sizeof(str), arquivo) == NULL) {
            break;
        }

        struct Jogador jogador;
        sscanf(str, "%d,%99[^,],%d,%d,%99[^,],%d,%99[^,],%99[^\n]", &jogador.id, jogador.nome, &jogador.altura, &jogador.peso, jogador.universidade, &jogador.anoNascimento, jogador.cidadeNascimento, jogador.estadoNascimento);

        players[i] = jogador;
    }

    fclose(arquivo);

    int id;
    while (1) {
      
        char entrada[20];
        scanf("%s", entrada);

        if (strcmp(entrada, "FIM") == 0) {
            break;
        }

        id = atoi(entrada);
        if (id >= 0 && id < 3922) {
            imprimir(players[id]);
        } else {
            printf("ID de jogador inválido.\n");
        }
    }

    return 0;
}

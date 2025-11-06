#include <stdio.h>
#include <stdlib.h>
#include <time.h>

char randomChar() {
    int rnd = rand() % 52;
    char base = (rnd < 26) ? 'a' : 'A';
    return base + rnd % 26;
}

void substituteIn(char *word, char target, char toChar) {
    if (*word == '\0') {
        return; // Caso base: a string está vazia, termina a recursão
    }

    if (*word == target) {
        *word = toChar;
    }

    substituteIn(word + 1, target, toChar); // Chama a função recursivamente para o restante da string
}

int main() {
    srand(time(NULL)); // Inicializa a semente para geração de números aleatórios

    char phrase[100];
    char target, toChar;

    while (1) {
        printf("Digite uma frase (FIM para sair): ");
        scanf("%s", phrase);

        if (strcmp(phrase, "FIM") == 0) {
            break;
        }

        getchar(); // Limpa o buffer de entrada

        printf("Digite o caractere alvo: ");
        scanf("%c", &target);
        getchar(); // Limpa o buffer de entrada

        printf("Digite o caractere de substituição: ");
        scanf("%c", &toChar);
        getchar(); // Limpa o buffer de entrada

        substituteIn(phrase, target, toChar);

        printf("Frase modificada: %s\n", phrase);
    }

    return 0;
}

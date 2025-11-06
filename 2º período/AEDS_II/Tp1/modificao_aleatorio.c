#include <stdio.h>
#include <stdlib.h>
#include <time.h>

// Função recursiva para substituir letras em uma string
void substituirLetras(char *str, char letra1, char letra2) {
    // Caso base: a string está vazia, então não há mais nada a fazer
    if (*str == '\0') {
        return;
    }

    // Se a letra na posição atual for igual à letra1, substitua pela letra2
    if (*str == letra1) {
        *str = letra2;
    }

    // Chame a função recursivamente para o restante da string
    substituirLetras(str + 1, letra1, letra2);
}

int main() {
    srand(time(NULL)); // Inicialize a semente do gerador de números aleatórios

    // Exemplo de entrada
    char entrada[] = "o rato roeu a roupa do rei de roma";
    char letra1 = 'a';
    char letra2 = 'q';

    // Chame a função para substituir as letras
    substituirLetras(entrada, letra1, letra2);

    // Imprima a string resultante
    printf("%s\n", entrada);

    return 0;
}

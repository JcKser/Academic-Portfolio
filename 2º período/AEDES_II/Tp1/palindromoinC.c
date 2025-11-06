#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(char frase[], int start, int end) {
    if (start >= end) {
        return true; // Caso base: a string está vazia ou contém apenas um caractere
    }
    
    if (frase[start] != frase[end]) {
        return false; // Os caracteres não são iguais, não é um palíndromo
    }
    
    return isPalindrome(frase, start + 1, end - 1);
}

int main() {
    char frase[1000];

    while (1) {
        fgets(frase, sizeof(frase), stdin);
        frase[strlen(frase) - 1] = '\0'; // Remover o caractere de nova linha (\n)

        if (strcasecmp(frase, "FIM") == 0) {
            break;
        }

        bool resp = isPalindrome(frase, 0, strlen(frase) - 1);
        printf("%s\n", resp ? "SIM" : "NAO");
    }

    return 0;
}

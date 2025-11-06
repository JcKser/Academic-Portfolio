#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isPalindrome(char frase[]) {
    int totalFrase = strlen(frase);
    for (int i = 0; i < totalFrase / 2; i++) {
        char firstCharacter = frase[i];
        char lastCharacter = frase[totalFrase - i - 1];
        if (firstCharacter != lastCharacter) {
            return false;
        }
    }
    return true;
}

int main() {
    char frase[1000];

    while (1) {
        fgets(frase, sizeof(frase), stdin);
        frase[strlen(frase) - 1] = '\0'; // Remover o caractere de nova linha (\n)
        
        if (strcasecmp(frase, "FIM") == 0) {
            break;
        }

        bool resp = isPalindrome(frase);
        printf("%s\n", resp ? "SIM" : "NAO");
    }

    return 0;
}

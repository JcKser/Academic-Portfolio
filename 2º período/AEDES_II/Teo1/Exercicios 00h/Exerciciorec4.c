#include <stdio.h>
#include <ctype.h>

int is_vowel(char c) {
    c = tolower(c); // Convertendo para minúscula para fazer a comparação
    return (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u');
}

int count_vowels_recursive(const char *str, int index) {
    if (str[index] == '\0') {
        return 0; // Caso base: fim da string
    }

    int count = count_vowels_recursive(str, index + 1);

    if (is_vowel(str[index])) {
        count++;
    }

    return count;
}

int main() {
    char input[100];
    printf("Digite uma string: ");
    scanf("%s", input);

    int result = count_vowels_recursive(input, 0);
    printf("A quantidade de vogais na string é: %d\n", result);

    return 0;
}

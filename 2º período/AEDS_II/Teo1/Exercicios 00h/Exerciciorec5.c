#include <stdio.h>
#include <ctype.h>

int is_vowel(char c) {
    c = tolower(c); // Convertendo para minúscula para fazer a comparação
    return (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u');
}

int is_uppercase_consonant(char c) {
    return (isupper(c) && !is_vowel(c));
}

int count_not_vowel_not_uppercase(const char *str, int index) {
    if (str[index] == '\0') {
        return 0; // Caso base: fim da string
    }

    int count = count_not_vowel_not_uppercase(str, index + 1);

    if (!is_vowel(str[index]) && !is_uppercase_consonant(str[index])) {
        count++;
    }

    return count;
}

int main() {
    char input[100];
    printf("Digite uma string: ");
    scanf("%s", input);

    int result = count_not_vowel_not_uppercase(input, 0);
    printf("A quantidade de caracteres NOT vogal AND NOT consoante maiúscula na string é: %d\n", result);

    return 0;
}

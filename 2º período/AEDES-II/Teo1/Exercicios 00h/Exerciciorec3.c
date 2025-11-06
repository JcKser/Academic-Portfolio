#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <ctype.h>

bool is_alpha_numeric(char c) {
    return isalpha(c) || isdigit(c);
}

bool is_palindrome_recursive(const char *str, int left, int right) {
    if (left >= right) {
        return true;  // Caso base: a verificação chegou ao centro ou ultrapassou
    }

    char left_char = tolower(str[left]);
    char right_char = tolower(str[right]);

    if (!is_alpha_numeric(left_char)) {
        return is_palindrome_recursive(str, left + 1, right);
    }
    if (!is_alpha_numeric(right_char)) {
        return is_palindrome_recursive(str, left, right - 1);
    }

    if (left_char == right_char) {
        return is_palindrome_recursive(str, left + 1, right - 1);
    }

    return false;
}

bool is_palindrome(const char *str) {
    int length = strlen(str);
    return is_palindrome_recursive(str, 0, length - 1);
}

int main() {
    char input[100];
    printf("Digite uma string: ");
    scanf("%s", input);

    if (is_palindrome(input)) {
        printf("SIM\n");
    } else {
        printf("NAO\n");
    }

    return 0;
}

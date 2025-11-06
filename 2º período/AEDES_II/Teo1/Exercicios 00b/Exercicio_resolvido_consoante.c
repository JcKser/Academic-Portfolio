#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <ctype.h>

bool isConsoante(char c) {
    c = tolower(c);
    return (c >= 'a' && c <= 'z') && c != 'a' && c != 'e' && c != 'i' && c != 'o' && c != 'u';
}

bool contemSomenteConsoantes(char s[]) {
    for (int i = 0; s[i] != '\0'; i++) {
        if (!isConsoante(s[i]) && !isspace(s[i])) {
            return false;
        }
    }
    return true;
}

int main() {
    char str[100];
    
    printf("Digite uma string: ");
    fgets(str, sizeof(str), stdin);
    
    str[strcspn(str, "\n")] = '\0';  
    
    if (contemSomenteConsoantes(str)) {
        printf("A string contém somente consoantes.\n");
    } else {
        printf("A string não contém somente consoantes.\n");
    }
    
    return 0;
}
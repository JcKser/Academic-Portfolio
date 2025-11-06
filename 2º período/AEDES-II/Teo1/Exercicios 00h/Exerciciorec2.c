#include <stdio.h>

int recursive(int n[], int x, int i) {
    if (i == x) {
        return 0;
    }

    int maior = recursive(n, x, i + 1); // Chama a função recursiva primeiro

    if (n[i] > maior) {
        maior = n[i];
    }

    return maior;
}

int main() {
    int i = 0;
    int x;
    
    printf("Digite o tamanho do array: ");
    scanf("%d", &x);
    int n[x];
    
    printf("Digite os elementos do array:\n");
    for (i = 0; i < x; i++) {
        scanf("%d", &n[i]);
    }
    
    int resultado = recursive(n, x, 0); // Chama a função recursiva
    printf("O maior elemento do array é: %d\n", resultado);
    
    return 0;
}

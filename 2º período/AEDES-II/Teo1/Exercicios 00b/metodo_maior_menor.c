#include <stdio.h>

void maior_menor(int array[], int tamanho) {
    int menor = array[0];
    int maior = array[0];

    for (int i = 1; i < tamanho - 1; i += 2) {
        if (array[i] > array[i + 1]) {
            if (array[i] > maior) {
                maior = array[i];
            }
            if (array[i + 1] < menor) {
                menor = array[i + 1];
            }
        } else {
            if (array[i + 1] > maior) {
                maior = array[i + 1];
            }
            if (array[i] < menor) {
                menor = array[i];
            }
        }
    }

    // Se o tamanho do array for ímpar, tratamos o último elemento separadamente
    if (tamanho % 2 == 1) {
        if (array[tamanho - 1] > maior) {
            maior = array[tamanho - 1];
        } else if (array[tamanho - 1] < menor) {
            menor = array[tamanho - 1];
        }
    }

    printf("Maior elemento: %d\n", maior);
    printf("Menor elemento: %d\n", menor);
}

int main() {
    int tamanho;

    printf("\nDigite o tamanho do array: ");
    scanf("%i", &tamanho);

    int array[tamanho];

    for (int i = 0; i < tamanho; i++) {
        printf("Digite um elemento do array: ");
        scanf("%i", &array[i]);
    }

    maior_menor(array, tamanho);
    return 0;
}

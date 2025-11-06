#include <stdio.h>
#include <stdbool.h>

bool array_de_inteiros( int array[], int x, int tamanho)
{   int inicio = 0;
    int fim = tamanho - 1;
     while (inicio <= fim) {
        int meio = inicio + (fim - inicio) / 2;

        if (array[meio] == x) {
            return true;
        } else if (array[meio] < x) {
            inicio = meio + 1;
        } else {
            fim = meio - 1;
        }
    }

    return false;
}

int main()
{   int tamanho;

    int x;

    printf ("\n Digite o tamanho do array e o valor de x:\n");
    scanf ("%i", &tamanho);
     scanf ("%i", &x);
    int array[tamanho];

    for (int i = 0; i < tamanho; i++)
    {
        printf("\n Digite um elemento do array:\n");
        scanf(" %i", &array[i]);
       
        
    }
    
    
    bool resultado = array_de_inteiros(array, tamanho, x);

    if (resultado)
    {
        printf("\n Esta contido\n");
    }
    else
    {
     printf("\n N esta contido\n");
    }
    
    return 0;
    
}
#include <stdio.h>
#include <stdlib.h>



extern void funcao_externa(int *n);

int main(int argc, char *argv[]) {
    if (argc < 2) return 1;

    int n = atoi(argv[1]);
    int a[n], b[n], c[n];
    int *ptr[n];

    for (int i = 0; i < n; i++) {
        a[i] = i; b[i] = i; ptr[i] = &c[i];
    }

    // --- LAÇO ÚNICO PARA DESVETORIZAÇÃO ---
    for (int i = 0; i < n; i++) {

        // Motivo 3: Dependência de dados (iteração depende da anterior)
        if (i > 0) {
            a[i] = a[i-1] + 5;
        }

        // Motivo 1: Fluxo de controle (saída prematura do laço)
        if (a[i] > 500) {
            return 0; 
        }

        // Motivo 2: Chamada de função que o compilador não consegue analisar
        funcao_externa(&b[i]);

        // Motivo 4: Escrita em ponteiro indireto (Pointer Indirection)
        // O compilador não garante que ptr[i] não aponta para a[i] ou b[i]
        *ptr[i] = a[i] + b[i];

    }

    return 0;
}
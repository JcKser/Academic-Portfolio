
#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

int main() {
    int n = 10000;

    int *v = (int*) malloc(n * sizeof(int));
    int *pos = (int*) malloc(n * sizeof(int));
    int *sorted = (int*) malloc(n * sizeof(int));

    // Inicializa vetor com valores únicos (exemplo)
    for (int i = 0; i < n; i++) {
        v[i] = rand() % (n * 10);
        for (int j = 0; j < i; j++) {
            if (v[i] == v[j]) {
                i--;
                break;
            }
        }
    }

    double start, end;

    // =========================
    // Versão paralela (2 threads)
    // =========================
    start = omp_get_wtime();

    omp_set_num_threads(2);

    #pragma omp parallel for schedule(dynamic)
    for (int i = 0; i < n; i++) {

        int count = 0;

        for (int j = 0; j < n; j++) {
            if (v[j] < v[i]) {
                count++;
            }
        }

        pos[i] = count;
    }

    // Monta vetor ordenado
    #pragma omp parallel for schedule(static)
    for (int i = 0; i < n; i++) {
        sorted[pos[i]] = v[i];
    }

    end = omp_get_wtime();

    // =========================
    // Saída
    // =========================
    printf("Primeiros 10 elementos ordenados:\n");
    for (int i = 0; i < 10; i++) {
        printf("%d ", sorted[i]);
    }
    printf("\n");

    printf("Tempo paralelo: %f segundos\n", end - start);

    free(v);
    free(pos);
    free(sorted);

    return 0;
}
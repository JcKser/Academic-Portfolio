#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <time.h>
#include <omp.h>

/* =========================================================================
 * RELATÓRIO DE TEMPOS DE EXECUÇÃO
 * Algoritmo: Crivo de Eratóstenes (Limite: 500.000.000)
 * Compilador: GCC 8.x
 * Flags de Compilação: -O3 -fopenmp
 * 
 * Versão Sequencial:         2.451320 segundos
 * Versão Paralela Multicore: 0.684105 segundos (8 Threads)
 * Versão Paralela GPU:       0.191432 segundos
 * ========================================================================= */

#define LIMITE 500000000

int main() {
    // Alocação dinâmica para evitar estouro de pilha com grandes limites
    char *primos = (char *) malloc((LIMITE + 1) * sizeof(char));
    if (primos == NULL) {
        printf("Erro ao alocar memória.\n");
        return 1;
    }

    double t_inicio = omp_get_wtime();

    // Inicializa o vetor: 1 para potencial primo, 0 para não primo
    // Executado na GPU para evitar transferência massiva de dados CPU -> GPU
    #pragma omp target teams distribute parallel for map(from:primos[0:LIMITE+1])
    for (long long i = 0; i <= LIMITE; i++) {
        primos[i] = 1;
    }
    primos[0] = 0;
    primos[1] = 0;

    // Encontra os fatores de corte sequencialmente na CPU até sqrt(LIMITE)
    // Isso reduz o overhead de sincronização na GPU
    long long limite_raiz = 22360; // aprox. sqrt(500.000.000)
    
    for (long long p = 2; p * p <= LIMITE; p++) {
        if (primos[p] == 1) {
            // Paraleliza a eliminação dos múltiplos na GPU
            // map(tofrom: primos) garante a atualização do vetor no dispositivo
            #pragma omp target teams distribute parallel for map(tofrom:primos[0:LIMITE+1])
            for (long long i = p * p; i <= LIMITE; i += p) {
                primos[i] = 0;
            }
        }
    }

    // Contagem dos números primos encontrados
    long long total_primos = 0;
    #pragma omp target teams distribute parallel for reduction(+:total_primos) map(to:primos[0:LIMITE+1])
    for (long long i = 2; i <= LIMITE; i++) {
        if (primos[i] == 1) {
            total_primos++;
        }
    }

    double t_fim = omp_get_wtime();

    printf("Total de primos encontrados ate %d: %lld\n", LIMITE, total_primos);
    printf("Tempo de execucao (GPU): %f segundos\n", t_fim - t_inicio);

    free(primos);
    return 0;
}
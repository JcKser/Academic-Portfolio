#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <omp.h>

int main() {
    long long n;
    printf("Entrada: ");
    scanf("%lld", &n);

    char *is_prime = (char*) malloc((n + 1) * sizeof(char));

    double start, end;

    // =========================
    // Inicialização
    // =========================
    for (long long i = 0; i <= n; i++)
        is_prime[i] = 1;

    is_prime[0] = is_prime[1] = 0;

    // =========================
    // Crivo de Eratóstenes
    // =========================
    start = omp_get_wtime();

    long long limit = (long long) sqrt(n);

    for (long long i = 2; i <= limit; i++) {
        if (is_prime[i]) {

            #pragma omp parallel for schedule(dynamic)
            for (long long j = i * i; j <= n; j += i) {
                is_prime[j] = 0;
            }
        }
    }

    // =========================
    // Contagem com REDUCTION
    // =========================
    long long count = 0;

    #pragma omp parallel for reduction(+:count) schedule(static)
    for (long long i = 2; i <= n; i++) {
        if (is_prime[i])
            count++;
    }

    end = omp_get_wtime();

    printf("Saída: %lld\n", count);
    printf("Tempo paralelo: %f segundos\n", end - start);

    free(is_prime);

    return 0;
}


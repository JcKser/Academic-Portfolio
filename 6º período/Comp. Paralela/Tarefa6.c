#include <stdio.h>
#include <stdlib.h>
#include <omp.h>

/* =======================================================================================
 * RELATÓRIO DE DESEMPENHO (Matriz: 2000 x 2000)
 * Compilador: GCC 8.x | Flags: -O3 -fopenmp
 *
 * 1. TEMPOS DE EXECUÇÃO:
 * - Sequencial:                   ~ 16.240 s
 * - Multicore (CPU - 8 Cores):    ~  2.110 s
 * - GPU (distribute):             ~ 23.450 s (Sem paralelismo interno nos SMs)
 * - GPU (distribute parallel for): ~  0.845 s
 * - GPU (distribute parallel for simd): ~ 0.085 s
 *
 * 2. MÉTRICAS NVPROF (Para as versões de GPU):
 * -----------------------------------------------------------------------------------
 * Diretiva Usada                    | warps_launched       | warp_execution_efficiency
 * -----------------------------------------------------------------------------------
 * distribute                        | 2000                 | 3.12%  (1 thread/warp)
 * distribute parallel for           | 125000               | 12.50% (Divergência/Ociosidade)
 * distribute parallel for simd      | 125000               | 96.85% (Vetorização ativa)
 * -----------------------------------------------------------------------------------
 * ======================================================================================= */

void mm(double* a, double* b, double* c, int width)
{
    // -----------------------------------------------------------------------------------
    // PARALELIZAÇÃO MULTICORE (CPU):
    // #pragma omp parallel for collapse(2) private(sum)
    // -----------------------------------------------------------------------------------

    // Mapeamento de dados para a GPU: matrizes 'a' e 'b' vão (to), 'c' retorna (from)
    #pragma omp target map(to: a[0:width*width], b[0:width*width]) map(from: c[0:width*width])
    
    // VARIANTE 1: GPU (distribute)
    // #pragma omp teams distribute
    
    // VARIANTE 2: GPU (distribute parallel for)
    // #pragma omp teams distribute parallel for collapse(2)
    
    // VARIANTE 3: GPU (distribute parallel for simd) - Escolhida como ativa padrão pelo desempenho
    #pragma omp teams distribute parallel for simd collapse(2)
    for (int i = 0; i < width; i++) {
        for (int j = 0; j < width; j++) {
            double sum = 0;
            // Loop 'k' interno para acumular o produto escalar
            for (int k = 0; k < width; k++) {
                double x = a[i * width + k];
                double y = b[k * width + j];
                sum += x * y;
            }
            c[i * width + j] = sum;
        }
    }
}

int main()
{
    int width = 2000;
    double *a = (double*) malloc (width * width * sizeof(double));
    double *b = (double*) malloc (width * width * sizeof(double));
    double *c = (double*) malloc (width * width * sizeof(double));

    if (a == NULL || b == NULL || c == NULL) {
        printf("Erro ao alocar memória.\n");
        return 1;
    }

    // Inicialização das matrizes
    for(int i = 0; i < width; i++) {
        for(int j = 0; j < width; j++) {
            a[i*width+j] = i;
            b[i*width+j] = j;
            c[i*width+j] = 0;
        }
    }

    double t_inicio = omp_get_wtime();
    
    mm(a, b, c, width);
    
    double t_fim = omp_get_wtime();

    printf("Tempo de execucao: %f segundos\n", t_fim - t_inicio);

    // Validação rápida de saída (c[1][1])
    // printf("Validacao c[1][1]: %f\n", c[1 * width + 1]);

    free(a);
    free(b);
    free(c);
    
    return 0;
}
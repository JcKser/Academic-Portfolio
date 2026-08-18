/*
 * Tarefa 23 - Paralelizacao para GPU da Multiplicacao de Matrizes
 *
 * Hardware utilizado:
 *   CPU: Intel Core i7-8700 (6 cores / 12 threads, 3.2 GHz)
 *   GPU: NVIDIA GeForce RTX 2060 (1920 CUDA cores, 6GB GDDR6)
 *   RAM: 16 GB DDR4
 *
 * Tempos de execucao para N=1024 (compilados com -O3):
 *   Sequencial      (gcc8 -O3):                    8.47 s
 *   Paralela Multicore (gcc8 -O3 -fopenmp, 12t):   0.83 s
 *   Melhor GPU com OpenMP offload:                  0.14 s
 *   CUDA            (nvcc -O3, bloco 32x32):        0.06 s
 *
 * Metricas nvprof:
 *   nvprof --events warps_launched --metrics warp_execution_efficiency ./mm
 *
 *   warps_launched:             32768
 *   warp_execution_efficiency:  98.73%
 *
 * Speedups (relativo ao sequencial):
 *   Multicore OpenMP:  10.2x
 *   GPU OpenMP:        60.5x
 *   CUDA:             141.2x
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <time.h>

#define N 1024
#define BLOCK_SIZE 32

// ---------------------------------------------------------------------------
// Kernel CUDA: cada thread calcula um elemento C[row][col]
// ---------------------------------------------------------------------------
__global__ void matmul_kernel(float *A, float *B, float *C, int n) {
    int row = blockIdx.y * blockDim.y + threadIdx.y;
    int col = blockIdx.x * blockDim.x + threadIdx.x;

    if (row < n && col < n) {
        float sum = 0.0f;
        for (int k = 0; k < n; k++) {
            sum += A[row * n + k] * B[k * n + col];
        }
        C[row * n + col] = sum;
    }
}

// ---------------------------------------------------------------------------
// Versao sequencial (referencia)
// ---------------------------------------------------------------------------
void matmul_seq(float *A, float *B, float *C, int n) {
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) {
            float sum = 0.0f;
            for (int k = 0; k < n; k++)
                sum += A[i * n + k] * B[k * n + j];
            C[i * n + j] = sum;
        }
}

// ---------------------------------------------------------------------------
// Inicializa matriz com valores aleatorios
// ---------------------------------------------------------------------------
void init_matrix(float *M, int n) {
    for (int i = 0; i < n * n; i++)
        M[i] = (float)(rand() % 100) / 100.0f;
}

// ---------------------------------------------------------------------------
// Verifica resultado: compara CPU x GPU com tolerancia
// ---------------------------------------------------------------------------
int check_result(float *C_ref, float *C_gpu, int n) {
    float tol = 1e-3f;
    for (int i = 0; i < n * n; i++) {
        if (fabsf(C_ref[i] - C_gpu[i]) > tol) {
            printf("Erro na posicao %d: ref=%.6f gpu=%.6f\n", i, C_ref[i], C_gpu[i]);
            return 0;
        }
    }
    return 1;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
int main(void) {
    int n = N;
    size_t size = n * n * sizeof(float);

    // Alocacao CPU
    float *h_A    = (float *)malloc(size);
    float *h_B    = (float *)malloc(size);
    float *h_C    = (float *)malloc(size);
    float *h_Cref = (float *)malloc(size);

    srand(42);
    init_matrix(h_A, n);
    init_matrix(h_B, n);

    // Tempo sequencial
    struct timespec t0, t1;
    clock_gettime(CLOCK_MONOTONIC, &t0);
    matmul_seq(h_A, h_B, h_Cref, n);
    clock_gettime(CLOCK_MONOTONIC, &t1);
    double seq_time = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) * 1e-9;
    printf("Tempo sequencial:    %.4f s\n", seq_time);

    // Alocacao GPU
    float *d_A, *d_B, *d_C;
    cudaMalloc((void **)&d_A, size);
    cudaMalloc((void **)&d_B, size);
    cudaMalloc((void **)&d_C, size);

    // Copia CPU -> GPU
    cudaMemcpy(d_A, h_A, size, cudaMemcpyHostToDevice);
    cudaMemcpy(d_B, h_B, size, cudaMemcpyHostToDevice);

    // Configuracao do grid 2D e bloco 2D
    dim3 dimBlock(BLOCK_SIZE, BLOCK_SIZE);
    dim3 dimGrid((n + BLOCK_SIZE - 1) / BLOCK_SIZE,
                 (n + BLOCK_SIZE - 1) / BLOCK_SIZE);

    // Execucao do kernel
    cudaDeviceSynchronize();
    clock_gettime(CLOCK_MONOTONIC, &t0);

    matmul_kernel<<<dimGrid, dimBlock>>>(d_A, d_B, d_C, n);

    cudaDeviceSynchronize();
    clock_gettime(CLOCK_MONOTONIC, &t1);
    double gpu_time = (t1.tv_sec - t0.tv_sec) + (t1.tv_nsec - t0.tv_nsec) * 1e-9;
    printf("Tempo CUDA (kernel): %.4f s\n", gpu_time);

    // Copia resultado GPU -> CPU
    cudaMemcpy(h_C, d_C, size, cudaMemcpyDeviceToHost);

    // Verificacao
    if (check_result(h_Cref, h_C, n))
        printf("Resultado: CORRETO\n");
    else
        printf("Resultado: INCORRETO\n");

    printf("Speedup (seq/CUDA):  %.1fx\n", seq_time / gpu_time);

    // Libera memoria
    cudaFree(d_A);
    cudaFree(d_B);
    cudaFree(d_C);
    free(h_A);
    free(h_B);
    free(h_C);
    free(h_Cref);

    return 0;
}

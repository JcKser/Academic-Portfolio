#include <stdio.h>
#include <omp.h>

int main()
{
    // Região paralela com 2 threads
    #pragma omp parallel num_threads(2)
    {
        int tid = omp_get_thread_num(); // ID da thread

        // Divide as iterações do loop entre as threads
        #pragma omp for schedule(static,2)
        for(int i = 1; i <= 3; i++)
        {
            printf("[PRINT1] T%d = %d \n", tid, i);
            printf("[PRINT2] T%d = %d \n", tid, i);
        }
    }

    return 0;
}
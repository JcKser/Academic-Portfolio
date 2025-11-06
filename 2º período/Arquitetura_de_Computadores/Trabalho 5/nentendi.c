#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <math.h>

int main()
{
    clock_t start, end, T;
    float Tempo, media=0;

    int c;
    int i,j, x = 1, y = 3;
    i = &x;
    j = &y;
    int k, num1 = 1, num2 =3;

    T= CLOCKS_PER_SEC;
    for (k= 1; k <= 10; k=k+1)
    { 
        start = clock();
        for (c = 1; c <= 10000000; c=c+1) i = i * j;

         end = clock();


        Tempo = (end - start) * 1000/CLOCKS_PER_SEC;
        printf("\nTempo de execucao: %g ms.", Tempo);
        media = media + Tempo;
    }
    printf("\nMedia de tempo de execucao: %g ms.", media/10);
}
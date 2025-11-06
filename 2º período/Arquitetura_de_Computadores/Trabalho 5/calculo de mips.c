#include <stdio.h>
#include <stdlib.h>

int main() {
    int x = 10000000;
    double y, z;
    for (size_t i = 0; i < 10; i++)
    {
    printf("\nDigite o valor de y:\n ");
    scanf("%lf", &y);
   
    printf("\nDigite o valor de z: ");
    scanf("%lf", &z);

    double result = z - y;
     printf("\nO valor de result é: %lf", result);
    double mips = (x / result);

    printf("\nO valor de MIPS é: %lf", mips);

    }
    
    
    return 0;
}

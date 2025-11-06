#include <stdio.h>
#include <stdlib.h>

int main() {
    int x = 10;
    double y, z, m, result, mips = 0;
    
    for (size_t i = 0; i < 6; i++) {
        y= 28.7;
   
        printf("\nDigite o valor de z: ");
        scanf("%lf", &z);

        m = 3593.4;

        result = ((z - y) /10) * m; // Calculate execution time
        printf("\nO valor de result é: %lf", result);

    }
    
    
    return 0;
}

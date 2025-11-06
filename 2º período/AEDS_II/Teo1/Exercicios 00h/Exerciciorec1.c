#include <stdio.h>


int recursive( int n, int x)
{
   if (x == 1 )
   {
    return n;
   }

 return n + recursive (n, x - 1 );

   
}


int main()
{  int n;
   printf("Digite o valor de n: \n");
   scanf("%i", &n);
   
   

   int x;

   printf("\n Digite o valor a ser multipricado:\n");
   scanf("%i", &x);
   
   int resultado = recursive(n, x);
    printf("O resultado da multiplicacao é: %d\n", resultado);

    
    return 0;
}

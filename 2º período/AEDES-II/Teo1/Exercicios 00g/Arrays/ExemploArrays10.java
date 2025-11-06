import java.util.Scanner;

public class ExemploArrays10 
{
    public static void main(String[] args)
    {
        Scanner scanner = new Scanner(System.in);

        int N;
        
        System.out.println("Digite quantos numeros inteiros você quer escrever:");
        N = scanner.nextInt();
        
        int count = 0;
        int cout = 0;
        int[] array = new int[N];
        int[] pares = new int[N]; // Use o mesmo tamanho de array
        int[] divisiveis_3 = new int[N]; // Use o mesmo tamanho de array
      
        System.out.println("Digite os numeros inteiros:");
       
        for (int i = 0; i < array.length; i++) 
        {   
            array[i] = scanner.nextInt();
            if (array[i] % 2 == 0) 
            {
                pares[count] = array[i]; // Use count como índice
                count++;
            }
            if (array[i] % 3 == 0) 
            {
                divisiveis_3[cout] = array[i]; // Use cout como índice
                cout++;
            }
        }
        
        System.out.println("" + "Os números pares do array são:");
        for (int i = 0; i < count; i++) 
        {
            System.out.print(pares[i]); // Usar print em vez de println
    
       if (i < count - 1) 
        {
        System.out.print(", "); // Adicionar vírgula e espaço após todos os números, exceto o último
        }
        }
        System.out.println();

        System.out.println("Os números divisiveis por 3 do array são:");
        for (int i = 0; i < cout; i++) 
        {

         System.out.print(divisiveis_3[i]); // Usar print em vez de println
    
       if (i < cout - 1) 
        {
        System.out.print(", "); // Adicionar vírgula e espaço após todos os números, exceto o último
        }
        }
        System.out.println();


        scanner.close();
    }
}
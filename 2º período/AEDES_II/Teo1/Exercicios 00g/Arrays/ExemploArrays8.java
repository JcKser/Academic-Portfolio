import java.util.Scanner;

public class ExemploArrays8 
{
    public static void main(String[] args)
    {
        Scanner scanner = new Scanner(System.in);

        int N;
        

        System.out.println("Digite quantos numeros inteiros você quer escrever:");
        N = scanner.nextInt();
        int cout = 0;
        int[] array = new int[N];
        int[] soma = new int [cout];
       
       System.out.println("Digite os numeros inteiros:");
       
        for (int i = 0; i < array.length; i++) 
        {   array[i] = scanner.nextInt();
            if (N % 2 == 0) 
            {
                soma[i] = array[i] + array[i++];
                cout++;
            }
            i++;
        }
        
        System.out.println("As somas serao:");
        for (int i = 0; i < cout; i++) 
        {
            System.out.println(soma + ",") ;
        }

        scanner.close();
    
    }
    
}

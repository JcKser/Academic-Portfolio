import java.util.Scanner;

public class ExemploArrays11
{
    public static void main(String[] args) 
    {
        Scanner sc = new Scanner(System.in);
        
        int N;
        int soma = 0;
        

        System.out.println("Digite quantos numero inteiros vc ira escrever:");
        N = sc.nextInt();

        int [] array = new int[N];
        int controle = array.length;
        System.out.println("Digite os numeros inteiros:");
        

        for (int i = 0; i < controle; i++) 
        {
            array[i] = sc.nextInt();
        }
      
         System.out.println("A Soma dos numeros inteiros:");

         for (int i = 0; i < array.length / 2; i++) {
            soma = array[i] + array[array.length - 1 - i];
            System.out.println(soma);
        }
        

        sc.close();
    }
    
}

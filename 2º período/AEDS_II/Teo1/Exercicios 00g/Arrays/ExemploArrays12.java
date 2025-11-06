import java.util.Scanner;

public class ExemploArrays12 
{
     public static void main(String[] args) 
    {
        Scanner sc = new Scanner(System.in);
        
        int N;
        int soma = 0;
        

        System.out.println("Digite quantos numero inteiros vc ira escrever:");
        N = sc.nextInt();

        int [] array = new int[N];
       
        System.out.println("Digite os numeros inteiros:");
        

        for (int i = 0; i < array.length; i++) 
        {   
            
            array[i] = sc.nextInt();
            if (array [i] % 3 == 0) 
            {
             soma += array[i];   
            }
        }
      
         System.out.println("A Soma dos numeros inteiros:" + soma);

   
        

        sc.close();
    }
    
    
}

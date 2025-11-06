import java.util.Scanner;

public class ExemploArrays13 
{
    public static void main(String[] args) 
    {
        Scanner sc = new Scanner(System.in);

        int N;

        System.out.println("Digite o valor do tamanho dos arrays:");
        N = sc.nextInt();

        
        int vetor1[] = new int[N];
         int vetor2[] = new int[N];
       
         System.out.println("Digite os elementos do primeiro vetor:");
        for (int i = 0; i < vetor1.length; i++) 
        { 
            
            vetor1[i] = sc.nextInt();

        }
         
        System.out.println("Digite os elementos do segundo vetor:");
         for (int i = 0; i < vetor2.length; i++) 
        { 
           
            vetor2[i] = sc.nextInt();

        }

        for (int i = 0; i < vetor2.length; i++) 
        {    
            if (i % 2 == 0) 
            {
                System.out.println("Vetor1: " + vetor1[i]);
            } 
            else {
                 System.out.println("Vetor2: " + vetor2[i]);
            }

            
        }


        sc.close();

        
    }
    
}

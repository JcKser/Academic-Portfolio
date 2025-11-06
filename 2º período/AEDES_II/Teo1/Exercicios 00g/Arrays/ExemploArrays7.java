import java.util.Scanner;

public class ExemploArrays7 
{
        public static void main(String[] args) 
    {
      Scanner scanner = new Scanner(System.in);
    

    int N;

    System.out.println("Digite a quantidade dos numeros inteiros:");
    N = scanner.nextInt();
    
    int[] array = new int[N];
    int[] array1 = new int[N];
    int soma = 0;
    int media = 0;
    int menor = Integer.MIN_VALUE;
     
    System.out.println("Digite os numeros inteiros: ");
    for (int i = 0; i < array.length; i++) 
    {
       
        array[i] = scanner.nextInt();

        if (array[i] < menor) 
        {
            menor = array[i]; 
        }

        soma = soma + array[i];
       
    }

    media = soma / N;
    
     System.out.println("A media das notas dos alunos eh: " + media);
      System.out.println("As notas acima da media são: " );
        
      int count = 0;
      for (int i = 0; i < array1.length; i++)
        {
           if (array[i] > media) 
           {
              array1[count] = array[i];
              count++;
           }
        }
      
        for (int i = 0; i < count; i++)
        {
           System.out.println(array1[i]);
            
        }
    

    scanner.close();
  
    }
}

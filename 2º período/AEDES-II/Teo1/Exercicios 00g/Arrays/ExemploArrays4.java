import java.util.Scanner;
import java.util.HashSet;

public class ExemploArrays4 
{
    public static void main(String[] args) 
    {
       Scanner scanner = new Scanner(System.in);
       int N, X;

       System.out.println("Digite o tamanho do primeiro array:");
       N = scanner.nextInt();
       
       System.out.println("Digite o tamanho do segundo array:");
       X = scanner.nextInt();


       int[] array1 = new int[N]; // primeiro array sendo lido
        System.out.println("Digite os elementos do primeiro array:");

            for (int i = 0; i < array1.length; i++) 
            {  
                array1[i] = scanner.nextInt();
        
            }
      

        int[] array2 = new int[X];  //Segundo array a ser lido
          System.out.println("Digite os elementos do segundo array:"); 
           for (int i = 0; i < array2.length; i++) 
           {
              array2[i] = scanner.nextInt();
           }

        
       HashSet<Integer> unionSet = new HashSet<>();  // integrando numeros para saber a uniao
       for (int count : array1)
       {
        unionSet.add(count);

       }    
       
        for (int count : array2)
       {
        unionSet.add(count);

       } 
       
       HashSet<Integer> intersecionSet = new HashSet<>();


       for (int count : array1) 
       {
        if (unionSet.contains(count) &&  !intersecionSet.contains(count)) 
        {
             intersecionSet.add(count);
        }
       
       }


       System.out.println("União dos arrays: " + unionSet);
        
       // Exibição da interseção
       System.out.println("Interseção dos arrays: " + intersecionSet);
       
       scanner.close();
   }

      
    }
    


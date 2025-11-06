import java.util.Scanner;

public class ExemploArrays6 
{
    public static void main(String[] args) 
    {
      Scanner scanner = new Scanner(System.in);

    int[] array = new int[5];
    int soma = 0;
    int menor = Integer.MAX_VALUE;
    for (int i = 0; i < array.length; i++) 
    {
        System.out.println("Digite a nota do aluno " + (i + 1) + ":");
        array[i] = scanner.nextInt();

        if (array[i] < menor) 
        {
            menor = array[i]; 
        }

        soma = soma + array[i];
  

    }

    
    System.out.println("A soma das notas dos alunos eh: " + soma);
     System.out.println("A media das notas dos alunos eh: " + (soma/5));
      System.out.println("A media das notas dos alunos eh: " + menor);

    

    scanner.close();
  
    }
    


    
}

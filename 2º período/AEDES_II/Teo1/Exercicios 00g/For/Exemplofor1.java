import java.util.Scanner;

public class Exemplofor1
{
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int[] nota = new int[5];
        double media = 0;
         // Corrigindo o índice inicial para 0

       for (int i = 0; i < nota.length; i++) 
       {
        
       
            System.out.println("Digite a nota do aluno " + (i + 1)); // Adicionando 1 ao índice para exibir a numeração correta
            nota[i] = scanner.nextInt();

            media += nota[i];
       }
        System.out.println("A média é " + (media / 5)); // Cálculo correto da média

        scanner.close();
        
    }
}


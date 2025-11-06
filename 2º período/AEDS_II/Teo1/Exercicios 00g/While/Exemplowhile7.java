import java.util.Scanner;

public class Exemplowhile7 {
    public static void main(String[] args)
    {
        Scanner scanner = new Scanner(System.in);

        int[] nota = new int[5];
        int max_nota; 
        double media = 0;
        int i = 0; // Corrigindo o índice inicial para 0
        int ehmaior = 0;
        int ehmenor = 0;

        System.out.println("Digite maxima nota da prova ");
        max_nota = scanner.nextInt();
        
        while (i < 20) {
          do {
              System.out.println("Digite a nota do aluno " + (i + 1)); // Adicionando 1 ao índice para exibir a numeração correta
              nota[i] = scanner.nextInt();
              
          } while (nota[i] > max_nota);
         
         if (nota[i] >=(max_nota * (90/100))) {
            ehmaior++;
        }

        if (nota[i] < (max_nota * (60/100))) {
            ehmenor++;
        }
          
          
          
             media += nota[i];
              i++;
        }
        System.out.println("A quantidade de alunos com as maiores notas eh  " + ehmaior); // Cálculo correto da média
         System.out.println("A média é " + (media / 20)); // Cálculo correto da média
         System.out.println("A quantidade de alunos com as menores notas eh  " + ehmenor); // Cálculo correto da média

        scanner.close();
    }
}

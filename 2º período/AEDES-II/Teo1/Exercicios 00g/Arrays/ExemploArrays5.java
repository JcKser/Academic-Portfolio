import java.util.Scanner;

public class ExemploArrays5 
{
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int[] array = { 10, 5, 8, 2, 8 };

        System.out.println("Os elementos do array são:");

        for (int i = 0; i < array.length; i++) 
        {
            System.out.print(array[i]);

            if (i < array.length - 1) 
            {
                System.out.print(", ");  // Adiciona uma vírgula após todos os elementos, exceto o último
            }
        }

        System.out.println();  // Pula uma linha após a impressão dos elementos

        scanner.close();
    }
}
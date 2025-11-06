
import java.util.Scanner;

public class ExemploArrays9 
{
    public static void main(String[] args)
    {
        Scanner scanner = new Scanner(System.in);

        int N;
        int menor = Integer.MAX_VALUE; // Inicialize com o valor máximo, para que qualquer nota seja menor
        int posiçao = 0;

        System.out.println("Digite quantos numeros inteiros você quer escrever:");
        N = scanner.nextInt();
       
        int[] array = new int[N];
       
        System.out.println("Digite os numeros inteiros:");
       
        for (int i = 0; i < array.length; i++) 
        {   
            array[i] = scanner.nextInt(); 
            if (array[i] < menor) {
                menor = array[i]; // Atualiza a menor nota
                posiçao = i;
            }         
        }

        System.out.println("A menor nota esta na posiçao: " + posiçao);
        System.out.println("E Ela eh equivalente a: " + menor);

        scanner.close();
    }
}

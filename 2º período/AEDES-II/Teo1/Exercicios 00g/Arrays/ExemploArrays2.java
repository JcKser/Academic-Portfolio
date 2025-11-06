import java.util.Scanner;

public class ExemploArrays2 
{
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);
        int N;
        int menor = Integer.MAX_VALUE;
        int aponto = 0;
        
        System.out.println("Digite o valor do tamanho do arranjo:");
        N = scanner.nextInt();
        
        int[] array = new int[N];

        for (int i = 0; i < array.length; i++)
        {
            System.out.println("Digite um valor:");
            array[i] = scanner.nextInt();

            if (menor > array[i]) 
            {
                menor = array[i];
                aponto = i + 1;
            }
        }

        System.out.println("A posiçao do menor valor do array:" + aponto);
        
        scanner.close();
    }
    
}

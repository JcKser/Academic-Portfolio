import java.util.Scanner;

/**
 * Exemplowhile8
 */
public class Exemplowhile8 {

    public static void main(String[] args)
    { Scanner scanner = new Scanner(System.in);
        int N;
        int a = 0;  // First Fibonacci number
        int b = 1;
        int  i = 0;
        System.out.println("Digite o valor de N");
        N = scanner.nextInt();


        while (i < N) 
        {
            System.out.print(a + " ");

            int next = a + b;
            a = b;
            b = next;
            i++;
        }

        scanner.close();



        
    }
}
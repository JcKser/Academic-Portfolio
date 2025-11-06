import java.util.Scanner;

public class ExemploIf9 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);


        int[] x = new int[10];
        int ehmaior = Integer.MIN_VALUE; // Inicialização para encontrar o maior
        int ehmenor = Integer.MAX_VALUE; // Inicialização para encontrar o menor

        for (int i = 0; i < 10; i++) {
            System.out.println("Digite um valor:");
            x[i] = scanner.nextInt();

            if (x[i] > ehmaior) {
                ehmaior = x[i];
            }

            if (x[i] < ehmenor) {
                ehmenor = x[i];
            }
        }

        System.out.println("O maior é: " + ehmaior);
        System.out.println("O menor é: " + ehmenor);

        scanner.close();
    }
}


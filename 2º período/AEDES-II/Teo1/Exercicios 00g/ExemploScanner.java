import java.util.Scanner;

public class ExemploScanner {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int x;
        char P;
        String s;
        float y;

        System.out.println("Digite o valor do inteiro: ");
        x = scanner.nextInt();
        
        // Consumir a nova linha deixada pelo nextInt() antes de ler a próxima linha
        scanner.nextLine();
        
        System.out.println("Digite o valor do real: ");
        y = scanner.nextFloat();
        
        // Consumir a nova linha deixada pelo nextFloat() antes de ler a próxima linha
        scanner.nextLine();
        
        System.out.println("Digite o valor do char: ");
        P = scanner.nextLine().charAt(0);
        
        System.out.println("Digite sua string: ");
        s = scanner.nextLine();

        System.out.println("Inteiro:\n" + x + "\nReal:\n" + y + "\nString:\n" + s + "\nChar:\n" + P);
        scanner.close();
    }
}

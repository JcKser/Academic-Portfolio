import java.util.Scanner;

public class ExemploIf3 { public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int x;
        int y;
        int z;

        System.out.println("Digite o valor de x:");
        x = scanner.nextInt();
        
        System.out.println("Digite o valor de y:");
        y = scanner.nextInt();
        
        System.out.println("Digite o valor de z:");
        z = scanner.nextInt();
        
        if (x < y && x < z) {
            System.out.println("O menor é " + x);
        } else if (y < x && y < z) {
            System.out.println("O menor é " + y);
        } else {
            System.out.println("O menor é " + z);
        }
        
        if (x > y && x > z) {
            System.out.println("O maior é " + x);
        } else if (y > x && y > z) {
            System.out.println("O maior é " + y);
        } else {
            System.out.println("O maior é " + z);
        }
        
        scanner.close();
    } 
    
}
    

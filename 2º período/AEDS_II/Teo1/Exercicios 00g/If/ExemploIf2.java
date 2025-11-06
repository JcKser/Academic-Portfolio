import java.util.Scanner;

public class ExemploIf2 
{
    public static void main(String[] args) 
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
        
        if ( x == y && x == z)
        {
            System.out.println("Equilátero");            
        }else if ((x == y && x != z) || (x != y && x == z) || (y == z && y != x)) 
        {
            System.out.println("Isósceles");   
        }else
        {
            System.out.println("Escaleno");
        }

        scanner.close();
    } 
    
}

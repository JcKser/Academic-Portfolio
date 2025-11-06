import java.util.Scanner;

public class ExemploIf5 
{
    public static void main(String[] args)
    {
        Scanner scanner = new Scanner(System.in);
        int x;
        int y;
        int soma = 0 ;
        System.out.println("Digite o valor de x:");
        x = scanner.nextInt();
        
        System.out.println("Digite o valor de y:");
        y = scanner.nextInt();
        

        if (x > 45 || y > 45)
        {
           soma = x + y;
            
        }
        else if (x > 20 && y > 20)
        {
            if (x < y) 
            {
              soma = y - x;   
            }
            else
            {
                soma = x - y;
            }
            
        }else if ((x < 10 || y < 10) && (x != 0 || y != 0))
        {
         soma = x / y;   
        }
        else 
        {
            System.out.println("Júlio César");
        }
        System.out.println("Soma = " + soma);
        scanner.close();
    }
    
}

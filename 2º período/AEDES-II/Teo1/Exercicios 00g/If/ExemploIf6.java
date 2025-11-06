import java.util.Scanner;

/**
 * ExemploIf6
 */
public class ExemploIf6 
{

    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int visitante;
        int mandante;
      
        System.out.println("Digite os gols dos visitante:");
        visitante = scanner.nextInt();
        
        System.out.println("Digite o valor demandante:");
        mandante = scanner.nextInt();

        if (mandante > visitante)
        {
            System.out.println("MAndante ganhador");
            
        }
        else if (visitante > mandante)
        {

             System.out.println("Visitante ganhador");
        }
        else
        {
             System.out.println("Empate");
        }
        
        scanner.close();
        
    }
}
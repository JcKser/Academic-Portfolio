import java.util.Scanner;

public class ExemploIf7
{

    public static void main(String[] args)
    {
    Scanner scanner = new Scanner(System.in);
    double salario;
    double prestação;
    double limite = 0.4;
  
    System.out.println("Quanto previsa?");
    prestação = scanner.nextDouble();
    
    System.out.println("Quanto tu ganha?");
    salario = scanner.nextDouble();
    
    limite = salario * limite;


    if (prestação <= salario)
    {

         System.out.println("Emprestimo realizado");
    }
    else
    {
         System.out.println("Sai fora pobre");
    }

    scanner.close();
    }
    
}

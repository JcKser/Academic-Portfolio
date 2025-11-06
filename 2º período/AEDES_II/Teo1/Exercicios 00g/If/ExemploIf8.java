import java.util.Scanner;

public class ExemploIf8 
{
 public static void main(String[] args) 
 {   
    Scanner scanner = new Scanner(System.in);
    int x;
    int y;
    double log, raiz;
    
    System.out.println("Digite o valor de x:");
    x = scanner.nextInt();
    
    System.out.println("Digite o valor de y:");
    y = scanner.nextInt();
    
    if (x < y)
    {
      raiz = Math.pow(x, 1.0 / 3.0);
      log =  Math.log10( y );
  
    }
    else
    {
      raiz = Math.pow(y, 1.0 / 3.0);
      log =  Math.log10( x );
    }
    
     System.out.println("raiz eh" + raiz);
    System.out.println("Log eh" + log);
    
     scanner.close();

 }   
}

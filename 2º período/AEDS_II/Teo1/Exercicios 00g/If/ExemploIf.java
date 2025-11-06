import java.util.Scanner;
public class ExemploIf 
{
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int x;

        System.out.println("Digite o a nota do aluno:");
        x = scanner.nextInt();
        
        if ( x>= 80)
        {
            System.out.println("Parabéns, muito bom");            
        }else if (x >= 70 && x < 80 ) 
        {
            System.out.println("Parabéns,aprovado");   
        }else
        {
            System.out.println("Infelizmente,reprovado");
        }

        scanner.close();
    } 
    
}

import java.util.Scanner;
public class ExemploIf4
{
    

public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);

        int[] x = new int[10];
        int ehmaior = 0;
        
        for (int i = 0; i < 10; i++) 
        {
            
        
        System.out.println("Digite um valor:");
        x[i] = scanner.nextInt();
        
        if (x[i] > ehmaior) 
        {   
            ehmaior = x[i];
            
        }
        }
        System.out.println("O maior eh:" + ehmaior);

        
        
        scanner.close();
    } 
    
}
    



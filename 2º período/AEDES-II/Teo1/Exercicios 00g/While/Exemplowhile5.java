import java.util.Scanner;

public class Exemplowhile5
{
    public static void main(String[] args)
    {  
        Scanner scanner = new Scanner(System.in);
        int N;
        int count = 0;

        System.out.println("Digite o valor de N");
        N = scanner.nextInt();

        while (count <= N) 
        {
            if (count % 2 != 0) 
            {
              System.out.println(count);
            }
    
            count++; 
        }

        scanner.close();

        
    }
    
}

import java.util.Scanner;

public class Exemplowhile6

{
    public static void main(String[] args)
    {  
        Scanner scanner = new Scanner(System.in);
        int N;
        int count = 1;
        int i = 1;

        System.out.println("Digite o valor de N");
        N = scanner.nextInt();

        while (i < (N + 1)) 
        {
            if (i % 2 != 0) 
            {
             System.out.println(count);
             count = count + 4;
            }
            else
            { System.out.println(count);
              count = count + 7;
            }
    
            i++; 
        }

        scanner.close();

        
    }
    
}

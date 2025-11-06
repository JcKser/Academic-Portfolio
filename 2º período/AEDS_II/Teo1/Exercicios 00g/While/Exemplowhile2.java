public class Exemplowhile2
{
    public static void main(String[] args) 
    {
        int x = 1;
        int count = 0;

        while (count < 10) 
        {   
            double logBase10 = Math.log10(x);
            System.out.println(logBase10);
            x++;
            count++;
        }
        
    }
    
}

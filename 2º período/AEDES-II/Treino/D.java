public class D
{
    public static void main(String[] args) 
    {   

        int n = 5;
        int b = 5, y = 5 ;
         int i = 0; 
         int a = 5;
    

        for (i = 0; i < n; i++) 
        {
            for (int index = 0; index < n; index++) {
                for (int sla = 0; sla < n; sla++) 
                {
                b--;
                y--;
             
                }
              
            }
        } 
        for (int index = 0; index < 5; index++) 
        {
            a--;
        }
        System.out.println(b + y +  a );
    }
    
}

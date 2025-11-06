public class E 
{

    public static void main(String[] args)
    {
        int n = 5;
        int b = 5, y = 5 ;
    
        

         for (int j = 0; j < n; j++) {
            for (int index = 0; index < n; index++)
             { b--; y--;
                for (int liv = 0; liv < n; liv++) {
                    for (int k = 0; k < args.length; k++) 
                    {
                        b--; y--;
                    }
                }
            }
          if (j % 2 == 0) 
          {
            b--;
          }
        }
        

   
   
   System.out.println(b + y);
   
        }

    
    
}

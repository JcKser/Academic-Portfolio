public class B 
{ public static void main(String[] args) {
    int n = 5;
    int b = 5, y = 5 , u = 9;
     int i = 0; 
     int a = 5, t = 7;


    while (i < n) 
    {
        a--; t --; b--; u--; y--;
        i++;
    }
     for (i = 0; i < n; i++) 
    {
        for (int index = 0; index < n; index++) {
            for (int sla = 0; sla < n; sla++) 
            {
            b--;
            y--;
            a--;
            t--;
            }
          
        }
    } 
    System.out.println(b + y + u + a + t);
    
}
}

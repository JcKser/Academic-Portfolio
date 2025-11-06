/**
 * A
 */
public class A {

    public static void main(String[] args) {
        int n = 5;
        int b = 5, y = 5 , u = 9;
        for (int i = 0; i < n; i++) 
        {
            b--;
            y--;
            u--;
        }
         for (int i = 0; i < n; i++) 
        {
            for (int index = 0; index < n; index++) {
                b--;
                y--;
              
            }
        } 
        System.out.println(b + y + u);
    }
}
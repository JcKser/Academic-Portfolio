import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class ExemploBufferReader {

    public static void main(String[] args)
    throws IOException
    {
        BufferedReader reader = new BufferedReader (new InputStreamReader(System.in));
        
        int x;
        char P;
        String s;
        float y;

        System.out.println("Digite o valor do inteiro: ");
        x = Integer.parseInt(reader.readLine());
        
   
        
        System.out.println("Digite o valor do real: ");
        y = Float.parseFloat(reader.readLine());
        
;
        
        System.out.println("Digite o valor do char: ");
        P = reader.readLine().charAt(0);
        
        System.out.println("Digite sua string: ");
        s = reader.readLine();

        System.out.println("Inteiro:\n" + x + "\nReal:\n" + y + "\nString:\n" + s + "\nChar:\n" + P);
        reader.close();
    }
}

import java.io.BufferedReader;
import java.io.FileReader;

public class ExemploArq4 
{
       public static void main(String[] args) throws Exception
    {
        FileReader txt = new FileReader("lenda.txt");

        BufferedReader reader = new BufferedReader(txt);
        
        String line;
        while ((line = reader.readLine()) != null) 
        {   String uppercaseLine = line.toUpperCase(); 
            System.out.println(uppercaseLine);
        }
        reader.close();
        txt.close();
    }
}

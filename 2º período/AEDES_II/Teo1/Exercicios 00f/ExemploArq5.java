import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class ExemploArq5 
{ public static void main(String[] args) throws Exception
    {
        FileReader txt = new FileReader("lenda.txt");

        BufferedReader reader = new BufferedReader(txt);
        StringBuilder content = new StringBuilder();
        
        String line;
        while ((line = reader.readLine()) != null) 
        {
            System.out.println(line);
            content.append(line).append("\n");
        }
        
        
        Copia_de_Arquivo(content.toString());
        
        reader.close();
        txt.close();
    }
      public static void Copia_de_Arquivo(String content)throws Exception
      {  try {
            FileWriter writer = new FileWriter("herói.txt");
            writer.write(content);
            writer.close();
            System.out.println("Frase salva com sucesso no arquivo!");
        } catch (IOException e) {
            System.out.println("Ocorreu um erro ao salvar no arquivo: " + e.getMessage());
        }
      }
}

 
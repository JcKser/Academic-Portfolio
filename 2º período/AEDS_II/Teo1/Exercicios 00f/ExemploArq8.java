import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ExemploArq8
{

    public static String cifrarCesar(String texto, int chave) 
    {
        StringBuilder cifrado = new StringBuilder();
       
        for (char caractere : texto.toCharArray()) {
            if (Character.isLetter(caractere)) {
                char base = Character.isLowerCase(caractere) ? 'a' : 'A';
                char cifradoChar = (char) (((caractere - base + chave) % 26) + base);
                cifrado.append(cifradoChar);
            } else {
                cifrado.append(caractere);
            }
        }
       
        return cifrado.toString();
    }

    public static void main(String[] args) {
        try {
            BufferedReader leitor = new BufferedReader(new FileReader("lenda.txt"));
            StringBuilder conteudo = new StringBuilder();
            String linha;
           
            while ((linha = leitor.readLine()) != null) 
            {
                conteudo.append(linha);
            }
            leitor.close();

            int chaveCesar = 3; // Chave de ciframento de César
            String conteudoCifrado = cifrarCesar(conteudo.toString(), chaveCesar);

            System.out.println("Conteúdo cifrado:");
            System.out.println(conteudoCifrado);
        } catch (IOException e) {
            System.out.println("Erro ao ler o arquivo: " + e.getMessage());
        }
    }
}
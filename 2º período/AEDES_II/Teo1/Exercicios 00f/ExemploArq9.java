import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class ExemploArq9 {

    public static String decifrarCesar(String textoCifrado, int chave) {
        StringBuilder decifrado = new StringBuilder();
        for (char caractere : textoCifrado.toCharArray()) {
            if (Character.isLetter(caractere)) {
                char base = Character.isLowerCase(caractere) ? 'a' : 'A';
                char decifradoChar = (char) (((caractere - base - chave + 26) % 26) + base);
                decifrado.append(decifradoChar);
            } else {
                decifrado.append(caractere);
            }
        }
        return decifrado.toString();
    }

    public static void main(String[] args) {
        try {
            BufferedReader leitor = new BufferedReader(new FileReader("Cifra de cesar.txt"));
            StringBuilder conteudoCifrado = new StringBuilder();
            String linha;
            while ((linha = leitor.readLine()) != null) {
                conteudoCifrado.append(linha);
            }
            leitor.close();

            int chaveCesar = 3; // Chave de ciframento de César (mesma chave usada na cifragem)
            String conteudoDecifrado = decifrarCesar(conteudoCifrado.toString(), chaveCesar);

            System.out.println("Conteúdo decifrado:");
            System.out.println(conteudoDecifrado);
        } catch (IOException e) {
            System.out.println("Erro ao ler o arquivo cifrado: " + e.getMessage());
        }
    }
}

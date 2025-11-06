import java.nio.charset.StandardCharsets;
import java.util.Random;
import java.util.Scanner;

public class modificaçãoAleRec 
{
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in, StandardCharsets.UTF_8);
        String frase;

        while (true) {
            frase = sc.nextLine();
            if (frase.equalsIgnoreCase("FIM")) {
                break;
            }
            String criptografado = randomCriptoRecursive(frase, 4);
            
            System.out.println(criptografado);
        }

        sc.close();
    }

    public static String randomCriptoRecursive(String input, int recursionDepth) {
        if (recursionDepth == 0) {
            return input; // Condição de parada: não mais recursões
        }

        Random gerador = new Random();
        gerador.setSeed(4);
        
        char firstRandomChar = (char) ('a' + (Math.abs(gerador.nextInt()) % 26));
        char secondRandomChar = (char) ('a' + (Math.abs(gerador.nextInt()) % 26));
        
        String result = substituteChars(input, firstRandomChar, secondRandomChar);

        // Chama a função recursivamente com uma profundidade reduzida
        return randomCriptoRecursive(result, recursionDepth - 1);
    }

    public static String substituteChars(String input, char oldChar, char newChar) {
        return input.replace(oldChar, newChar);
    }
}
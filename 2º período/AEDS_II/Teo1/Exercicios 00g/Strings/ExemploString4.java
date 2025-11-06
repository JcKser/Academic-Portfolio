package Strings;
import java.util.Scanner;

public class ExemploString4 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Digite uma palavra:");
        String palavra = scanner.nextLine();

        int totalCaracteres = palavra.length();
        int letras = 0;
        int naoLetras = 0;
        int vogais = 0;
        int consoantes = 0;

        for (int i = 0; i < totalCaracteres; i++) {
            char caractere = palavra.charAt(i);
            
            if (Character.isLetter(caractere)) {
                letras++;
                
                if (isVowel(caractere)) {
                    vogais++;
                } else {
                    consoantes++;
                }
            } else {
                naoLetras++;
            }
        }

        System.out.println("Número de caracteres total: " + totalCaracteres);
        System.out.println("Número de letras: " + letras);
        System.out.println("Número de caracteres não letras: " + naoLetras);
        System.out.println("Número de vogais: " + vogais);
        System.out.println("Número de consoantes: " + consoantes);

        scanner.close();
    }

    public static boolean isVowel(char c) {
        c = Character.toLowerCase(c);
        return c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u';
    }
}

import java.util.Scanner;

public class CifraofCesarRec 
{

    private static final String CARACTERES_ESPECIAIS = " .,!?:;()[]{}-_=+*%&$#@^/\\|'\"<>";
    
    public static String cifraDeCesar(String frase, int index) {
        if (index >= frase.length()) {
            return ""; // Caso base: a frase foi completamente cifrada
        }

        char caractere = frase.charAt(index);

        if (Character.isLetter(caractere) || Character.isDigit(caractere) || caractere == ' ' || CARACTERES_ESPECIAIS.indexOf(caractere) != -1) {
            int codigoCaractere = caractere + 3; // Deslocamento de 3 posições
            return (char) codigoCaractere + cifraDeCesar(frase, index + 1);
        } else {
            return caractere + cifraDeCesar(frase, index + 1); // Mantém caracteres não tratados
        }
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        while (true) {
            String frase = sc.nextLine();
            
            if (frase.equalsIgnoreCase("FIM")) {
                break;
            }
            
            String cifra = cifraDeCesar(frase, 0);
            
            System.out.println(cifra);
        }
        
        sc.close();
    }
}

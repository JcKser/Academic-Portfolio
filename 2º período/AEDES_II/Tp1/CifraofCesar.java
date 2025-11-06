import java.util.Scanner;

public class CifraofCesar {

    private static final String CARACTERES_ESPECIAIS = " .,!?:;()[]{}-_=+*%&$#@^/\\|'\"<>";
    
    public static String cifraDeCesar(String frase) {
        StringBuilder resultado = new StringBuilder();

        for (int i = 0; i < frase.length(); i++) {
            char caractere = frase.charAt(i);

            if (Character.isLetter(caractere) || Character.isDigit(caractere) || caractere == ' ' || CARACTERES_ESPECIAIS.indexOf(caractere) != -1) {
                int codigoCaractere = caractere + 3; // Deslocamento de 3 posições
                resultado.append((char) codigoCaractere);
            } else {
                resultado.append(caractere); // Mantém caracteres não tratados
            }
        }

        return resultado.toString();
    }
    
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        while (true) {
            String frase = sc.nextLine();
            
            if (frase.equalsIgnoreCase("FIM")) {
                break;
            }
            
            String cifra = cifraDeCesar(frase);
            
            System.out.println(cifra);
        }
        
        sc.close();
    }
}
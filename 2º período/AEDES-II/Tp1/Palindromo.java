import java.util.Scanner;

public class Palindromo {

    public static boolean isPalindrome(String frase) {
        int totalFrase = frase.length();
        if (totalFrase <= 1) {
            return true;
        } else {
            char firstCharacter = frase.charAt(0);
            char lastCharacter = frase.charAt(totalFrase - 1);
            if (firstCharacter != lastCharacter) {
                return false;
            } else {
                String subFrase = frase.substring(1, totalFrase - 1);
                return isPalindrome(subFrase);
            }
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String frase;

        while (true) {
            frase = sc.nextLine();
            if (frase.equalsIgnoreCase("FIM")) {
                break;
            }
            boolean resp = isPalindrome(frase);
            System.out.println(resp ? "SIM" : "NAO");
        }

        sc.close();
    }
}
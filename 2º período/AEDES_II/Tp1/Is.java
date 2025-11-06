import java.util.Scanner;

public class Is {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in, "UTF-8");  // Especificando a codificação UTF-8
        StringBuilder output = new StringBuilder();

        while (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            boolean x1 = isOnlyVowels(line);
            boolean x2 = isOnlyConsonants(line);
            boolean x3 = isInteger(line);
            boolean x4 = isReal(line);

            output.append((x1 ? "SIM" : "NAO") + " ");
            output.append((x2 ? "SIM" : "NAO") + " ");
            output.append((x3 ? "SIM" : "NAO") + " ");
            output.append((x4 ? "SIM" : "NAO") + "\n");
        }

        System.out.println(output);
        scanner.close();  // Fechando o Scanner
    }

    public static boolean isOnlyVowels(String str) {
        str = str.replaceAll("[^a-zA-ZáéíóúÁÉÍÓÚ]", "");
        return str.matches("[aeiouAEIOUáéíóúÁÉÍÓÚ]+");
    }

    public static boolean isOnlyConsonants(String str) {
        str = str.replaceAll("[^a-zA-ZáéíóúÁÉÍÓÚ]", "");
        return str.matches("[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZáéíóúÁÉÍÓÚ]+");
    }

    public static boolean isInteger(String str) {
        try {
            Integer.parseInt(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public static boolean isReal(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}

import java.util.Scanner;
public class RecursiveIs {

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in, "UTF-8");
        processLines(scanner);
        scanner.close();
    }

    public static void processLines(Scanner scanner) {
        if (scanner.hasNextLine()) {
            String line = scanner.nextLine();
            boolean x1 = isOnlyVowels(line);
            boolean x2 = isOnlyConsonants(line);
            boolean x3 = isInteger(line);
            boolean x4 = isReal(line);

            System.out.println((x1 ? "SIM" : "NAO") + " " +
                               (x2 ? "SIM" : "NAO") + " " +
                               (x3 ? "SIM" : "NAO") + " " +
                               (x4 ? "SIM" : "NAO"));
            
            processLines(scanner); // Chamada recursiva para processar a próxima linha
        }
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
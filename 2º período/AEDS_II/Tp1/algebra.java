import java.util.*;

public class algebra {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int testCases = scanner.nextInt();
        scanner.nextLine(); // Consume the newline character

        for (int t = 0; t < testCases; t++) {
            int n = scanner.nextInt();
            int[] inputs = new int[n];
            for (int i = 0; i < n; i++) {
                inputs[i] = scanner.nextInt();
            }
            scanner.nextLine(); // Consume the newline character

            String expression = scanner.nextLine();
            boolean result = evaluateBooleanExpression(inputs, expression);
            System.out.println(result ? "SIM" : "NÃO");
        }
        scanner.close();
    }

    public static boolean evaluateBooleanExpression(int[] inputs, String expression) {
        Stack<Boolean> stack = new Stack<>();

        for (int i = 0; i < expression.length(); i++) {
            char c = expression.charAt(i);
            if (c == 'A' || c == 'B' || c == 'C') {
                stack.push(inputs[c - 'A'] == 1);
            } else if (c == '0') {
                stack.push(false);
            } else if (c == '1') {
                stack.push(true);
            } else if (c == 'n') {
                boolean operand = stack.pop();
                stack.push(!operand);
                i += 2; // Skip 'ot('
            } else if (c == 'a') {
                boolean operand2 = stack.pop();
                boolean operand1 = stack.pop();
                stack.push(operand1 && operand2);
                i += 2; // Skip 'nd('
            } else if (c == 'o') {
                boolean operand2 = stack.pop();
                boolean operand1 = stack.pop();
                stack.push(operand1 || operand2);
                i += 1; // Skip 'r('
            }
        }

        return stack.pop();
    }
}
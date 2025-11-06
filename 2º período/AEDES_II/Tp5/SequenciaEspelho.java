import java.util.Scanner;

public class SequenciaEspelho {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        int C = scanner.nextInt(); // Número de casos de teste
        
        for (int i = 0; i < C; i++) {
            int B = scanner.nextInt(); // Início da sequência
            int E = scanner.nextInt(); // Fim da sequência
            
            // Construir a sequência
            StringBuilder sequencia = new StringBuilder();
            for (int j = B; j <= E; j++) {
                sequencia.append(j);
            }
            
            // Construir a sequência espelho
            StringBuilder sequenciaEspelho = new StringBuilder(sequencia);
            sequenciaEspelho.append(sequencia.reverse()); // Adicionar a sequência invertida
            
            // Imprimir a sequência espelho
            System.out.println(sequenciaEspelho.toString());
        }
        
        scanner.close();
    }
}

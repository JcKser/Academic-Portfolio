import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            int N = scanner.nextInt();
            int P = scanner.nextInt();
            if (N == 0 && P == 0) break;

            int[] pilha = new int[N+1];
            int[] posicao = new int[N+1];
            int[] topo = new int[P+1];
            for (int i = 1; i <= P; i++) {
                int Q = scanner.nextInt();
                topo[i] = Q;
                for (int j = 1; j <= Q; j++) {
                    int caixa = scanner.nextInt();
                    pilha[caixa] = i;
                    posicao[caixa] = j;
                }
            }

            int pilha1 = pilha[1];
            int posicao1 = posicao[1];
            int desempilhadas = 0;
            for (int i = 2; i <= N; i++) {
                if (pilha[i] == pilha1 && posicao[i] > posicao1) {
                    desempilhadas++;
                } else if (pilha[i] != pilha1 && topo[pilha[i]] >= posicao[i]) {
                    desempilhadas += topo[pilha[i]] - posicao[i] + 1;
                    topo[pilha[i]] = posicao[i] - 1;
                }
            }
            System.out.println(desempilhadas);
        }
    }
}

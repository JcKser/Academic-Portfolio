import java.util.Scanner;

public class ExemploArrays14 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int N, M;

        System.out.println("Digite o valor do tamanho do primeiro vetor:");
        N = sc.nextInt();

        System.out.println("Digite o valor do tamanho do segundo vetor:");
        M = sc.nextInt();

        int vetor1[] = new int[N];
        int vetor2[] = new int[M];

        System.out.println("Digite os elementos do primeiro vetor:");
        for (int i = 0; i < vetor1.length; i++) {
            vetor1[i] = sc.nextInt();
        }

        System.out.println("Digite os elementos do segundo vetor:");
        for (int i = 0; i < vetor2.length; i++) {
            vetor2[i] = sc.nextInt();
        }

        int i = 0;
        int j = 0;

        while (i < N || j < M) {
            if (i < N) {
                System.out.println("Vetor1: " + vetor1[i]);
                i++;
            }
            if (j < M) {
                System.out.println("Vetor2: " + vetor2[j]);
                j++;
            }
        }

        sc.close();
    }
}
import java.util.Scanner;

public class ExemploArrays3 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        int x;

        System.out.println("Digite o tamanho do array:");
        x = scanner.nextInt();

        int[] array = new int[x];
        
        for (int i = 0; i < array.length; i++) {   
            System.out.println("Digite o valor do array " + (i + 1));
            array[i] = scanner.nextInt();
        }
        
        // Algoritmo de ordenação de seleção
        for (int i = 0; i < array.length - 1; i++) {
            int indiceMenor = i;
            for (int j = i + 1; j < array.length; j++) {
                if (array[j] < array[indiceMenor]) {
                    indiceMenor = j;
                }
            }
            // Troca os elementos nas posições i e indiceMenor
            int temp = array[i];
            array[i] = array[indiceMenor];
            array[indiceMenor] = temp;
        }
        
        System.out.println("Array ordenado:");
        for (int i = 0; i < array.length; i++) {
            System.out.println("Array na posição " + (i + 1) + ": " + array[i]);
        }
        
        scanner.close();
    }
}
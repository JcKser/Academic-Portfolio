import java.util.Scanner;

public class ExemploArrays18 
{
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int L, C;
        
        
        System.out.println("Digite quantas linhas tera a matriz:");
        L = sc.nextInt();
        
        System.out.println("Digite quantas colunas tera a matriz:");
        C = sc.nextInt();

        int matriz[][]= new int[L][C];
        int media[] = new int[L];

     
        
        System.out.println( "Digite o valor dos elementos do matriz:");
        for (int i = 0; i < L; i++) 
        {
            for (int j = 0 ; j < C; j++) {
                matriz[i][j] = sc.nextInt();

                media[i] += matriz[i][j];
                
            }
             
        }
       
         System.out.println("Matriz em formato de grid:");

        for (int i = 0; i < C; i++) {
            for (int j = 0; j < L; j++) {
                System.out.print(matriz[i][j] + " ");
            }
            System.out.println(); // Pula para a próxima linha após cada linha da matriz
        }
        
        for (int i = 0; i < media.length; i++) {
            double linhaMedia = (double) media[i] / C;
            System.out.println("A média da " + "Linha:" + (i + 1) +  linhaMedia);
        }
        

        sc.close();

    }
    
}

package Strings;
import java.util.Scanner;

public class ExemploString {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Digite sua string:");
        String frase = scanner.nextLine();
     

        System.out.println("Digite o caracter a ser procurado:");
        char x = scanner.next().charAt(0);
        
        int count = 0;
        
        for (int i = 0; i < frase.length(); i++) 
        {
            if( frase.charAt(i) == x)
            {
                count++;
            }
        }
       
        System.out.println("O caracter aparece em " + count);
        scanner.close();

        // O restante do código deve ser colocado aqui, se necessário
    }
}

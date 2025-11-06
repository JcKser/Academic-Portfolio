package Strings;

import java.util.Scanner;

public class ExemploString2 
{
    public class ExemploString {
    public static void main(String[] args) 
    {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("Digite sua palavra:");
        String frase = scanner.nextLine();
        
        int count = 0;
        int maiusculos = 0;
        
        for (int i = 0; i < frase.length(); i++) 
        {  char caractere = frase.charAt(i);
          if (Character.isUpperCase(caractere)) {
              maiusculos++;
          }
        count++;
        }
        
       
       
        System.out.println("A palavra tem  " + count + " caracteres.");
         System.out.println("A palavra tem  " + maiusculos + " caracteres maiúsculos.");
        scanner.close();

        // O restante do código deve ser colocado aqui, se necessário
    } }
}

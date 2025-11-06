package Strings;

import java.util.Scanner;

public class ExemploString3 
{
    
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("Digite sua palavra:");
        String frase = scanner.nextLine();

        int count = 0;
        int maiusculos = 0;

        for (int i = 0; i < frase.length(); i++) {
            char caractere = frase.charAt(i);
            if (Character.isUpperCase(caractere)) {
                maiusculos++;
            }
            count++;
        }

        System.out.println("A palavra tem " + count + " caracteres.");
        System.out.println("A palavra tem " + maiusculos + " caracteres maiúsculos.");

        frase = frase.toUpperCase(); // Converter a palavra para maiúsculas
        int primeiraOcorrenciaA = frase.indexOf('A');
        if (primeiraOcorrenciaA != -1) {
            System.out.println("A primeira ocorrência da letra 'A' (maiúscula ou minúscula) está na posição " + primeiraOcorrenciaA);
        } else {
            System.out.println("A letra 'A' não foi encontrada na palavra.");
        }

        scanner.close();
    }
}



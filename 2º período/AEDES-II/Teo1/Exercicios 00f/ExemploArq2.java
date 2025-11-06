import java.io.*;
import java.util.Scanner;


public class ExemploArq2 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Digite o nome do arquivo: ");
        String nomeArquivo = scanner.nextLine();

        System.out.print("Digite a frase a ser salva no arquivo: ");
        String frase = scanner.nextLine();

        salvarNoArquivo(nomeArquivo, frase);

        scanner.close();
    }

    public static void salvarNoArquivo(String nomeArquivo, String conteudo) {
        try {
            FileWriter writer = new FileWriter(nomeArquivo);
            writer.write(conteudo);
            writer.close();
            System.out.println("Frase salva com sucesso no arquivo!");
        } catch (IOException e) {
            System.out.println("Ocorreu um erro ao salvar no arquivo: " + e.getMessage());
        }
    }
}
import java.io.*;

public class LerArquivoReverso {

    public static void main(String[] args) {
        try {
            BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
            System.out.println("Digite o número de valores a serem lidos:");
            int n = Integer.parseInt(br.readLine());

            // Criar e abrir o arquivo
            RandomAccessFile arquivo = new RandomAccessFile("valores.txt", "rw");

            // Ler e salvar os valores sequencialmente
            for (int i = 0; i < n; i++) {
                System.out.println("Digite o valor #" + (i + 1) + ":");
                double valor = Double.parseDouble(br.readLine());
                arquivo.writeDouble(valor);
            }

            // Fechar o arquivo
            arquivo.close();

            // Reabrir o arquivo e ler de trás para frente
            arquivo = new RandomAccessFile("valores.txt", "r");

            // Posicionar no final do arquivo
            arquivo.seek(arquivo.length());

            System.out.println("Valores lidos de trás para frente:");
            while (arquivo.getFilePointer() > 0) {
                arquivo.seek(arquivo.getFilePointer() - 8); // Tamanho de um double é 8 bytes
                double valor = arquivo.readDouble();
                System.out.println(valor);
            }

            // Fechar o arquivo novamente
            arquivo.close();
        } catch (IOException e) {
            System.err.println("Erro de E/S: " + e.getMessage());
        } catch (NumberFormatException e) {
            System.err.println("Erro: Entrada inválida. Certifique-se de inserir um número válido.");
        }
    }
}

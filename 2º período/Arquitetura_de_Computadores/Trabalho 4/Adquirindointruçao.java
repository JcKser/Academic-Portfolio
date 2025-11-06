import java.io.*;

class AdquirindoInstrucao 
{
    public static String decodificador(String w) throws Exception 
    {
        String operacao = null;

        // Verificando qual o conteudo da linha lida, ou seja, qual a operacao vai ser executada
        // Trim() eh usado para remover possiveis espacos em branco na linha
        
        if (w.trim().equals("W=nB;") || w.trim().equals("W=nB")) // Se a linha contiver "W=nB;" ou "W=nB", a operacao eh "0"
        {
            operacao = "0";
        }

        else if (w.trim().equals("W=nAeBn;") || w.trim().equals("W=nAeBn")) // Se a linha contiver "W=nAeBn;" ou "W=nAeBn", a operacao eh "1"
        {
            operacao = "1";
        }

        else if (w.trim().equals("W=nAeB;") || w.trim().equals("W=nAeB")) // Se a linha contiver "W=nAeB;" ou "W=nAeB", a operacao eh "2"
        {
            operacao = "2";
        }

        else if (w.trim().equals("W=Lzero;") || w.trim().equals("W=Lzero")) // Se a linha contiver "W=Lzero;" ou "W=Lzero", a operacao eh "3"
        {
            operacao = "3";
        }

        else if (w.trim().equals("W=AeBn;") || w.trim().equals("W=AeBn")) // Se a linha contiver "W=AeBn;" ou "W=AeBn", a operacao eh "4"
        {
            operacao = "4";
        }

        else if (w.trim().equals("W=nA;") || w.trim().equals("W=nA")) // Se a linha contiver "W=nA;" ou "W=nA", a operacao eh "5"
        {
            operacao = "5";
        }

        else if (w.trim().equals("W=AxB;") || w.trim().equals("W=AxB")) // Se a linha contiver "W=AxB;" ou "W=AxB", a operacao eh "6"
        {
            operacao = "6";
        }

        else if (w.trim().equals("W=AenB;") || w.trim().equals("W=AenB")) // Se a linha contiver "W=AenB;" ou "W=AenB", a operacao eh "7"
        {
            operacao = "7";
        }

        else if (w.trim().equals("W=nAonB;") || w.trim().equals("W=nAonB")) // Se a linha contiver "W=nAonB;" ou "W=nAonB", a operacao eh "8"
        {
            operacao = "8";
        }

        else if (w.trim().equals("W=nAxnB;") || w.trim().equals("W=nAxnB")) // Se a linha contiver "W=nAxnB;" ou "W=nAxnB", a operacao eh "9"
        {
            operacao = "9";
        }

        else if (w.trim().equals("W=Bcopia;") || w.trim().equals("W=Bcopia")) // Se a linha contiver "W=Bcopia;" ou "W=Bcopia", a operacao eh "A"
        {
            operacao = "A";
        }

        else if (w.trim().equals("W=AeB;") || w.trim().equals("W=AeB")) // Se a linha contiver "W=AeB;" ou "W=AeB", a operacao eh "B"
        {
            operacao = "B";
        }

        else if (w.trim().equals("W=Lum;") || w.trim().equals("W=Lum")) // Se a linha contiver "W=Lum;" ou "W=Lum", a operacao eh "C"
        {
            operacao = "C";
        }

        else if (w.trim().equals("W=AonB;") || w.trim().equals("W=AonB")) // Se a linha contiver "W=AonB;" ou "W=AonB", a operacao eh "D"
        {
            operacao = "D";
        }

        else if (w.trim().equals("W=AoB;") || w.trim().equals("W=AoB")) // Se a linha contiver "W=AoB;" ou "W=AoB", a operacao eh "E"
        {
            operacao = "E";
        }

        else if (w.trim().equals("W=Acopia;") || w.trim().equals("W=Acopia")) // Se a linha contiver "W=Acopia;" ou "W=Acopia", a operacao eh "F"
        {
            operacao = "F";
        }

        return operacao;
    }
    public static void main(String[] args) throws Exception 
    {
        // Abrindo os arquivos de leitura e escrita
        RandomAccessFile lerArquivo = new RandomAccessFile("testeula.ula", "rw");
        RandomAccessFile escreverArquivo = new RandomAccessFile("testeula.hex", "rw");

        // Se o arquivo de escrita nao estiver vazio, limpa seu conteudo
        if (escreverArquivo.length() > 0)
            escreverArquivo.setLength(0);

        String linha;
        String[] letra;
        String codigo;
        String x = null, y = null, w = null;

        // Ler a primeira linha e desconsidera-la (eh a palavra "inicio:")
        linha = lerArquivo.readLine();

        // Verifica se nao eh o fim, ignorando possiveis espacos em branco
        while (linha != null && (!linha.trim().equals("fim.") && !linha.trim().equals("fim"))) 
        {
            letra = linha.split("(?!^)"); // Separando a string lida em um array de caracteres

            if (letra[0].equals("X")) // Pegando o valor de X, se for o caso
            {
                x = letra[2];
            }

            else if (letra[0].equals("Y")) // Pegando o valor de Y, se for o caso
            {    
                y = letra[2];
            }

            else if (letra[0].equals("W")) // Pegando o valor de W, se for o caso, e mostrando resultado
            {
                w = decodificador(linha);
                codigo = x + y + w;
                escreverArquivo.writeBytes(codigo);
                escreverArquivo.writeByte(' ');
            }

            linha = lerArquivo.readLine(); // Le a proxima linha
        }

    

        // Fechando arquivos
        lerArquivo.close();
        escreverArquivo.close();
    }
}

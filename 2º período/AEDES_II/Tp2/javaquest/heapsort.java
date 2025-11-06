
import java.io.IOException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.Instant;
import java.util.LinkedList;
import java.util.concurrent.TimeUnit;
import java.time.Duration;

class Jogador {
    private int id;
    private String nome;
    private int altura;
    private int peso;
    private String universidade;
    private int anoNascimento;
    private String cidadeNascimento;
    private String estadoNascimento;

    Jogador() {
        id = -1;
        nome = "";
        altura = -1;
        peso = -1;
        universidade = "";
        anoNascimento = -1;
        cidadeNascimento = "";
        estadoNascimento = "";
    }

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    public void setAltura(int altura) {
        this.altura = altura;
    }

    public int getAltura() {
        return altura;
    }

    public void setPeso(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }

    public void setUniversidade(String universidade) {
        this.universidade = universidade;
    }

    public String getUniversidade() {
        return universidade;
    }

    public void setAnoNascimento(int anoNascimento) {
        this.anoNascimento = anoNascimento;
    }

    public int getAnoNascimento() {
        return anoNascimento;
    }

    public void setCidadeNascimento(String cidadeNascimento) {
        this.cidadeNascimento = cidadeNascimento;
    }

    public String getCidadeNascimento() {
        return cidadeNascimento;
    }

    public void setEstadoNascimento(String estadoNascimento) {
        this.estadoNascimento = estadoNascimento;
    }

    public String getEstadoNascimento() {
        return estadoNascimento;
    }

    public void ler(String s) {
        String[] array = s.split(",", 8);
        this.id = parseToInt(array[0]);
        this.nome = array[1].isEmpty() ? "nao informado" : array[1];
        this.altura = parseToInt(array[2]);
        this.peso = parseToInt(array[3]);
        this.universidade = array[4].isEmpty() ? "nao informado" : array[4];
        this.anoNascimento = parseToInt(array[5]);
        this.cidadeNascimento = array[6].isEmpty() ? "nao informado" : array[6];
        this.estadoNascimento = array[7].isEmpty() ? "nao informado" : array[7];
    }

    private int parseToInt(String s) {
        try {
            return Integer.parseInt(s);
        } catch (NumberFormatException e) {
            return -1; // Valor padrão em caso de falha na conversão
        }
    }
}

public class heapsort {
    public static void main(String[] args) throws IOException {
        Jogador[] tempPlayers = new Jogador[3923];
        Instant start = Instant.now();
        int[] compMov = new int[2]; 
        int id;
        BufferedReader sc = new BufferedReader(new InputStreamReader(System.in));
        LinkedList<Jogador> players = new LinkedList<>();

        methodToTime();

        BufferedReader br = new BufferedReader(new FileReader("/tmp/players.csv"));
        String str = br.readLine();

        for (int i = 0; i < 3922; i++) {
            str = br.readLine();

            tempPlayers[i] = new Jogador();
            tempPlayers[i].ler(str);
        }
        br.close();

        String entrada = sc.readLine();
        while (!entrada.equals("FIM")) {
            id = Integer.parseInt(entrada);

            boolean found = false;
            int i = 0;
            while (found == false) {
                if (tempPlayers[i].getId() == id) {
                    players.add(tempPlayers[i]);
                    found = true;
                }
                i++;

            }

            // searchId(id, players);
            entrada = sc.readLine();
        }

        Heapsort.heapSortByAlturaAndName(players, compMov);

        int comparacoes = compMov[0];
        int movimentacoes = compMov[1];

        for (Jogador player : players) {
            System.out.println("[" + player.getId() + " ## " + player.getNome() + " ## " + player.getAltura() + " ## "
                    + player.getPeso() + " ## " + player.getAnoNascimento() + " ## " + player.getUniversidade() + " ## "
                    + player.getCidadeNascimento() + " ## " + player.getEstadoNascimento() + "]");
        }

        Instant finish = Instant.now();
        long timeElapsed = Duration.between(start, finish).toMillis(); // em milissegundos

        wInfo(1445217, timeElapsed, comparacoes, movimentacoes);
    }

    public static void wInfo(int Matricula, float time, int comparacoes, int movimentacoes) {
        try (FileWriter myWriter = new FileWriter("/tmp/1445217_heapsort.txt")) {
            myWriter.write(Matricula + "\t " + time + "ms\t " + "\t" + comparacoes + "\t " + movimentacoes);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public class Heapsort {
        public static void heapSortByAlturaAndName(LinkedList<Jogador> jogadores, int[] compMov) {
            int n = jogadores.size();
    
            for (int i = n / 2 - 1; i >= 0; i--) {
                heapify(jogadores, n, i, compMov);
            }
    
            for (int i = n - 1; i > 0; i--) {
                swap(jogadores, 0, i, compMov);
                heapify(jogadores, i, 0, compMov);
            }
        }
    
        public static void heapify(LinkedList<Jogador> jogadores, int n, int i, int[] compMov) {
            int maior = i;
            int esquerda = 2 * i + 1;
            int direita = 2 * i + 2;
        
            if (esquerda < n) {
                compMov[0]++; // Incrementa o contador de comparações
                if (jogadores.get(esquerda).getAltura() > jogadores.get(maior).getAltura() ||
                    (jogadores.get(esquerda).getAltura() == jogadores.get(maior).getAltura() && jogadores.get(esquerda).getNome().compareTo(jogadores.get(maior).getNome()) > 0)) {
                    maior = esquerda;
                }
            }
        
            if (direita < n) {
                compMov[0]++; // Incrementa o contador de comparações
                if (jogadores.get(direita).getAltura() > jogadores.get(maior).getAltura() ||
                    (jogadores.get(direita).getAltura() == jogadores.get(maior).getAltura() && jogadores.get(direita).getNome().compareTo(jogadores.get(maior).getNome()) > 0)) {
                    maior = direita;
                }
            }
        
            if (maior != i) {
                swap(jogadores, i, maior, compMov);
                heapify(jogadores, n, maior, compMov);
            }
        }
    
        public static void swap(LinkedList<Jogador> jogadores, int i, int j, int[] compMov) {
            Jogador tempJogador = jogadores.get(i);
            jogadores.set(i, jogadores.get(j));
            jogadores.set(j, tempJogador);
            compMov[1]++; // Incrementa o contador de movimentações
        }
    }
    
    
    private static void methodToTime() {
        try {
            TimeUnit.SECONDS.sleep(3);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}

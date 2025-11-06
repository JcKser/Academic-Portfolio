
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

    Jogador() { // Construtor vazio
        id = -1;
        nome = "";
        altura = -1;
        peso = -1;
        universidade = "";
        anoNascimento = -1;
        cidadeNascimento = "";
        estadoNascimento = "";
    }

    Jogador(int id, String nome, int altura, int peso, String universidade, int anoNascimento, String cidadeNascimento,
            String estadoNascimento) { // Construtor com parametros
        this.id = id;
        this.nome = nome;
        this.altura = altura;
        this.peso = peso;
        this.universidade = universidade;
        this.anoNascimento = anoNascimento;
        this.cidadeNascimento = cidadeNascimento;
        this.estadoNascimento = estadoNascimento;
    }

    // Getters e Setters
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
        String[] array = s.split(",", 8); // Dividir a string em um array de strings, separando por virgula e limitando
                                          // a 8 casas
        this.id = Integer.parseInt(array[0]);
        this.nome = array[1].isEmpty() ? "nao informado" : array[1]; // Se o nome for vazio, substituir por "nao
                                                                     // informado"
        this.altura = Integer.parseInt(array[2]);
        this.peso = Integer.parseInt(array[3]);
        this.universidade = array[4].isEmpty() ? "nao informado" : array[4];
        this.anoNascimento = Integer.parseInt(array[5]);
        this.cidadeNascimento = array[6].isEmpty() ? "nao informado" : array[6];
        this.estadoNascimento = array[7].isEmpty() ? "nao informado" : array[7];
    }

    public void clone(Jogador j) { // Clonar um jogador
        this.id = j.id;
        this.nome = j.nome;
        this.altura = j.altura;
        this.peso = j.peso;
        this.universidade = j.universidade;
        this.anoNascimento = j.anoNascimento;
        this.cidadeNascimento = j.cidadeNascimento;
        this.estadoNascimento = j.estadoNascimento;
    }

}

public class jogadores {
    public static void main(String[] args) throws IOException {

        /*
         * String[] inputdb = { "1", "104", "1047", "1087", "1124", "119", "1425",
         * "1456", "1487", "149", "1494", "1525",
         * "1565", "1572", "1583", "1702", "1731", "1742", "1748", "1786", "1796",
         * "1809", "1868", "1880", "193",
         * "1998", "2011", "2035", "2083", "217", "2177", "2183", "2203", "228", "401",
         * "412", "448", "479", "53",
         * "533", "557", "627", "687", "721", "797", "812", "848", "950", "98", "FIM",
         * "A.J. Bramlett",
         * "Aaron Williams", "Adrian Smith", "Al Ferrari", "Alec Kessler",
         * "Andy Johnson", "Ariel Maughan",
         * "Art Burris", "Ben McDonald", "Ben Poquette", "Bill Ebben", "Bill Laimbeer",
         * "Bob Kinney",
         * "Bob Schafer", "Bones McKinney", "Carl Shaeffer", "Cheick Diallo",
         * "Chris Harris", "Chris Welp",
         * "Cliff Barker", "Craig Dykema", "Curtis Kitchen", "Damian Jones",
         * "Damjan Rudez", "Darnell Mee",
         * "Darren Tillis", "Darryl Johnson", "Dejounte Murray", "Devin Booker",
         * "Devyn Marble", "Dick Schnittker",
         * "Dijon Thompson", "Donatas Motiejunas", "Ed Dahler", "Eddie Phillips",
         * "Eric Riley", "Frank Johnson",
         * "Frank Selvy", "Gaylon Nickerson", "George Reynolds", "Glenn McDonald",
         * "Harold Pressley",
         * "Hassan Whiteside", "Herb Williams", "Hiram Fuller", "Ira Newble",
         * "Jack George", "Jack Molinas",
         * "James Blackwell", "Jaren Jackson", "Jeff Sanders", "Jeremy Evans",
         * "Jerry Fleishman", "Joe Buckhalter",
         * "Joe Caldwell", "Joe Young", "John Johnson", "John Stroud", "Johnny Jones",
         * "Johnny Orr", "Ken Johnson",
         * "Ken Norman", "Kevin Grevey", "Kevin Willis", "Larry Drew", "Larry Sykes",
         * "Leo Kubiak",
         * "Lionel Chalmers", "Lorenzen Wright", "Luigi Datome", "Luis Flores",
         * "Mamadou N'Diaye", "Marcus Fizer",
         * "Mark Strickland", "Marvin Barnes", "Mason Plumlee", "Michael Phelps",
         * "Michael Stewart", "Mike Davis",
         * "Montrezl Harrell", "Nick Fazekas", "Nikola Vucevic", "Nolan Smith",
         * "Ollie Johnson", "Omri Casspi",
         * "Othello Hunter", "Paul Walther", "Peyton Siva", "Predrag Drobnjak",
         * "Quincy Acy", "Ralph Drollinger",
         * "Robert Horry", "Ron Harper", "Russ Schoene", "Sarunas Marciulionis",
         * "Stephen Thompson",
         * "Thaddeus Young", "Toby Kimball", "Tony Bennett", "Walter Dukes", "FIM" };
         */

        Jogador[] tempPlayers = new Jogador[3923];
        Instant start = Instant.now();
        int count = 0;

        methodToTime();

        BufferedReader br = new BufferedReader(new FileReader("./tmp/players.csv"));
        String str = br.readLine();

        for (int i = 0; i < 3922; i++) {
            str = br.readLine();

            tempPlayers[i] = new Jogador();
            tempPlayers[i].ler(str);
        }
        br.close();

        BufferedReader sc = new BufferedReader(new InputStreamReader(System.in));
        int id;

        LinkedList<Jogador> players = new LinkedList<Jogador>(); // declara um array linkado de jogadores

        // COMENTAR A PARTIR DAQUI PARA USAR NO VERDE
        /*
         * int dbCount = 0;
         * while (!inputdb[dbCount].equals("FIM") && dbCount < inputdb.length) {
         * id = Integer.parseInt(inputdb[dbCount]);
         * 
         * boolean found = false;
         * int i = 0;
         * while (found == false) {
         * if (tempPlayers[i].getId() == id) {
         * players.add(tempPlayers[i]);
         * found = true;
         * }
         * i++;
         * count++;
         * 
         * }
         * dbCount++;
         * 
         * // searchId(id, players);
         * 
         * }
         * 
         * dbCount++;
         * while (!inputdb[dbCount].equals("FIM") && dbCount < inputdb.length) {
         * boolean found = false;
         * for (Jogador player : players) {
         * if (player.getNome().equals(inputdb[dbCount])) {
         * found = true;
         * System.out.println("SIM");
         * }
         * }
         * if (!found) {
         * System.out.println("NAO");
         * }
         * dbCount++;
         * count++;
         * }
         */
        // TERMINAR DE COMENTAR

        // ENTRADA A PARTIR DO TECLADO/TERMINAL ----> USAR NO VERDE!
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
                count++;
            }

            // searchId(id, players);
            entrada = sc.readLine();
        }

        entrada = sc.readLine();
        while (!entrada.equals("FIM")) {
            boolean found = false;
            for (Jogador player : players) {
                if (player.getNome().equals(entrada)) {
                    found = true;
                    System.out.println("SIM");
                }
            }
            if (!found) {
                System.out.println("NAO");
            }
            entrada = sc.readLine();
            count++;
        }

        sc.close();
        Instant finish = Instant.now();
        long timeElapsed = Duration.between(start, finish).toMillis(); // in millis

        wInfo(1445217, timeElapsed, count);
        // System.out.println(count);

    }

    public static void wInfo(int Matricula, float time, int count) {
        try {
            FileWriter myWriter = new FileWriter("./tmp/matrícula_sequencial.txt");
            myWriter.write(Matricula + "\t " + time + "ms\t " + count + "\t");
            myWriter.close();
            // System.out.println("Successfully wrote to the file.");
        } catch (IOException e) {
            System.out.println("An error occurred.");
            e.printStackTrace();
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

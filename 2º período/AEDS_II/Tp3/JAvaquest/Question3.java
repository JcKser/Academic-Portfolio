
import java.util.*;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.io.RandomAccessFile;

class Jogador {
    // atributos
    private int id;
    private String nome;
    private int altura;
    private int peso;
    private String universidade;
    private int anoNasc;
    private String cidadeNasc;
    private String estadoNasc;

    // construtores

    public Jogador() {

    }

    public Jogador(int id, String nome, int altura, int peso, String universidade, int anoNasc, String cidadeNasc,
            String estadoNasc) {
        this.id = id;
        this.nome = nome;
        this.altura = altura;
        this.peso = peso;
        this.universidade = universidade;
        this.anoNasc = anoNasc;
        this.cidadeNasc = cidadeNasc;
        this.estadoNasc = estadoNasc;
    }

    // getters and setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public int getAltura() {
        return altura;
    }

    public void setAltura(int altura) {
        this.altura = altura;
    }

    public int getPeso() {
        return peso;
    }

    public void setPeso(int peso) {
        this.peso = peso;
    }

    public String getUniversidade() {
        return universidade;
    }

    public void setUniversidade(String universidade) {
        this.universidade = universidade;
    }

    public int getAnoNasc() {
        return anoNasc;
    }

    public void setAnoNasc(int anoNasc) {
        this.anoNasc = anoNasc;
    }

    public String getCidadeNasc() {
        return cidadeNasc;
    }

    public void setCidadeNasc(String cidadeNasc) {
        this.cidadeNasc = cidadeNasc;
    }

    public String getEstadoNasc() {
        return estadoNasc;
    }

    public void setEstadoNasc(String estadoNasc) {
        this.estadoNasc = estadoNasc;
    }

    // metodo toString
    public String toString() {
        return "## " + nome + " ## " + altura + " ## " + peso
                + " ## " + anoNasc + " ## " + universidade + " ## "
                + cidadeNasc + " ## " + estadoNasc + " ## ";
    }

    // metodo clone
    public Jogador clone() {
        Jogador JogadorNovo = new Jogador();
        JogadorNovo.id = this.id;
        JogadorNovo.nome = this.nome;
        JogadorNovo.altura = this.altura;
        JogadorNovo.peso = this.peso;
        JogadorNovo.universidade = this.universidade;
        JogadorNovo.anoNasc = this.anoNasc;
        JogadorNovo.cidadeNasc = this.cidadeNasc;
        JogadorNovo.estadoNasc = this.estadoNasc;

        return JogadorNovo;
    }

}

class CelulaDupla {
    public Jogador jogador;
    public CelulaDupla ant;
    public CelulaDupla prox;

    /**
     * Construtor da classe.
     */
    public CelulaDupla() {
        this(null);
    }

    /**
     * Construtor da classe.
     * 
     * @param elemento int inserido na celula.
     */
    public CelulaDupla(Jogador jogador) {
        this.jogador = jogador;
        this.ant = this.prox = null;
    }
}

class ListaDupla {
    private CelulaDupla primeiro;
    private CelulaDupla ultimo;

    /**
     * Construtor da classe que cria uma lista dupla sem elementos (somente no
     * cabeca).
     */
    public ListaDupla() {
        primeiro = new CelulaDupla();
        ultimo = primeiro;
    }

    /**
     * Insere um elemento na primeira posicao da lista.
     * 
     * @param x int elemento a ser inserido.
     */
    public void inserirInicio(Jogador x) {
        CelulaDupla tmp = new CelulaDupla(x);

        tmp.ant = primeiro;
        tmp.prox = primeiro.prox;
        primeiro.prox = tmp;
        if (primeiro == ultimo) {
            ultimo = tmp;
        } else {
            tmp.prox.ant = tmp;
        }
        tmp = null;
    }

    /**
     * Insere um elemento na ultima posicao da lista.
     * 
     * @param x int elemento a ser inserido.
     */
    public void inserirFim(Jogador x) {
        ultimo.prox = new CelulaDupla(x);
        ultimo.prox.ant = ultimo;
        ultimo = ultimo.prox;
    }

    /**
     * Remove um elemento da primeira posicao da lista.
     * 
     * @return resp int elemento a ser removido.
     * @throws Exception Se a lista nao contiver elementos.
     */
    public Jogador removerInicio() throws Exception {
        if (primeiro == ultimo) {
            throw new Exception("Erro ao remover (vazia)!");
        }

        CelulaDupla tmp = primeiro;
        primeiro = primeiro.prox;
        Jogador resp = primeiro.jogador;
        tmp.prox = primeiro.ant = null;
        tmp = null;
        return resp;
    }

    /**
     * Remove um elemento da ultima posicao da lista.
     * 
     * @return resp int elemento a ser removido.
     * @throws Exception Se a lista nao contiver elementos.
     */
    public Jogador removerFim() throws Exception {
        if (primeiro == ultimo) {
            throw new Exception("Erro ao remover (vazia)!");
        }
        Jogador resp = ultimo.jogador;
        ultimo = ultimo.ant;
        ultimo.prox.ant = null;
        ultimo.prox = null;
        return resp;
    }

    /**
     * Insere um elemento em uma posicao especifica considerando que o
     * primeiro elemento valido esta na posicao 0.
     * 
     * @param x   int elemento a ser inserido.
     * @param pos int posicao da insercao.
     * @throws Exception Se <code>posicao</code> invalida.
     */
    public void inserir(Jogador x, int pos) throws Exception {

        int tamanho = tamanho();

        if (pos < 0 || pos > tamanho) {
            throw new Exception("Erro ao inserir posicao (" + pos + " / tamanho = " + tamanho + ") invalida!");
        } else if (pos == 0) {
            inserirInicio(x);
        } else if (pos == tamanho) {
            inserirFim(x);
        } else {
            // Caminhar ate a posicao anterior a insercao
            CelulaDupla i = primeiro;
            for (int j = 0; j < pos; j++, i = i.prox)
                ;

            CelulaDupla tmp = new CelulaDupla(x);
            tmp.ant = i;
            tmp.prox = i.prox;
            tmp.ant.prox = tmp.prox.ant = tmp;
            tmp = i = null;
        }
    }

    /**
     * Remove um elemento de uma posicao especifica da lista
     * considerando que o primeiro elemento valido esta na posicao 0.
     * 
     * @param posicao Meio da remocao.
     * @return resp int elemento a ser removido.
     * @throws Exception Se <code>posicao</code> invalida.
     */
    public Jogador remover(int pos) throws Exception {
        Jogador resp;
        int tamanho = tamanho();

        if (primeiro == ultimo) {
            throw new Exception("Erro ao remover (vazia)!");

        } else if (pos < 0 || pos >= tamanho) {
            throw new Exception("Erro ao remover (posicao " + pos + " / " + tamanho + " invalida!");
        } else if (pos == 0) {
            resp = removerInicio();
        } else if (pos == tamanho - 1) {
            resp = removerFim();
        } else {
            // Caminhar ate a posicao anterior a insercao
            CelulaDupla i = primeiro.prox;
            for (int j = 0; j < pos; j++, i = i.prox)
                ;

            i.ant.prox = i.prox;
            i.prox.ant = i.ant;
            resp = i.jogador;
            i.prox = i.ant = null;
            i = null;
        }

        return resp;
    }

    /**
     * Mostra os elementos da lista separados por espacos.
     */
    public void mostrar() {
        System.out.print("[ "); // Comeca a mostrar.
        for (CelulaDupla i = primeiro.prox; i != null; i = i.prox) {
            System.out.print(i.jogador + " ");
        }
        System.out.println("] "); // Termina de mostrar.
    }
    public void PrintAll() {
        int z = 0;
        for (CelulaDupla i = primeiro.prox; i != null; i = i.prox) {            
            System.out.println("[" + z + "] " + i.jogador.toString());
            z++;
        }
    }

    /**
     * Mostra os elementos da lista de forma invertida
     * e separados por espacos.
     */
    public void mostrarInverso() {
        System.out.print("[ ");
        for (CelulaDupla i = ultimo; i != primeiro; i = i.ant) {
            System.out.print(i.jogador + " ");
        }
        System.out.println("] "); // Termina de mostrar.
    }

    /**
     * Procura um elemento e retorna se ele existe.
     * 
     * @param x Elemento a pesquisar.
     * @return <code>true</code> se o elemento existir,
     *         <code>false</code> em caso contrario.
     */
    public boolean pesquisar(Jogador x) {
        boolean resp = false;
        for (CelulaDupla i = primeiro.prox; i != null; i = i.prox) {
            if (i.jogador == x) {
                resp = true;
                i = ultimo;
            }
        }
        return resp;
    }

    /**
     * Calcula e retorna o tamanho, em numero de elementos, da lista.
     * 
     * @return resp int tamanho
     */
    public int tamanho() {
        int tamanho = 0;
        for (CelulaDupla i = primeiro; i != ultimo; i = i.prox, tamanho++)
            ;
        return tamanho;
    }
}

class Question3 {

    public static boolean isFim(String s) {
        return (s.charAt(0) == 'F' && s.charAt(1) == 'I' && s.charAt(2) == 'M');
    }

    public static void swap(Jogador[] array, int i, int j) {
        Jogador temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }

    public static void sortname(Jogador[] array, int n) {

        for (int i = 0; i < n - 1; i++) {
            int indiceMenor = i;

            for (int j = i + 1; j < n; j++) {
                if (array[j] != null) {
                    if (array[j].getNome().compareTo(array[indiceMenor].getNome()) < 0) {
                        indiceMenor = j;
                    }
                }
            }
            // Troque os array de posição
            Jogador temp = array[i];
            array[i] = array[indiceMenor];
            array[indiceMenor] = temp;
        }

    }

    /*
     * public static void sort(Jogador[] array) {
     * for (int i = 0; i < array.length; i++) {
     * int menor = i;
     * for (int j = (i + 1); j < array.length; j++) {
     * if (array[menor].getNome().compareTo(array[j].getNome()) > 0) {
     * menor = j;
     * }
     * }
     * swap(array, menor, i);
     * }
     * }
     */

    /*
     * public void sort() {
     * for (int i = 0; i < (arrayJog.length - 1); i++) {
     * int menor = i;
     * for (int j = (i + 1); j < arrayJog.length; j++){
     * if (arrayJog[menor].getNome().compareTo(arrayJog[j].getNome()) > 0){
     * menor = j;
     * }
     * }
     * Jogador temp = arrayJog[menor];
     * arrayJog[menor] = arrayJog[i];
     * arrayJog[i] = temp;
     * }
     * }
     */

    public static void main(String[] args) throws Exception {
        String path = "/tmp/players.csv";
        // List<Jogador> jogadores = new ArrayList<Jogador>();
        ListaDupla listaDupla = new ListaDupla();
        Scanner sc = new Scanner(System.in);
        String id = new String();
        Jogador[] arrJogador = new Jogador[3922];
        int aux = 0;
        Jogador[] arrCompleto = new Jogador[3922];
        try (RandomAccessFile br = new RandomAccessFile(path, "r")) {
            String line = br.readLine();
            for (int i = 0; i < arrCompleto.length; i++) {
                line = br.readLine();
                String[] array = line.split(",", -1);
                String nomeJogador = array[1];
                int altura = Integer.parseInt(array[2]);
                int peso = Integer.parseInt(array[3]);
                String faculdade = array[4];
                if (faculdade == "") {
                    faculdade = "nao informado";
                }
                int ano = Integer.parseInt(array[5]);
                String cidade = array[6];
                if (cidade == "") {
                    cidade = "nao informado";
                }
                String estado = array[7];
                if (estado == "") {
                    estado = "nao informado";
                }
                arrCompleto[i] = new Jogador(Integer.parseInt(array[0]), nomeJogador, altura, peso, faculdade, ano,
                        cidade, estado);

            }
            id = sc.nextLine();
            while (!isFim(id)) {// while para resgatar o jogador do array contendo todos os jogadores em ordem
                                // pelo id e inserir ele no inicio da lista
                // id = sc.nextLine();
                Jogador auxi = arrCompleto[Integer.parseInt(id)];
                listaDupla.inserirFim(auxi);
                id = sc.nextLine();
            }

            int n = sc.nextInt();// recebendo a quantidade de operações
            Jogador[] removidos = new Jogador[100];
            int z = 0;

            for (int i = 0; i <= n; i++) {// iterando as quantidades de operações
                String linha = sc.nextLine();
                String[] arrLinha = linha.split(" ");
                if ("II".equals(arrLinha[0])) {
                    int idJogador = Integer.parseInt(arrLinha[1]);
                    Jogador auxi = arrCompleto[idJogador];
                    listaDupla.inserirInicio(auxi);

                } else if ("IF".equals(arrLinha[0])) {
                    int idJogador = Integer.parseInt(arrLinha[1]);
                    Jogador auxi = arrCompleto[idJogador];
                    listaDupla.inserirFim(auxi);
                } else if ("R*".equals(arrLinha[0])) {
                    int pos = Integer.parseInt(arrLinha[1]);
                    removidos[z++] = listaDupla.remover(pos);
                } else if ("RI".equals(arrLinha[0])) {
                    removidos[z++] = listaDupla.removerInicio();
                } else if ("RF".equals(arrLinha[0])) {
                    removidos[z++] = listaDupla.removerFim();
                } else if ("I*".equals(arrLinha[0])) {
                    int pos = Integer.parseInt(arrLinha[1]);
                    int idJogador = Integer.parseInt(arrLinha[2]);
                    Jogador auxi = arrCompleto[idJogador];
                    listaDupla.inserir(auxi,pos);
                }
            }
            for (int i = 0; i < removidos.length && removidos[i] != null; i++) {
                System.out.println("(R) " + removidos[i].getNome());
            }
            listaDupla.PrintAll();

        } catch (IOException e) {
            System.out.println("ERRO: " + e.getMessage());
        }
        sc.close();
    }

}

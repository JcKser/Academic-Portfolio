import java.util.*;
import java.io.*;

class Global {
    public static final int comparacoes = 0;

}

class Jogador {
    private int id;
    private String nome;
    private int altura;
    private int peso;
    private String universidade;
    private int anoNascimento;
    private String cidadeNascimento;
    private String estadoNascimento;

    public void status() {
        MyIO.println("[" + this.getId() + " ## " + this.getNome() + " ## " + this.getAltura() + " ## " + this.getPeso()
                + " ## " + this.getAnoNascimento() + " ## " + this.getUniversidade() + " ## "
                + this.getCidadeNascimento() + " ## " + this.getEstadoNascimento() + "]");
    }

    public void define(int id, String nome, int altura, int peso, String universidade, int ano, String cidade,
            String estado) {
        this.setId(id);
        this.setNome(nome);
        this.setAltura(altura);
        this.setPeso(peso);
        this.setUniversidade(universidade);
        this.setAnoNascimento(ano);
        this.setCidadeNascimento(cidade);
        this.setEstadoNascimento(estado);

    }

    // --------------------[CONSTRUCT]--------------------
    public Jogador() {
        this.setId(0);
        this.setNome("nao informado");
        this.setAltura(0);
        this.setPeso(0);
        this.setUniversidade("nao informado");
        this.setAnoNascimento(0);
        this.setCidadeNascimento("nao informado");
        this.setEstadoNascimento("nao informado");
    }

    // -------------------------------------------------------[GET E SET]
    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    // -------------------------------------------------------[GET E SET]

    public void setNome(String nome) {
        if (nome != null)
            this.nome = nome;
    }

    public String getNome() {
        return nome;
    }

    // -------------------------------------------------------[GET E SET]

    public void setAltura(int altura) {
        this.altura = altura;
    }

    public int getAltura() {
        return altura;
    }

    // -------------------------------------------------------[GET E SET]

    public void setPeso(int peso) {
        this.peso = peso;
    }

    public int getPeso() {
        return peso;
    }

    // -------------------------------------------------------[GET E SET]

    public void setUniversidade(String universidade) {
        if (universidade != "")
            this.universidade = universidade;
    }

    public String getUniversidade() {
        return universidade;
    }

    // -------------------------------------------------------[GET E SET]

    public void setAnoNascimento(int anoNascimento) {
        this.anoNascimento = anoNascimento;
    }

    public int getAnoNascimento() {
        return anoNascimento;
    }

    // -------------------------------------------------------[GET E SET]

    public void setCidadeNascimento(String cidadeNascimento) {
        if (cidadeNascimento != "")
            this.cidadeNascimento = cidadeNascimento;
    }

    public String getCidadeNascimento() {
        return cidadeNascimento;
    }

    // -------------------------------------------------------[GET E SET]

    public void setEstadoNascimento(String estadoNascimento) {
        if (estadoNascimento != "")
            this.estadoNascimento = estadoNascimento;
    }

    public String getEstadoNascimento() {
        return estadoNascimento;
    }

    public Jogador ler(String id) {
        Jogador x = null;
        try {
            BufferedReader br = new BufferedReader(new FileReader("/tmp/players.csv")); // leitura do arquivo
            String line; // string que recebe cada linha do arquivo
            int i = 0;
            while (((line = br.readLine()) != null) && i == 0) // enquanto nao chegar no fim do arquivo
            {
                String[] data = line.split(",", -1); // separa os dados da linha em um array de strings
                if (data.length < 8) // se a linha nao tiver todos os dados, pula para a proxima
                {
                    continue;
                }
                if (data[0].equals(id)) // se o id do jogador for igual ao id passado como parametro, escreve os dados
                                        // no objeto
                {
                    x = new Jogador(); // cria um novo objeto
                    int idInt = Integer.parseInt(data[0]);
                    String nome = data[1];
                    int altura = Integer.parseInt(data[2]);
                    int peso = Integer.parseInt(data[3]);
                    String universidade = data[4];
                    int ano = Integer.parseInt(data[5]);
                    String cidade = data[6];
                    String estado = data[7];

                    x.define(idInt, nome, altura, peso, universidade, ano, cidade, estado);

                    i = 1;
                }
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        return x;
    }

    // ----------------[CLONE]--------------------
    public Jogador clone() {
        Jogador clonado = new Jogador();
        clonado.id = this.id;
        clonado.nome = this.nome;
        clonado.altura = this.altura;
        clonado.peso = this.peso;
        clonado.universidade = this.universidade;
        clonado.anoNascimento = this.anoNascimento;
        clonado.cidadeNascimento = this.cidadeNascimento;
        clonado.estadoNascimento = this.estadoNascimento;

        return clonado;
    }

}

class No {
    public No esq;
    public Jogador thisJ;
    public No dir;
    boolean cor;

    No() {
        this(null);
    }

    No(Jogador thisJ) {
        this(null, thisJ, null, true);
    }

    No(Jogador thisJ, boolean cor) {
        this(null, thisJ, null, cor);
    }

    No(No esq, Jogador thisJ, No dir) {
        this(null, thisJ, null, true);
    }

    No(No esq, Jogador thisJ, No dir, boolean cor) {
        this.esq = esq;
        this.thisJ = thisJ;
        this.dir = dir;
        this.cor = cor;
    }

    public No clone() {
        return new No(esq, thisJ, dir, cor);
    }
}

class ArvoreAN {
    No raiz;

    ArvoreAN() {
        raiz = null;
    }

    No rotacaoEsq(No no) {
        No tmpDirEsq = no.dir.esq;
        no.dir.esq = no;
        no = no.dir;
        no.esq.dir = tmpDirEsq;
        return no;
    }

    No rotacaoDir(No no) {
        No tmpEsqDir = no.esq.dir;
        no.esq.dir = no;
        no = no.esq;
        no.dir.esq = tmpEsqDir;
        return no;
    }

    boolean isNoTipoQuatro(No no) {
        return (no.esq != null && no.esq.cor == true && no.dir != null && no.dir.cor == true);
    }

    public void insert(Jogador add) throws Exception {

        if (raiz == null) {
            raiz = new No(add);
        } else if (raiz.esq == null && raiz.dir == null) {
            int comp = add.getNome().compareTo(raiz.thisJ.getNome());
            if (comp < 0) {
                raiz.esq = new No(add, false);
            } else if (comp > 0) {
                raiz.dir = new No(add, false);
            } else {
                throw new Exception("Erro: jogador existente");
            }

        } else if (raiz.esq == null) {
            int comp = add.getNome().compareTo(raiz.thisJ.getNome());
            if (comp < 0) {
                raiz.esq = new No(add, false);
            } else if (comp > 0) {
                int compFilho = add.getNome().compareTo(raiz.dir.thisJ.getNome());
                No tmp;

                if (compFilho < 0)
                    tmp = new No(raiz, add, raiz.dir, false);
                else if (compFilho > 0)
                    tmp = new No(raiz, raiz.dir.thisJ, new No(add), false);
                else
                    throw new Exception("Erro: jogador existente");

                raiz = tmp;
                tmp = null;
                raiz.esq.esq = raiz.esq.dir = raiz.dir.esq = raiz.dir.dir = null;
            } else {
                throw new Exception("Erro: jogador existente");
            }

        } else if (raiz.dir == null) {
            int comp = add.getNome().compareTo(raiz.thisJ.getNome());
            if (comp > 0) {
                raiz.dir = new No(add, false);
            } else if (comp < 0) {
                int compFilho = add.getNome().compareTo(raiz.esq.thisJ.getNome());
                No tmp;
                if (compFilho < 0)
                    tmp = new No(new No(add), raiz.esq.thisJ, raiz, false);
                else if (compFilho > 0)
                    tmp = new No(raiz.esq, add, raiz, false);
                else
                    throw new Exception("Erro: jogador existente");

                raiz = tmp;
                tmp = null;
                raiz.esq.esq = raiz.esq.dir = raiz.dir.esq = raiz.dir.dir = null;
            } else {
                throw new Exception("Erro: jogador existente");
            }

        } else {
            insert(null, null, null, raiz, add);
        }
        raiz.cor = false;

    }

    private void balancear(No bisavo, No avo, No pai, No filho) {
        if (pai.cor == true) {

            if (pai.thisJ.getNome().compareTo(avo.thisJ.getNome()) > 0) {
                if (filho.thisJ.getNome().compareTo(pai.thisJ.getNome()) > 0) {
                    avo = rotacaoEsq(avo);
                } else {
                    avo.dir = rotacaoDir(avo.dir);
                    avo = rotacaoEsq(avo);
                }

            } else {
                if (filho.thisJ.getNome().compareTo(pai.thisJ.getNome()) < 0) {
                    avo = rotacaoDir(avo);
                } else {
                    avo.esq = rotacaoEsq(avo.esq);
                    avo = rotacaoDir(avo);
                }
            }

            if (bisavo == null)
                raiz = avo;
            else if (avo.thisJ.getNome().compareTo(bisavo.thisJ.getNome()) < 0)
                bisavo.esq = avo;
            else
                bisavo.dir = avo;

            avo.cor = false;
            avo.esq.cor = avo.dir.cor = true;
        }
    }

    private void insert(No bisavo, No avo, No pai, No filho, Jogador add) throws Exception {
        if (filho == null) {
            int comp = add.getNome().compareTo(pai.thisJ.getNome());
            if (comp < 0)
                filho = pai.esq = new No(add, true);
            else if (comp > 0)
                filho = pai.dir = new No(add, true);
            else
                throw new Exception("Erro: jogador existente");

            if (pai.cor == true) {
                balancear(bisavo, avo, pai, filho);
            }
        } else {
            if (isNoTipoQuatro(filho)) {
                filho.cor = true;
                filho.esq.cor = filho.dir.cor = false;
                if (filho == raiz) {
                    filho.cor = false;
                } else if (pai.cor == true) {
                    balancear(bisavo, avo, pai, filho);
                }
            }
            int comp = add.getNome().compareTo(filho.thisJ.getNome());
            if (comp < 0) {
                insert(avo, pai, filho, filho.esq, add);
            } else if (comp > 0) {
                insert(avo, pai, filho, filho.dir, add);
            } else {
                throw new Exception("Erro: jogador existente");
            }
        }
    }

    public boolean search(String nome) {
        No pesquisa = raiz;
        boolean resultado = false;

        System.out.print("raiz ");
        while (pesquisa != null) {
            int comp = nome.compareTo(pesquisa.thisJ.getNome());
            if (comp < 0) {
                System.out.print("esq ");
                pesquisa = pesquisa.esq;
            } else if (comp > 0) {
                System.out.print("dir ");
                pesquisa = pesquisa.dir;
            } else {
                pesquisa = null;
                resultado = true;
            }
        }

        return resultado;
    }

}

public class Questao04 {

    public static void main(String[] args) {
        File arq = new File("1445217_avinegra.txt");
        String pubin = MyIO.readLine();
        try {
            ArvoreAN tree = new ArvoreAN();

            while (!pubin.equals("FIM")) {
                Jogador jogador = new Jogador();
                jogador = jogador.ler(pubin);
                tree.insert(jogador);
                pubin = MyIO.readLine();
            }

            long inicio = new Date().getTime();// marca a hora de finalização

            pubin = MyIO.readLine();
            while (!pubin.equals("FIM")) {
                System.out.print(pubin + " ");
                if (tree.search(pubin) == true) {
                    System.out.print("SIM\n");
                } else {
                    System.out.print("NAO\n");
                }
                pubin = MyIO.readLine();
            }
            long fim = new Date().getTime();// marca a hora de finalização
            long execucao = fim - inicio;

            try {
                FileWriter fw = new FileWriter(arq);
                fw.write("Matrícula: 1445217 |" + "\tTempo: " + execucao / 1000f + "s |" + " \tComparações: "+ Global.comparacoes);
                fw.close();
            } catch (IOException e) {
                e.printStackTrace();
            }

        } catch (Exception e) {
            MyIO.println("Um erro ocorreu: " + e.getMessage());
        }
    }

}

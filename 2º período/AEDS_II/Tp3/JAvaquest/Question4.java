import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Pattern;

class Question4{

    private int id;
    private String nome;
    private int altura;
    private int peso;
    private String universidade;
    private int anoNascimento;
    private String cidadeNascimento;
    private String estadoNascimento;

    public Question4() {

    }

    public Question4(int id, String nome, int altura, int peso, String universidade, int anoNascimento,
            String cidadeNascimento, String estadoNascimento) {
        this.id = id;
        this.nome = nome;
        this.altura = altura;
        this.peso = peso;
        this.universidade = universidade;
        this.anoNascimento = anoNascimento;
        this.cidadeNascimento = cidadeNascimento;
        this.estadoNascimento = estadoNascimento;
    }

    public Question4(int id) {
        this.id = id;
        this.nome = "Não informado";
        this.altura = 0;
        this.peso = 0;
        this.universidade = "Não informado";
        this.anoNascimento = 0;
        this.cidadeNascimento = "Não informado";
        this.estadoNascimento = "Não informado";
    }

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

    public int getAnoNascimento() {
        return anoNascimento;
    }

    public void setAnoNascimento(int anoNascimento) {
        this.anoNascimento = anoNascimento;
    }

    public String getCidadeNascimento() {
        return cidadeNascimento;
    }

    public void setCidadeNascimento(String cidadeNascimento) {
        this.cidadeNascimento = cidadeNascimento;
    }

    public String getEstadoNascimento() {
        return estadoNascimento;
    }

    public void setEstadoNascimento(String estadoNascimento) {
        this.estadoNascimento = estadoNascimento;
    }

    public void imprimir() {
        System.out.println("[" + id + " ## " + nome + " ## " + altura + " ## " + peso + " ## " +
                anoNascimento + " ## " + universidade + " ## " + cidadeNascimento + " ## " +
                estadoNascimento + "]");
    }

    public void ler(String nomeDoArquivo, Map<Integer, Question4> mapper) throws Exception {
        FileReader file = new FileReader(nomeDoArquivo);
        BufferedReader buffer = new BufferedReader(file);

        String line = buffer.readLine();
        String player[] = new String[10];

        while (line != null) {
            line = buffer.readLine();
            if (line == null) {
                break;
            }
            player = line.split(Pattern.quote(","));

            Question4 Question4 = new Question4();
            Question4.setId(Integer.parseInt(player[0]));

            Question4.setNome(player.length > 1 && !player[1].isEmpty() ? player[1] : "nao informado");
            Question4.setAltura(player.length > 2 && !player[2].isEmpty() ? Integer.parseInt(player[2]) : 0);
            Question4.setPeso(player.length > 3 && !player[3].isEmpty() ? Integer.parseInt(player[3]) : 0);
            Question4.setUniversidade(player.length > 4 && !player[4].isEmpty() ? player[4] : "nao informado");

            try {
                Question4.setAnoNascimento(player.length > 5 && !player[5].isEmpty() ? Integer.parseInt(player[5]) : 0);
                Question4.setCidadeNascimento(player.length > 6 && !player[6].isEmpty() ? player[6] : "nao informado");
                Question4.setEstadoNascimento(player.length > 7 && !player[7].isEmpty() ? player[7] : "nao informado");
            } catch (NumberFormatException e) {
                String str = "";
                str += player[4];
                str += ", ";
                if (player.length > 5 && !player[5].isEmpty()) {
                    str += player[5];
                } else {
                    str += "";
                }
                Question4.setUniversidade(str);
                Question4.setAnoNascimento(player.length > 6 && !player[6].isEmpty() ? Integer.parseInt(player[6]) : 0);
                Question4.setCidadeNascimento(player.length > 7 && !player[7].isEmpty() ? player[7] : "nao informado");
                Question4.setEstadoNascimento(player.length > 8 && !player[8].isEmpty() ? player[8] : "nao informado");
            }

            mapper.put(Question4.getId(), Question4);
        }
        buffer.close();
    }

     public static void main(String[] args) {
        try {
            Question4 Question4 = new Question4();
            Pilha pilha = new Pilha();
            Map<Integer, Question4> mapper = new HashMap<Integer, Question4>();
            Question4.ler("/tmp/players.csv", mapper);

            Scanner sc = new Scanner(System.in);
            String entrada = "";

            while (true) {
                entrada = sc.nextLine();
                if(entrada.equals("FIM")) break;
                pilha.inserir(mapper.get(Integer.parseInt(entrada)));
            }

            int number = Integer.parseInt(sc.nextLine());

            for(int i = 0; i < number; i++){
                entrada = sc.nextLine();
                String[] metodo = entrada.split(" ");
                switch(metodo[0]){
                    case "I":
                        pilha.inserir(mapper.get(Integer.parseInt(metodo[1])));
                        break;
                    case "R":
                        Question4 removido = pilha.remover();
                        System.out.println("(R) " + removido.getNome());
                        break;
                }
            }
            pilha.mostrar();
            sc.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}

class Pilha {
    public Celula topo;
    public Celula fim;

    public Pilha(){
        topo = null;
    }

    public void inserir(Question4 Question4){
        Celula tmp = new Celula(Question4);
        if(topo == null){
            topo = tmp;
            fim = tmp;
            return;
        }
        Celula ponteiro = topo;

        while(ponteiro.prox != null){
            ponteiro = ponteiro.prox;
        }
        ponteiro.prox = tmp;
        fim = tmp;
    }

    public Question4 remover() throws Exception {
        if (topo == null) {
            throw new Exception("Pilha vazia!");
        }

        Question4 removido = fim.elemento;

        if (topo == fim) {
            topo = null;
            fim = null;
        } else {
            Celula ponteiro = topo;
            while (ponteiro.prox != fim) {
                ponteiro = ponteiro.prox;
            }
            ponteiro.prox = null;
            fim = ponteiro;
        }

        return removido;
    }


    public void mostrar(){
        int index = 0;
        for (Celula i = topo; i != null; i = i.prox) {
            System.out.println("[" + index + "] ## " + i.elemento.getNome() + " ## " + i.elemento.getAltura() + " ## " + i.elemento.getPeso() + " ## " +
                i.elemento.getAnoNascimento() + " ## " + i.elemento.getUniversidade() + " ## " + i.elemento.getCidadeNascimento() + " ## " +
                i.elemento.getEstadoNascimento() + " ##");
            index++;
        }
    }

}

class Celula {
    public Question4 elemento;
    public Celula prox;

    public Celula(){
        this(null);
    }

    public Celula(Question4 elemento){
        this.elemento = elemento;
        this.prox = null;
    }
}
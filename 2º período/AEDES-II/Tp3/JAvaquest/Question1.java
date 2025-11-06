package JAvaquest;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.regex.Pattern;

public class Question1 {

    public static void main(String[] args) {
        try {
            Question1 Question1 = new Question1();
            Lista lista = new Lista();
            Map<Integer, Question1> mapper = new HashMap<Integer, Question1>();
            Question1.ler("/tmp/players.csv", mapper);

            Scanner sc = new Scanner(System.in);
            String entrada = "";

            while (true) {
                entrada = sc.nextLine();
                if(entrada.equals("FIM")) break;
                lista.inserirFim(mapper.get(Integer.parseInt(entrada)));
            }

            int number = Integer.parseInt(sc.nextLine());

            for(int i = 0; i < number; i++){
                entrada = sc.nextLine();
                String[] metodo = entrada.split(" ");
                switch(metodo[0]){
                    case "II":
                        lista.inserirInicio(mapper.get(Integer.parseInt(metodo[1])));
                        break;
                    case "IF":
                        lista.inserirFim(mapper.get(Integer.parseInt(metodo[1])));
                        break;
                    case "I*":
                        lista.inserir(mapper.get(Integer.parseInt(metodo[2])), Integer.parseInt(metodo[1]));
                        break;
                    case "RI":
                        System.out.println("(R) " + lista.removerInicio().getNome());
                        break;
                    case "RF":
                        System.out.println("(R) " + lista.removerFim().getNome());
                        break;
                    case "R*":
                        System.out.println("(R) " + lista.remover(Integer.parseInt(metodo[1])).getNome());
                        break;
                }
            }
            lista.mostrar();
            sc.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private int id;
    private String nome;
    private int altura;
    private int peso;
    private String universidade;
    private int anoNascimento;
    private String cidadeNascimento;
    private String estadoNascimento;

    public Question1() {

    }

    public Question1(int id, String nome, int altura, int peso, String universidade, int anoNascimento,
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

    public Question1(int id) {
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

    protected Question1 clone() throws CloneNotSupportedException {
        Question1 novo = new Question1();
        novo.id = this.id;
        novo.altura = this.altura;
        novo.peso = this.peso;
        novo.universidade = this.universidade;
        novo.anoNascimento = this.anoNascimento;
        novo.cidadeNascimento = this.cidadeNascimento;
        novo.estadoNascimento = this.estadoNascimento;
        return novo;
    }

    public void ler(String nomeDoArquivo, Map<Integer, Question1> mapper) throws Exception {
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

            Question1 Question1 = new Question1();
            Question1.setId(Integer.parseInt(player[0]));

            Question1.setNome(player.length > 1 && !player[1].isEmpty() ? player[1] : "nao informado");
            Question1.setAltura(player.length > 2 && !player[2].isEmpty() ? Integer.parseInt(player[2]) : 0);
            Question1.setPeso(player.length > 3 && !player[3].isEmpty() ? Integer.parseInt(player[3]) : 0);
            Question1.setUniversidade(player.length > 4 && !player[4].isEmpty() ? player[4] : "nao informado");

            try {
                Question1.setAnoNascimento(player.length > 5 && !player[5].isEmpty() ? Integer.parseInt(player[5]) : 0);
                Question1.setCidadeNascimento(player.length > 6 && !player[6].isEmpty() ? player[6] : "nao informado");
                Question1.setEstadoNascimento(player.length > 7 && !player[7].isEmpty() ? player[7] : "nao informado");
            } catch (NumberFormatException e) {
                String str = "";
                str += player[4];
                str += ", ";
                if (player.length > 5 && !player[5].isEmpty()) {
                    str += player[5];
                } else {
                    str += "";
                }
                Question1.setUniversidade(str);
                Question1.setAnoNascimento(player.length > 6 && !player[6].isEmpty() ? Integer.parseInt(player[6]) : 0);
                Question1.setCidadeNascimento(player.length > 7 && !player[7].isEmpty() ? player[7] : "nao informado");
                Question1.setEstadoNascimento(player.length > 8 && !player[8].isEmpty() ? player[8] : "nao informado");
            }

            mapper.put(Question1.getId(), Question1);
        }
        buffer.close();
    }
}

class Lista {
    Question1[] array;
    int n;

    Lista() {
        this(3923);
    }

    Lista(int tamanho) {
        array = new Question1[tamanho];
        n = 0;
    }

    void inserirInicio(Question1 Question1) throws Exception{
        if( n >= array.length )
            throw new Exception("Erro!");
        
        for(int i = n; i > 0; i--){
            array[i] = array[i-1];
        }

        array[0] = Question1;
        n++;
    }

    void inserirFim(Question1 Question1) throws Exception{
        if( n >= array.length )
            throw new Exception("Erro!");

        array[n] = Question1;
        n++;
    }

    void inserir(Question1 Question1, int pos) throws Exception{
        if( n >= array.length || pos < 0 || pos > n)
            throw new Exception("Erro!");

        for(int i = n; i > pos; i--){
            array[i] = array[i-1];
        }

        array[pos] = Question1;
        n++;
    }

    Question1 removerInicio() throws Exception{
        if(n == 0) 
            throw new Exception("Erro!");

        Question1 resp = array[0];
        n--;

        for(int i = 0; i < n; i++){
            array[i] = array[i + 1];
        }

        return resp;
    }

    Question1 removerFim() throws Exception{
        if(n == 0) 
            throw new Exception("Erro!");

        return array[--n];
    }

    Question1 remover(int pos) throws Exception{
        if(n == 0 || pos < 0 || pos >= n) 
            throw new Exception("Erro!");

        Question1 resp = array[pos];
        n--;

        for(int i = pos; i < n; i++){
            array[i] = array[i + 1];
        }

        return resp;
    }

    void mostrar(){
        for(int i = 0; i < n; i++){
            System.out.println("["+ i + "]" + " ## " + array[i].getNome() + " ## " + array[i].getAltura() + " ## " + array[i].getPeso() + " ## " +
                array[i].getAnoNascimento() + " ## " + array[i].getUniversidade() + " ## " + array[i].getCidadeNascimento() + " ## " +
                array[i].getEstadoNascimento() + " ##");
        }
    }
}
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Scanner;

class Celula {
    Jogador elemento;
    Celula prox;

    Celula() {
        prox = null;
    }

    Celula(Jogador x) {
        elemento = x;
        prox = null;
    }


    public Jogador getElemento() {
        return this.elemento;
    }

    public void setElemento(Jogador elemento) {
        this.elemento = elemento;
    }

    public Celula getProx() {
        return this.prox;
    }

    public void setProx(Celula prox) {
        this.prox = prox;
    }

}

class Lista {
  Celula inicio, fim;
    int tam = 0;

    Lista() {
        inicio = fim = null;
    }

    void insereInicio(Jogador x) {
        if (inicio == null) {
            inicio = new Celula(x);
            fim = inicio;
        } 
        else {
            Celula aux = new Celula(x);
            aux.setProx(inicio);
            inicio = aux;
        }
        tam++;
    }

    void inserirFim(Jogador x) {
        Celula tmp = inicio;
        if (inicio == null) {
            inicio = new Celula(x);
            fim = inicio;
        } else {
            while (tmp.getProx() != null) {
            tmp = tmp.getProx();
            }
            Celula aux = new Celula(x);
            tmp.setProx(aux);
            fim = aux;
            tmp = null;
        }
        
        tam++;
    }

    void inserirPos(Jogador x, int pos) throws NullPointerException {
        if (pos == 0) insereInicio(x);
        else if (pos == tam-1) inserirFim(x);
        else if (pos < 0 || pos >= tam) throw new NullPointerException("Posição inválida");
        else {
            Celula tmp = inicio;
            for (int i = 0; i < pos; i++) {
                tmp = tmp.getProx();
            }

            Celula aux = new Celula(x);
            aux.setProx(tmp.getProx());
            tmp.setProx(aux);
            tam++;
        }
    }

    Jogador removerInicio() throws NullPointerException {
        Jogador elemento;
        if (inicio == null) throw new NullPointerException("Lista vazia");
        else {
            elemento = inicio.getElemento();
            inicio = inicio.getProx();
        }
        tam--;
        return elemento;
    }

    Jogador removerFim() throws NullPointerException {
        Jogador elemento;
        if (inicio == null) throw new NullPointerException("Lista vazia");
        else {
            Celula tmp = inicio;
            while(tmp.getProx().getProx() != null) {
                tmp = tmp.getProx();
            }
            elemento = tmp.getProx().getElemento();
            fim = tmp;
            tmp.setProx(null);
        }
        tam--;
        return elemento;
    }

    Jogador removerPos(int pos) throws NullPointerException {

        if (inicio == null) throw new NullPointerException("Lista vazia");
        else if (pos == 0) removerInicio();
        else if (pos == tam-1) removerFim();
        else {
            Celula aux = inicio;
            for (int i = 1; i < pos; i++) {
                aux = aux.getProx();
            }
            Jogador elemento = aux.getProx().getElemento();
            aux.setProx(aux.getProx().getProx());
            return elemento;
        }
        return null;
    }

    void mostrar() {
      Celula aux = inicio;
      while (aux != null) {
        aux.getElemento().imprime();
        aux = aux.getProx();
      }
    }

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

  public Jogador() {
    this.id = -1;
    this.nome = "";
    this.altura = -1;
    this.peso = -1;
    this.universidade = "";
    this.anoNascimento = -1;
    this.cidadeNascimento = "";
    this.estadoNascimento = "";
  }

  public Jogador(
    int id,
    String nome,
    int altura,
    int peso,
    String universidade,
    int anoNascimento,
    String cidadeNascimento,
    String estadoNascimento
  ) {
    this.id = id;
    this.nome = nome;
    this.altura = altura;
    this.peso = peso;
    this.universidade = universidade;
    this.anoNascimento = anoNascimento;
    this.cidadeNascimento = cidadeNascimento;
    this.estadoNascimento = estadoNascimento;
  }

  public int getId() {
    return id;
  }

  public String getNome() {
    return nome;
  }

  public int getAltura() {
    return altura;
  }

  public int getPeso() {
    return peso;
  }

  public String getUniversidade() {
    return universidade;
  }

  public int getAnoNascimento() {
    return anoNascimento;
  }

  public String getCidadeNascimento() {
    return cidadeNascimento;
  }

  public String getEstadoNascimento() {
    return estadoNascimento;
  }

  public void setId(int id) {
    this.id = id;
  }

  public void setId(String id) {
    int convertedId = id.equals("nao informado") ? -1 : Integer.parseInt(id);
    setId(convertedId);
  }

  public void setNome(String nome) {
    this.nome = nome;
  }

  public void setAltura(int altura) {
    this.altura = altura;
  }

  public void setAltura(String altura) {
    int convertedAltura = altura.equals("nao informado") ? 0 : Integer.parseInt(altura);
    setAltura(convertedAltura);
  }

  public void setPeso(int peso) {
    this.peso = peso;
  }

  public void setPeso(String peso) {
    int convertedPeso = peso.equals("nao informado") ? 0 : Integer.parseInt(peso);
    setPeso(convertedPeso);
  }

  public void setUniversidade(String universidade) {
    this.universidade = universidade;
  }

  public void setAnoNascimento(int anoNascimento) {
    this.anoNascimento = anoNascimento;
  }

  public void setAnoNascimento(String anoNascimento) {
    int convertedAnoNascimento = anoNascimento.equals("nao informado") ? 0 : Integer.parseInt(anoNascimento);
    setAnoNascimento(convertedAnoNascimento);
  }

  public void setCidadeNascimento(String cidadeNascimento) {
    this.cidadeNascimento = cidadeNascimento;
  }

  public void setEstadoNascimento(String estadoNascimento) {
    this.estadoNascimento = estadoNascimento;
  }

  public Jogador clone() throws CloneNotSupportedException {
    Jogador clone = new Jogador();
    clone.nome = this.nome;
    clone.altura = this.altura;
    clone.peso = this.peso;
    clone.universidade = this.universidade;
    clone.anoNascimento =this.anoNascimento;
    clone.cidadeNascimento =this.cidadeNascimento;
    clone.estadoNascimento =this.estadoNascimento;
    return clone;

  }

  public void ler(String data) {
    String newData = "";
    if (data != null) {
      int aux = data.length();
      for(int j = 0; j < aux; j++) {
        char letter = data.charAt(j);
        char letter2 = (j + 1 == data.length()) ? ' ' : data.charAt(j + 1);
        if(letter == ',' && letter2 == ',') {
          newData += ",nao informado";
        } else {
          if (j == data.length() - 1 && letter == ',' ) {
            newData += ",nao informado";
          } else {
            newData += letter;
          }
        }
      }
      String[] infos = newData.split(",");
      this.setId(infos[0]);
      this.setNome(infos[1]);
      this.setAltura(infos[2]);
      this.setPeso(infos[3]);
      this.setUniversidade(infos[4]);
      this.setAnoNascimento(infos[5]);
      this.setCidadeNascimento(infos[6]);
      this.setEstadoNascimento(infos[7]);

    }
  }

  public void imprime() {
    System.out.println(
      "[" +
      id +
      " ## " +
      nome +
      " ## " +
      altura +
      " ## " +
      peso +
      " ## " +
      anoNascimento +
      " ## " +
      universidade +
      " ## " +
      cidadeNascimento +
      " ## " +
      estadoNascimento +
      "]"
    );
  }
}


class Tp11 {

  static int comp = 0;
  static int mov = 0;

  public static void criarArq(long temp) throws IOException { 
    File log = new File("/tmp/811694_quicksort.txt");
      FileWriter write = new FileWriter(log);
      write.write("811694" + '\t' + temp + '\t' + comp + '\t' + mov);
      write.close();
  }

  public static void swap(int a, int b, Jogador[] array) {
    mov+=3;
    Jogador temp = array[a];
    array[a] = array[b];
    array[b] = temp;
  }

  public static int compara(Jogador i, Jogador pivo, Jogador[] array) {

    int estadoComp = i.getEstadoNascimento().compareTo(pivo.getEstadoNascimento());
    comp++;
    
    if (estadoComp == 0) {
       
        return i.getNome().compareTo(pivo.getNome());
    } 

    return estadoComp;
    
  }


  public static void quicksort(int esq, int dir, Jogador[] array) {
    int i = esq, j = dir; 
    int meio = (esq + dir) / 2;
    Jogador pivo = array[meio];
    
    while (i <= j) {
        comp++;
        while (compara(array[i], pivo, array) < 0) {
            comp++;
            i++;
        }
        while (compara(array[j], pivo, array) > 0) {
            comp++;
            j--;
        }
        if (i <= j) {
            comp++;
            swap (i, j, array);
             i++;
             j--;
        }
    }
    
    if (esq < j) {
        quicksort(esq, j, array);
    }
    if (i < dir) {
        quicksort(i, dir, array);
    } 
  }



  public static String[] lerArq(String path) {
    File file = new File(path);
    String[] arrData = new String[3922];
    int i = 0;
    try {
      Scanner scanner = new Scanner(file);
      scanner.nextLine();
      while (scanner.hasNext()) {
        arrData[i] = scanner.nextLine();
        i++;
      }
      scanner.close();
    } catch (FileNotFoundException e) {
      System.out.println("Arquivo não encontrado: " + e.getMessage());
    }
    return arrData;
  }

  public static void main(String[] args) {
    String[] arrData = lerArq("/tmp/players.csv");
    Jogador[] jogadorData = new Jogador[arrData.length];
    Jogador[] arrayOrdena = new Jogador[470];
    int cont = 0;

    for(int i = 0; i < arrData.length; i++) {
      String data = arrData[i];
      Jogador jogador = new Jogador();
      jogador.ler(data);
      jogadorData[i] = jogador;
    }

    Scanner teclado = new Scanner(System.in);

    while (!teclado.hasNext("FIM")) {
      int aux = teclado.nextInt();
      arrayOrdena[cont] = jogadorData[aux];
      cont++;
    }

    Lista lista = new Lista();
    

      long startTime = System.currentTimeMillis();
      quicksort(0, cont-1, arrayOrdena);
      long endTime = System.currentTimeMillis();
      long executionTime = endTime - startTime;

      try {
        criarArq(executionTime);
      } catch (IOException e) {
        System.out.println("Erro aqui: " + e);
      }

      for (int i = 0; i < cont; i++) {
        lista.inserirFim(arrayOrdena[i]);
      }

      lista.mostrar();

      teclado.close();
  }
}




import java.util.Scanner;

public class ExemploArrays {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        double somaNotas = 0;
        int quantidadeAlunos = 5;
        Aluno[] alunos = new Aluno[quantidadeAlunos];

        // Ler as notas e nomes dos alunos
        for (int i = 0; i < quantidadeAlunos; i++) {
            System.out.print("Digite o nome do aluno " + (i + 1) + ": ");
            String nome = scanner.nextLine();
            System.out.print("Digite a nota do aluno " + (i + 1) + ": ");
            double nota = Double.parseDouble(scanner.nextLine());
            alunos[i] = new Aluno(nome, nota);
            somaNotas += nota;
        }

        // Calcular a média das notas
        double media = somaNotas / quantidadeAlunos;

        // Exibir os nomes dos alunos acima da média
        System.out.println("Alunos com nota acima da média:");
        for (Aluno aluno : alunos) {
            if (aluno.getNota() > media) {
                System.out.println(aluno.getNome());
            }
        }

        // Fechar o scanner
        scanner.close();
    }
}

class Aluno {
    private String nome;
    private double nota;

    public Aluno(String nome, double nota) {
        this.nome = nome;
        this.nota = nota;
    }

    public String getNome() {
        return nome;
    }

    public double getNota() {
        return nota;
    }
}
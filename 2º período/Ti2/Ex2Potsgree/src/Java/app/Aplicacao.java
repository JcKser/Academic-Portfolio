package app;

import java.util.List;
import java.util.Scanner;

import dao.DAO;
import dao.jogadorDAO;
import model.jogador;

public class Aplicacao {
    
    private static jogadorDAO jogadorDAO = new jogadorDAO();
    private static Scanner scanner = new Scanner(System.in);

    public static void main(String[] args) throws Exception {
        int opcao;
        
        do {
            exibirMenu();
            opcao = scanner.nextInt();
            scanner.nextLine(); // Limpar o buffer do scanner
            
            switch (opcao) {
                case 1:
                    inserirjogador();
                    break;
                case 2:
                    listarjogadors();
                    break;
                case 3:
                    atualizarjogador();
                    break;
                case 4:
                    excluirjogador();
                    break;
                case 5:
                    System.out.println("Saindo...");
                    break;
                default:
                    System.out.println("Opção inválida! Tente novamente.");
            }
        } while (opcao != 5);
        
        scanner.close();
    }
    
    private static void exibirMenu() {
        System.out.println("\n==== Menu ====");
        System.out.println("1) Inserir");
        System.out.println("2) Listar");
        System.out.println("3) Atualizar");
        System.out.println("4) Excluir");
        System.out.println("5) Sair");
        System.out.print("Escolha uma opção: ");
    }
    
    private static void inserirjogador() {
        System.out.println("\n==== Inserir Jogador ====");
        System.out.print("Informe o ID: ");
        int id = scanner.nextInt();
        scanner.nextLine(); // Limpar o buffer do scanner
        
        System.out.print("Informe o nome: ");
        String nome = scanner.nextLine();
        
        System.out.print("Informe o posicao: ");
        String cargo = scanner.nextLine();
        
        System.out.print("Informe o salário: ");
        int salario = scanner.nextInt();
        scanner.nextLine(); // Limpar o buffer do scanner
        
        jogador jogador = new jogador(id, nome, cargo, salario);
        
        if (jogadorDAO.insert(jogador)) {
            System.out.println("Jogador inserido com sucesso!");
        } else {
            System.out.println("Erro ao inserir jogador.");
        }
    }
    
    private static void listarjogadors() {
        System.out.println("\n==== Listar jogador ====");
        List<jogador> jogadors = jogadorDAO.get();
        
        if (jogadors.isEmpty()) {
            System.out.println("Nenhum jogador cadastrado.");
        } else {
            for (jogador jogador : jogadors) {
                System.out.println(jogador.toString());
            }
        }
    }
    
    private static void atualizarjogador() {
        System.out.println("\n==== Atualizar jogador ====");
        System.out.print("Informe o ID do jogador a ser atualizado: ");
        int id = scanner.nextInt();
        scanner.nextLine(); // Limpar o buffer do scanner
        
        jogador jogador = jogadorDAO.get(id);
        
        if (jogador == null) {
            System.out.println("jogador não encontrado.");
        } else {
            System.out.print("Informe o novo nome: ");
            String nome = scanner.nextLine();
            
            System.out.print("Informe o nova posicao: ");
            String cargo = scanner.nextLine();
            
            System.out.print("Informe o novo salário: ");
            int salario = scanner.nextInt();
            scanner.nextLine(); // Limpar o buffer do scanner
            
            jogador.setnome(nome);
            jogador.setcargo(cargo);
            jogador.setsalario(salario);
            
            if (jogadorDAO.update(jogador)) {
                System.out.println("jogador atualizado com sucesso!");
            } else {
                System.out.println("Erro ao atualizar jogador.");
            }
        }
    }
    
    private static void excluirjogador() {
        System.out.println("\n==== Excluir jogador ====");
        System.out.print("Informe o ID do jogador a ser excluído: ");
        int id = scanner.nextInt();
        scanner.nextLine(); // Limpar o buffer do scanner
        
        if (jogadorDAO.delete(id)) {
            System.out.println("jogador excluído com sucesso!");
        } else {
            System.out.println("Erro ao excluir jogador.");
        }
    }
}

import java.io.*;
import Ajuda.Arquivo;
import Ajuda.Livro;

public class Tentativa2 
{
    // Método para criar um novo livro
    public static int criarLivro(Arquivo<Livro> arqLivros, Livro livro) 
    {
        try 
        {
            return arqLivros.create(livro);
        } 
        
        catch (Exception e) 
        {
            e.printStackTrace();
            return -1; 
        }
    }

    // Método para ler um livro do arquivo pelo ID
    public static Livro lerLivro(Arquivo<Livro> arqLivros, int id) throws IOException 
    {
        try 
        {
            return arqLivros.read(id);
        } 
        
        catch (Exception e) 
        {
            e.printStackTrace();
            return null;
        }
    }

    // Método para atualizar as informações de um livro
    public static boolean atualizarLivro(Arquivo<Livro> arqLivros, int id, Livro novoLivro) throws IOException 
    {
        novoLivro.setID(id);
        try 
        {
            return arqLivros.update(novoLivro);
        } 
        
        catch (Exception e) 
        {
            e.printStackTrace();
            return false;
        }
    }

    // Método para deletar um livro do arquivo pelo ID
    public static boolean deletarLivro(Arquivo<Livro> arqLivros, int id) throws IOException 
    {
        try 
        {
            return arqLivros.delete(id);
        } 
        
        catch (Exception e) 
        {
            e.printStackTrace();
            return false;
        }
    }

    public static void main(String[] args)  throws IOException
    {
        try 
        {
            // Deletando os arquivos existentes
            File file = new File("Tp1/Banco-de-dados/livros.db");
            file.delete();

            File file2 = new File("Tp1/Banco-de-dados/livros.hash_d.db");
            file2.delete();

            File file3 = new File("Tp1/Banco-de-dados/livros.hash_c.db");
            file3.delete();


            // Inicializando o arquivo
            Arquivo<Livro> arqLivros = new Arquivo<>("Tp1/Banco-de-dados/livros.db", Livro.class.getConstructor());

            // Criando os livros
            Livro livro1 = new Livro(-1, "10", "Odisseia", 15.99F, -1);
            Livro livro2 = new Livro(-1, "11", "Ensino Híbrido", 39.90F, -1);
            Livro livro3 = new Livro(-1, "12", "Memória", 55.58F, -1);
            Livro livro4 = new Livro(-1, "16", "Teste de Mon", 55.58F, -1);
            Livro livro5 = new Livro(-1, "17", "Teste", 39.90F, -1);

            int id1, id2, id3, id4, id5;

            // Criando os livros e obtendo seus IDs
            id1 = criarLivro(arqLivros, livro1);
            System.out.println("Livro \"" + livro1.getTitulo() + "\" criado com o ID: " + id1);
            
            id2 = criarLivro(arqLivros, livro2);
            System.out.println("Livro \"" + livro2.getTitulo() + "\" criado com o ID: " + id2);

            id3 = criarLivro(arqLivros, livro3);
            System.out.println("Livro \"" + livro3.getTitulo() + "\" criado com o ID: " + id3);
            
            id4 = criarLivro(arqLivros, livro4);
            System.out.println("Livro \"" + livro4.getTitulo() + "\" criado com o ID: " + id4);

            id5 = criarLivro(arqLivros, livro5);
            System.out.println("Livro \"" + livro5.getTitulo() + "\" criado com o ID: " + id5);

            // Lendo os livros e exibindo suas informações

            // Livro 1
            Livro livroLido1 = lerLivro(arqLivros, id1);
            if (livroLido1 != null) 
            {
                System.out.println("Livro encontrado: " + livroLido1);
            } 
            
            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id1 + ", ou livro não encontrado");
            }

            // Livro 2
            Livro livroLido2 = lerLivro(arqLivros, id2);
            if (livroLido2 != null) 
            {
                System.out.println("Livro encontrado: " + livroLido2);
            } 
            
            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id2 + ", ou livro não encontrado");
            }

            // Livro 3
            Livro livroLido3 = lerLivro(arqLivros, id3);
            if (livroLido3 != null) 
            {
                System.out.println("Livro encontrado: " + livroLido3);
            } 
            
            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id3 + ", ou livro não encontrado");
            }

            // Livro 4
            Livro livroLido4 = lerLivro(arqLivros, id4);
            if (livroLido4 != null) 
            {
                System.out.println("Livro encontrado: " + livroLido4);
            } 
            
            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id4 + ", ou livro não encontrado");
            }

            // Livro 5 
            Livro livroLido5 = lerLivro(arqLivros, id5);
            if (livroLido5 != null) 
            {
                System.out.println("Livro encontrado: " + livroLido5);
            } 
            
            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id5 + ", ou livro não encontrado");
            }

            // Atualizando os livros
            Livro novoLivro1 = new Livro(id1, "Novo Título 1", "Novo Autor 1", 25.50F, 100);
            Livro novoLivro2 = new Livro(id2, "Novo Título 2", "Novo Autor 2", 30.75F, 150);

            // Livro 1
            if (atualizarLivro(arqLivros, id1, novoLivro1)) 
            {
                System.out.println("Livro atualizado com sucesso: " + novoLivro1);
            } 
            
            else 
            {
                System.out.println("Erro ao atualizar o livro com ID: " + id1);
            }

            // Livro 2
            if (atualizarLivro(arqLivros, id2, novoLivro2)) 
            {
                System.out.println("Livro atualizado com sucesso: " + novoLivro2);
            } 
            
            else 
            {
                System.out.println("Erro ao atualizar o livro com ID: " + id2);
            }


             // Deletando os livros
            if (deletarLivro(arqLivros, id3)) 
            {
                System.out.println("Livro deletado com sucesso, ID: " + id3);
            } 
            
            else 
            {
                System.out.println("Erro ao deletar o livro com ID: " + id3);
            }

            if (deletarLivro(arqLivros, id4)) 
            {
                System.out.println("Livro deletado com sucesso, ID: " + id4);
            } 
            
            else 
            {
                System.out.println("Erro ao deletar o livro com ID: " + id4);
            }

            if (deletarLivro(arqLivros, id5)) 
            {
                System.out.println("Livro deletado com sucesso, ID: " + id5);
            } 
            
            else 
            {
                System.out.println("Erro ao deletar o livro com ID: " + id5);
            }

            // Fechando o arquivo
            arqLivros.close();            
        } 
        
        catch (IOException e) 
        {
            // Tratamento de exceções de E/S
            e.printStackTrace();
        } 
        
        catch (Exception e) 
        {
            // Tratamento de outras exceções
            e.printStackTrace();
        }
    }
}

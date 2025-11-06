import java.io.*;

import Ajuda.Arquivo;
import Ajuda.Livro;

public class Tentativa1  
{
    public static void main(String[] args) 
    {
        File file = new File("Tp1/Banco-de-dados/livros.db");
        file.delete();

        File file2 = new File("Tp1/Banco-de-dados/livros.hash_d.db");
        file2.delete();

        File file3 = new File("Tp1/Banco-de-dados/livros.hash_c.db");
        file3.delete();

        Arquivo<Livro> arqLivros;
        Livro livro1 = new Livro(-1, "10", "Odisseia", 15.99F, -1);
        Livro livro2 = new Livro(-1, "11", "Ensino Híbrido", 39.90F, -1);
        Livro livro3 = new Livro(-1, "12", "Memória", 55.58F, -1);
        Livro livro4 = new Livro(-1, "16", "Teste de Mon", 55.58F, -1);
        Livro livro5 = new Livro(-1, "17", "Teste", 39.90F, -1);

        int id1, id2, id3, id4, id5;

        try 
        {
            arqLivros = new Arquivo<>("livros.db", Livro.class.getConstructor());

            // Create

            // Criando os livros, teste de inclusão
            id1 = arqLivros.create(livro1);
            System.out.println("Livro \"" + livro1.getTitulo() + "\" criado com o ID: " + id1);

            id2 = arqLivros.create(livro2);
            System.out.println("Livro \"" + livro2.getTitulo() + "\" criado com o ID: " + id2);

            id3 = arqLivros.create(livro3);
            System.out.println("Livro\"" + livro3.getTitulo() + "\" criado com o ID: " + id3);

            id4 = arqLivros.create(livro4);
            System.out.println("Livro \"" + livro4.getTitulo() + "\" criado com o ID: " + id4);

            id5 = arqLivros.create(livro5);
            System.out.println("Livro \"" + livro5.getTitulo() + "\" criado com o ID: " + id5);

            // Read
            // Lendo e verificando se os livros estão no arquivo

            // Verificar livro 1
            if ((livro1 = arqLivros.read(id1)) != null) 
            {
                System.out.println("Livro encontrado: \"" + livro1.getTitulo() + "(ID do livro: " + id1 + ")\"");
            }

            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id1 + ", ou livro não encontrado");
            }


            // Verificar livro 2
            if ((livro2 = arqLivros.read(id2)) != null) 
            {
                System.out.println("Livro encontrado: \"" + livro2.getTitulo() + "(ID do livro: " + id2 + ")\"");
            }

            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id2 + ", ou livro não encontrado");
            }


            // Verificar livro 3
            if ((livro3 = arqLivros.read(id3)) != null) 
            {
                System.out.println("Livro encontrado: \"" + livro3.getTitulo() + "(ID do livro: " + id3 + ")\"");
            }

            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id3 + ", ou livro não encontrado");
            }


            // Verificar livro 4
            if ((livro4 = arqLivros.read(id4)) != null) 
            {
                System.out.println("Livro encontrado: \"" + livro4.getTitulo() + "(ID do livro: " + id4 + ")\"");
            }

            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id4 + ", ou livro não encontrado");
            }


            // Verificar livro 5
            if ((livro5 = arqLivros.read(id5)) != null) 
            {
                System.out.println("Livro encontrado: \"" + livro5.getTitulo() + "(ID do livro: " + id5 + ")\"");
            }

            else 
            {
                System.out.println("Erro ao ler o livro com ID: " + id5 + ", ou livro não encontrado");
            }

            // Update

            // Atualizando o livro 1

            livro1.setTitulo("Odisseia - Homero");
            if (arqLivros.update(livro1)) 
            {
                System.out.println("Livro atualizado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao atualizar o livro");
            }


            // Atualizando o livro 2

            livro2.setTitulo("Ensino Híbrido - Alex");
            if (arqLivros.update(livro2)) 
            {
                System.out.println("Livro atualizado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao atualizar o livro");
            }


            // Atualizando o livro 3

            livro3.setTitulo("Memória - Alan");
            if (arqLivros.update(livro3)) 
            {
                System.out.println("Livro atualizado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao atualizar o livro");
            }


            // Atualizando o livro 4

            livro4.setTitulo("Teste de Mon - Mon");
            if (arqLivros.update(livro4)) 
            {
                System.out.println("Livro atualizado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao atualizar o livro");
            }
            
            // Atualizando o livro 5

            livro5.setTitulo("Teste - Teste");
            if (arqLivros.update(livro5)) 
            {
                System.out.println("Livro atualizado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao atualizar o livro");
            }


            // Delete

            // Deletando o livro 1
            if (arqLivros.delete(id1)) 
            {
                System.out.println("Livro deletado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao deletar o livro");
            }

            
            // Deletando o livro 2

            if (arqLivros.delete(id2)) 
            {
                System.out.println("Livro deletado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao deletar o livro");
            }


            // Deletando o livro 3
            
            if (arqLivros.delete(id3)) 
            {
                System.out.println("Livro deletado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao deletar o livro");
            }

            // Deletando o livro 4

            if (arqLivros.delete(id4)) 
            {
                System.out.println("Livro deletado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao deletar o livro");
            }

            // Deletando o livro 5

            if (arqLivros.delete(id5)) 
            {
                System.out.println("Livro deletado com sucesso");
            }

            else 
            {
                System.out.println("Erro ao deletar o livro");
            }
            

            // Close file          

            arqLivros.close();
        }

        catch (Exception e) 
        {
            // TODO: handle exception
            e.printStackTrace();
        }

        
    }
}


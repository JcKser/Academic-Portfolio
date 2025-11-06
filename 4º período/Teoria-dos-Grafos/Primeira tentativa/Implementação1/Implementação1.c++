#include <iostream>
#include <string>

using namespace std;

 struct elementos {
    int numero;
    elementos* proximo;

    elementos(int val) : numero(val), proximo(nullptr) {}  // Construtor com inicialização de número e um poteiro q aponta para nulo
};

class ListaEncadeada // Classe que contém a lista encadeada
{
private:
    elementos* inicio; // Ponteiro que aponta para o início da lista
public:
     // Construtor que inicializa o ponteiro inicio como nullptr
    ListaEncadeada() : inicio(nullptr) {}
    
    //Liberando a memória
    ~ListaEncadeada() {
        elementos* auxilio = inicio;
        while (auxilio != nullptr) {
            elementos* proximo = auxilio->proximo;
            delete auxilio;
            auxilio = proximo;
        }
    }

    // Função que insere um elemento na lista
    void inserir(int val)
    {
        elementos* novo = new elementos(val);
        if(inicio == nullptr)
        {
            inicio = new elementos(val);
        }
        else
        {
            elementos* auxiliar = inicio; //
            while (auxiliar->proximo != nullptr)//
            {
               auxiliar = auxiliar->proximo;
            }
            auxiliar->proximo = new elementos(val);
            
        }
    }
    
    //Metodo para buscar se tem um mesmo elemento
    bool busca(int val)
    {   
        elementos* auxiliar = inicio;
        while (auxiliar != nullptr)
        { 
            if (auxiliar->numero == val)
            {
                return true;
            }
          
            auxiliar = auxiliar->proximo;
            
         
        }
        
     return false;
    }

    //metodo para remover elemento 
    bool remover(int numElementos) {
        if (numElementos <= 0) return false;

        int contagem = 0;
        while (inicio != nullptr && contagem < numElementos) {
            elementos* temp = inicio;
            inicio = inicio->proximo;
            delete temp;
            contagem++;
        }

        if (contagem >= numElementos) {
            elementos* auxiliar = inicio;
            while (auxiliar != nullptr && contagem < numElementos) {
                if (auxiliar->proximo != nullptr) {
                    elementos* temp = auxiliar->proximo;
                    auxiliar->proximo = temp->proximo;
                    delete temp;
                    contagem++;
                } else {
                    break;
                }
                auxiliar = auxiliar->proximo;
            }
        }
        
        return contagem == numElementos;
    }
};




int main() {
    cout << "Lista Encadeada" << endl;
    cout << "Insira o número de elementos que deseja inserir na lista: ";
    int n;
    cin >> n;
    ListaEncadeada lista;
    cout << "Deseja inserir outros elementos? (s/n): ";
    string resposta;
    cin >> resposta;
    while (resposta == "s")
    {
        cout << "Insira o elemento que deseja inserir: ";
        int elemento;
        cin >> elemento;
        lista.inserir(elemento);
        cout << "Deseja inserir outros elementos? (s/n): ";
        cin >> resposta;
    }
    cout << "Deseja buscar um elemento na lista? (s/n): ";
    cin >> resposta;
    while (resposta == "s")
    {
        cout << "Insira o elemento que deseja buscar: ";
        int elemento;
        cin >> elemento;
        if (lista.busca(elemento))
        {
            cout << "O elemento " << elemento << " foi encontrado na lista." << endl;
        }
        else
        {
            cout << "O elemento " << elemento << " não foi encontrado na lista." << endl;
        }
        cout << "Deseja buscar outro elemento na lista? (s/n): ";
        cin >> resposta;
    }
    cout << "Deseja remover um elemento da lista? (s/n): ";
    cin >> resposta;
    while (resposta == "s")
    {
        cout << "Insira o elemento que deseja remover: ";
        int elemento;
        cin >> elemento;
        if (lista.remover(elemento))
        {
            cout << "O elemento " << elemento << " foi removido da lista." << endl;
        }
        else
        {
            cout << "O elemento " << elemento << " não foi encontrado na lista." << endl;
        }
        cout << "Deseja remover outro elemento da lista? (s/n): ";
        cin >> resposta;
    }

    return 0;
}
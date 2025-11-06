#include <iostream>
#include <stack>

using namespace std;

class Pilha {
private:
    stack<int> pilha;

public:
    // Adiciona um elemento à pilha
    void adicionar(int val) {
        pilha.push(val);
    }

    // Remove um elemento da pilha
    void remove()
    {
        if (!pilha.empty())
        {
            pilha.pop();
        }
        else
        {
            cout << "A pilha está vazia!" << endl;
        }
    }
   

      // Verifica se um elemento está na pilha
    bool contem(int valor) const {
        stack<int> temp = pilha; // Copia a pilha para não modificar a original
        while (!temp.empty()) {
            if (temp.top() == valor) {  // top() retorna o elemento do topo da pilha
                return true; // Valor encontrado na pilha
            }
            temp.pop(); // Remove o elemento do topo da pilha temporária
        }
        return false; // Valor não encontrado na pilha
    }
        
    // Método para obter o tamanho atual da pilha
     int obterTamanho()
       { 
        return pilha.size();
       }
    // Mostra todos os elementos da pilha
    void mostrar() const {
        stack<int> temp = pilha; // Copia a pilha para não modificar a original
        while (!temp.empty()) {
            cout << temp.top() << " ";
            temp.pop(); // Remove o elemento do topo da pilha temporária
        }
        cout << endl;
    }
    
};
int main() {
    Pilha pilha;
    
    // Adiciona elementos à pilha
    pilha.adicionar(10);
    pilha.adicionar(20);
    pilha.adicionar(30);
    
    // Mostrar a pilha
    cout << "Pilha: ";
    pilha.mostrar();

    // Verificar a presença de um elemento
    int elemento = 20;
    if (pilha.contem(elemento)) {
        cout << elemento << " está na pilha." << endl;
    } else {
        cout << elemento << " não está na pilha." << endl;
    }

    // Remover elementos
    int k = 2; // Número de elementos a remover
    cout << "Removendo " << k << " elementos:" << endl;
    for (int i = 0; i < k; ++i) {
        pilha.remove();
    }
    
    // Mostrar a pilha após remoção
    cout << "Pilha após remoção: ";
    pilha.mostrar();

    return 0;
}

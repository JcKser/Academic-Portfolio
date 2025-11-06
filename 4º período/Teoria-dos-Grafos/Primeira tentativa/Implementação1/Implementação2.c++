#include <iostream>
#include <queue>

using namespace std;

class Fila {
private:
    queue<int> fila;

public:
    // Adiciona um elemento à fila
    void adicionar(int val) {
        fila.push(val);
    }

    // Remove um elemento da fila
    void remover() {
        if (!fila.empty()) {
            fila.pop();
        } else {
            cerr << "A fila está vazia!" << endl;
        }
    }

    // Verifica se um elemento está na fila
    bool contem(int valor) {
        queue<int> temp = fila; // Copia a fila para não modificar a original
        while (!temp.empty()) {
            if (temp.front() == valor) {
                return true; // Valor encontrado na fila
            }
            temp.pop(); // Remove o elemento da frente da fila temporária
        }
        return false; // Valor não encontrado na fila
    }

    // Método para obter o tamanho atual da fila
    int obterTamanho() const {
        return fila.size();
    }

    // Mostra todos os elementos da fila
    void mostrar() const {
        queue<int> temp = fila; // Copia a fila para não modificar a original
        while (!temp.empty()) {
            cout << temp.front() << " ";
            temp.pop(); // Remove o elemento da frente da fila temporária
        }
        cout << endl;
    }
};

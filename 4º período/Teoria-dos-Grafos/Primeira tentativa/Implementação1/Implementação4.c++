#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

class MatrizInteiros {
private:
    vector<vector<int>> matriz;
    int linhas;
    int colunas;

public:
    // Construtor para inicializar a matriz com dimensões e valor inicial
    MatrizInteiros(int nLinhas, int nColunas, int valorInicial = 0) 
        : linhas(nLinhas), colunas(nColunas) {
        matriz.resize(linhas, vector<int>(colunas, valorInicial));
    }

    // Função para adicionar um elemento em uma posição específica
    void adicionarElemento(int linha, int coluna, int valor) {
        if (linha >= 0 && linha < linhas && coluna >= 0 && coluna < colunas) {
            matriz[linha][coluna] = valor;
        } else {
            cerr << "Índices fora do intervalo!" << endl;
        }
    }

    // Função para verificar se um elemento está na matriz
    bool verificarElemento(int valor) {
        for (const auto& linha : matriz) {
            if (find(linha.begin(), linha.end(), valor) != linha.end()) {
                return true;
            }
        }
        return false;
    }

    // Função para remover elementos específicos
    void removerElemento(int valor) {
        for (auto& linha : matriz) {
            auto it = remove(linha.begin(), linha.end(), valor);
            if (it != linha.end()) {
                linha.erase(it, linha.end());
                // Preencher os espaços removidos com zero para manter o tamanho da linha
                linha.resize(colunas, 0);
            }
        }
    }

    // Função para imprimir a matriz
    void imprimirMatriz() const {
        for (const auto& linha : matriz) {
            for (int valor : linha) {
                cout << valor << " ";
            }
            cout << endl;
        }
    }
};

int main() {
    MatrizInteiros matriz(3, 3, 0); // Cria uma matriz 3x3 inicializada com 0

    // Adicionando elementos
    matriz.adicionarElemento(0, 0, 1);
    matriz.adicionarElemento(1, 1, 2);
    matriz.adicionarElemento(2, 2, 3);

    cout << "Matriz após adição de elementos:" << endl;
    matriz.imprimirMatriz();

    // Verificando se um elemento está presente
    int elementoParaVerificar = 2;
    if (matriz.verificarElemento(elementoParaVerificar)) {
        cout << "Elemento " << elementoParaVerificar << " encontrado na matriz." << endl;
    } else {
        cout << "Elemento " << elementoParaVerificar << " não encontrado na matriz." << endl;
    }

    // Removendo elementos
    matriz.removerElemento(2);

    cout << "Matriz após remoção de elementos:" << endl;
    matriz.imprimirMatriz();

    return 0;
}

#include <iostream>
#include <string>
#include <queue>
#include <stack>
#include <vector>
#include <algorithm>
using namespace std;

struct elementos {
    int numero;
    elementos* proximo;

    elementos(int val) : numero(val), proximo(nullptr) {}  // Construtor com inicialização de número e um ponteiro que aponta para nulo
};

class ListaEncadeada // Classe que contém a lista encadeada
{
private:
    elementos* inicio; // Ponteiro que aponta para o início da lista
public:
    // Construtor que inicializa o ponteiro inicio como nullptr
    ListaEncadeada() : inicio(nullptr) {}
    
    // Liberando a memória
    ~ListaEncadeada() {
        elementos* auxiliar = inicio;
        while (auxiliar != nullptr) {
            elementos* proximo = auxiliar->proximo;
            delete auxiliar;
            auxiliar = proximo;
        }
    }

    // Função que insere um elemento na lista
    void inserir(int val)
    {
        elementos* novo = new elementos(val);
        if (inicio == nullptr)
        {
            inicio = novo;
        }
        else
        {
            elementos* auxiliar = inicio;
            while (auxiliar->proximo != nullptr)
            {
                auxiliar = auxiliar->proximo;
            }
            auxiliar->proximo = novo;
        }
    }
    
    // Método para buscar se tem um mesmo elemento
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

    // Método para remover elemento 
    bool remover(int val)
    {
        elementos* auxiliar = inicio;
        elementos* anterior = nullptr;
        while (auxiliar != nullptr)
        {
            if (auxiliar->numero == val)
            {
                if (anterior == nullptr)
                {
                    inicio = auxiliar->proximo;
                }
                else
                {
                    anterior->proximo = auxiliar->proximo;
                }
                delete auxiliar;
                return true;
            }
            anterior = auxiliar;
            auxiliar = auxiliar->proximo;
        }
        return false;
    }

    // Método para mostrar todos os elementos da lista
    void mostrar() const
    {
        elementos* auxiliar = inicio;
        while (auxiliar != nullptr)
        {
            cout << auxiliar->numero << " ";
            auxiliar = auxiliar->proximo;
        }
        cout << endl;
    }
};

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
    bool contem(int valor)
    {
        stack<int> temp = pilha; // Copia a pilha para não modificar a original
        while (!temp.empty())
        {
            if (temp.top() == valor)  // top() retorna o elemento do topo da pilha
            {
                return true; // Valor encontrado na pilha
            }
            temp.pop(); // Remove o elemento do topo da pilha temporária
        }
        return false; // Valor não encontrado na pilha
    }
      
    // Método para obter o tamanho atual da pilha
    int obterTamanho() const
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
    ListaEncadeada lista;
    Fila fila;
    Pilha pilha;
    int n;
    
    cout << "O que deseja fazer: Listar(1), Empilhar (2), Enfileirar(3) ou criar uma Matriz de Números(4)?" << endl;
    cout << "Digite o número correspondente à ação desejada: ";
    cin >> n;

    if (n == 1)
    {
        cout << "Lista Encadeada" << endl;
        cout << "Insira o número de elementos que deseja inserir na lista: ";
        int qtd;
        cin >> qtd;
        for (int i = 0; i < qtd; i++)
        {
            int val;
            cout << "Insira o elemento " << i + 1 << ": ";
            cin >> val;
            lista.inserir(val);
        }
        cout << "Deseja buscar um número? (s/n): ";
        string resposta;
        cin >> resposta;
        if (resposta == "s")
        {
            cout << "Digite o número que deseja buscar: ";
            int val;
            cin >> val;
            if (lista.busca(val))
            {
                cout << "O elemento " << val << " está na lista." << endl;
            }
            else
            {
                cout << "O elemento " << val << " não está na lista." << endl;
            }
        }
        
        cout << "Deseja remover alguns elementos? (s/n): ";
        cin >> resposta;
        if (resposta == "s")
        {
            int val;
            while (true)
            {
                cout << "Digite o número que deseja remover (ou 0 para encerrar): ";
                cin >> val;
                if (val == 0)
                    break;

                if (lista.remover(val))
                {
                    cout << "O elemento " << val << " foi removido da lista." << endl;
                }
                else
                {
                    cout << "O elemento " << val << " não está na lista." << endl;
                }
            }
        }
        
        // Mostrar a lista
        cout << "Lista: ";
        lista.mostrar();
    }
    else if (n == 2)
    {
        cout << "Pilha" << endl;
        cout << "Insira o número de elementos que deseja inserir na pilha: ";
        int qtd;
        cin >> qtd;
        for (int i = 0; i < qtd; i++)
        {
            int val;
            cout << "Insira o elemento " << i + 1 << ": ";
            cin >> val;
            pilha.adicionar(val);
        }
        cout << "Digite o número que deseja buscar: ";
        int val;
        cin >> val;
        if (pilha.contem(val))
        {
            cout << "O elemento " << val << " está na pilha." << endl;
        }
        else
        {
            cout << "O elemento " << val << " não está na pilha." << endl;
        }
        cout << "Digite o número que deseja remover: ";
        cin >> val;
        pilha.remove();
        // Mostrar a pilha
        cout << "Pilha: ";
        pilha.mostrar();
    }
    else if (n == 3)
    {
        cout << "Fila" << endl;
        cout << "Insira o número de elementos que deseja inserir na fila: ";
        int qtd;
        cin >> qtd;
        for (int i = 0; i < qtd; i++)
        {
            int val;
            cout << "Insira o elemento " << i + 1 << ": ";
            cin >> val;
            fila.adicionar(val);
        }
        cout << "Digite o número que deseja buscar: ";
        int val;
        cin >> val;
        if (fila.contem(val))
        {
            cout << "O elemento " << val << " está na fila." << endl;
        }
        else
        {
            cout << "O elemento " << val << " não está na fila." << endl;
        }
        cout << "Digite o número que deseja remover: ";
        cin >> val;
        fila.remover();
        // Mostrar a fila
        cout << "Fila: ";
        fila.mostrar();
    }
    else if (n == 4)
    {
        cout << "Matriz de Números" << endl;
        int linhas, colunas;
        cout << "Digite o número de linhas e colunas: ";
        cin >> linhas >> colunas;
        MatrizInteiros matriz(linhas, colunas);

        cout << "Insira os valores para a matriz: " << endl;
        for (int i = 0; i < linhas; i++) {
            for (int j = 0; j < colunas; j++) {
                int valor;
                cout << "Elemento [" << i << "][" << j << "]: ";
                cin >> valor;
                matriz.adicionarElemento(i, j, valor);
            }
        }

        cout << "Matriz Atual:" << endl;
        matriz.imprimirMatriz();

        cout << "Digite um valor para verificar na matriz: ";
        int valor;
        cin >> valor;
        if (matriz.verificarElemento(valor)) {
            cout << "O elemento " << valor << " está na matriz." << endl;
        } else {
            cout << "O elemento " << valor << " não está na matriz." << endl;
        }

        cout << "Digite um valor para remover da matriz: ";
        cin >> valor;
        matriz.removerElemento(valor);
        cout << "Matriz após remoção:" << endl;
        matriz.imprimirMatriz();
    }
    else
    {
        cout << "Opção inválida!" << endl;
    }

    return 0;
}

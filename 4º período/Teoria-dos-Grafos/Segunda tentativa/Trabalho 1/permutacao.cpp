#include <iostream>
#include <vector>
#include <algorithm>
#include <set>
#include <chrono>

using namespace std;

class Grafo {
private:
    int V;
    vector<vector<bool>> adj;

    // Gera subconjuntos usando representação binária
    vector<vector<int>> gerarSubconjuntos(const vector<int>& vertices) {
        vector<vector<int>> subconjuntos;
        int n = vertices.size();
        for (int i = 1; i < (1 << n); i++) { // De 1 até 2^n - 1
            vector<int> subconjunto;
            for (int j = 0; j < n; j++) {
                if (i & (1 << j)) { // Se o bit j está setado
                    subconjunto.push_back(vertices[j]);
                }
            }
            if (subconjunto.size() >= 3) { // Apenas ciclos com 3 ou mais vértices
                subconjuntos.push_back(subconjunto);
            }
        }
        return subconjuntos;
    }

public:
    Grafo(int vertices) {
        V = vertices;
        adj.resize(V, vector<bool>(V, false));
    }

    void adicionarAresta(int v, int w) {
        adj[v][w] = true;
        adj[w][v] = true; // Grafo não-direcionado
    }

    bool existeAresta(int v, int w) {
        return adj[v][w];
    }

    void encontrarCiclos() {
        vector<int> vertices;
        for (int i = 0; i < V; i++) {
            vertices.push_back(i);
        }

        // Gera todos os subconjuntos de vértices
        vector<vector<int>> subconjuntos = gerarSubconjuntos(vertices);
        set<set<int>> ciclosUnicos; // Armazena ciclos como conjuntos de vértices

        for (vector<int> sub : subconjuntos) {
            do {
                bool ehCiclo = true;
                for (int i = 0; i < sub.size() - 1; i++) {
                    if (!existeAresta(sub[i], sub[i + 1])) {
                        ehCiclo = false;
                        break;
                    }
                }
                if (ehCiclo && existeAresta(sub[sub.size() - 1], sub[0])) {
                    // Converte o ciclo em um set para eliminar redundâncias
                    set<int> cicloSet(sub.begin(), sub.end());
                    ciclosUnicos.insert(cicloSet);
                }
            } while (next_permutation(sub.begin(), sub.end()));
        }

        // Imprime os ciclos únicos
        cout << "Ciclos únicos encontrados:\n";
        for (const set<int>& ciclo : ciclosUnicos) {
            for (int v : ciclo) {
                cout << v << " ";
            }
            cout << *(ciclo.begin()) << "\n"; // Fecha o ciclo
        }
    }
};

int main() {
    Grafo g(6);
    g.adicionarAresta(0,1); g.adicionarAresta(0,3); g.adicionarAresta(0,4); // A
    g.adicionarAresta(1, 0); g.adicionarAresta(1,3); g.adicionarAresta(1,4); g.adicionarAresta(1,2); // B
    g.adicionarAresta(2, 1); g.adicionarAresta(2,3); g.adicionarAresta(2,4); g.adicionarAresta(2,5); // C
    g.adicionarAresta(3, 0); g.adicionarAresta(3,1); g.adicionarAresta(3,2); g.adicionarAresta(3,5);// D
    g.adicionarAresta(4, 0); g.adicionarAresta(4,1); g.adicionarAresta(4,2); g.adicionarAresta(4,5);// E
    g.adicionarAresta(5,3); g.adicionarAresta(5,2); g.adicionarAresta(5,4);// F
    
   /*
    g.adicionarAresta(0,1);
    g.adicionarAresta(1,2);
    g.adicionarAresta(2,3);
    g.adicionarAresta(3,0);
    g.adicionarAresta(0,3);
    g.adicionarAresta(3,2);
    g.adicionarAresta(2,1);
    g.adicionarAresta(1,0);*/
/*
    g.adicionarAresta(0, 1);
    g.adicionarAresta(1, 2);
    g.adicionarAresta(2, 3);
    g.adicionarAresta(3, 0);
    g.adicionarAresta(1, 3); */// Adiciona uma aresta extra para ter ciclos menores

    cout << "Buscando todos os ciclos:\n";
    auto inicio = std::chrono::high_resolution_clock::now();
    g.encontrarCiclos();
    
    auto fim = std::chrono::high_resolution_clock::now();
    auto duracao = std::chrono::duration_cast<std::chrono::microseconds>(fim - inicio).count();
    std::cout << "Tempo de execução: " << duracao << " microssegundos" << std::endl;

    return 0;
}
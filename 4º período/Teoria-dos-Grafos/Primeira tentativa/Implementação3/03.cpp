#include <iostream>
#include <vector>
#include <queue>
#include <climits>

using namespace std;

// Classe que representa um grafo usando uma lista de adjacências
class Grafo {
    int V; // Número de vértices
    vector<pair<int, int>>* adj; // Lista de adjacências: par (vértice destino, peso)

public:
    Grafo(int V);
    void adicionarAresta(int u, int v, int peso);
    void dijkstra(int origem);
};

// Construtor da classe Grafo
Grafo::Grafo(int V) {
    this->V = V;
    adj = new vector<pair<int, int>>[V];
}

// Função para adicionar uma aresta ao grafo
void Grafo::adicionarAresta(int u, int v, int peso) {
    adj[u].push_back(make_pair(v, peso));
    adj[v].push_back(make_pair(u, peso)); // Para grafos não direcionados
}

// Implementação do algoritmo de Dijkstra
void Grafo::dijkstra(int origem) {
    // Vetor de distâncias, inicializado com infinito
    vector<int> dist(V, INT_MAX);
    // Fila de prioridade para escolher o próximo vértice com menor distância
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    
    // A distância do vértice de origem para ele mesmo é 0
    pq.push(make_pair(0, origem));
    dist[origem] = 0;

    while (!pq.empty()) {
        int u = pq.top().second; // Extraímos o vértice com menor distância
        pq.pop();

        // Verifica todos os vértices adjacentes ao vértice u
        for (auto& i : adj[u]) {
            int v = i.first;
            int peso = i.second;

            // Se encontramos uma distância menor para o vértice v, atualizamos
            if (dist[v] > dist[u] + peso) {
                dist[v] = dist[u] + peso;
                pq.push(make_pair(dist[v], v));
            }
        }
    }

    // Imprime as distâncias mínimas
    cout << "Distâncias a partir do vértice " << origem << ":\n";
    for (int i = 0; i < V; ++i)
        cout << "Vértice " << i << " -> Distância " << dist[i] << endl;
}

int main() {
    int V = 6;
    Grafo g(V);

    // Adiciona arestas ao grafo
    g.adicionarAresta(0, 1, 4);
    g.adicionarAresta(0, 2, 1);
    g.adicionarAresta(1, 2, 2);
    g.adicionarAresta(1, 3, 5);
    g.adicionarAresta(2, 3, 8);
    g.adicionarAresta(3, 4, 3);
    g.adicionarAresta(4, 5, 1);

    // Executa o algoritmo de Dijkstra a partir do vértice 0
    g.dijkstra(0);

    return 0;
}

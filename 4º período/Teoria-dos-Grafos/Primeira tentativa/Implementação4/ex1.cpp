#include <iostream>
#include <vector>
#include <queue>
#include <climits>

using namespace std;

// Estrutura para representar uma aresta
struct Edge {
    int destino, peso;
};

// Função genérica para encontrar caminhos
template <typename Comparator, typename UpdateCondition>
void findPath(const vector<vector<Edge>>& grafo, int origem, Comparator compare, UpdateCondition updateCondition, int defaultValue) {
    int V = grafo.size();
    vector<int> pathValue(V, defaultValue);
    pathValue[origem] = updateCondition(defaultValue, 0);

    priority_queue<pair<int, int>, vector<pair<int, int>>, Comparator> pq;
    pq.push({pathValue[origem], origem});

    while (!pq.empty()) {
        int u = pq.top().second;
        pq.pop();

        for (const auto& vizinho : grafo[u]) {
            int v = vizinho.destino;
            int peso = vizinho.peso;

            int updatedValue = updateCondition(pathValue[u], peso);
            if (compare(updatedValue, pathValue[v])) {
                pathValue[v] = updatedValue;
                pq.push({pathValue[v], v});
            }
        }
    }

    // Exibe o resultado
    for (int i = 0; i < V; ++i) {
        cout << "Vértice " << i << ": " << pathValue[i] << "\n";
    }
}

// Função de Dijkstra para o caminho mais curto
void dijkstra(const vector<vector<Edge>>& grafo, int origem) {
    cout << "Distâncias mínimas a partir do vértice " << origem << ":\n";
    findPath(grafo, origem,
        greater<>{}, // Comparador para minimizar distâncias
        [](int currentDist, int weight) { return currentDist + weight; }, 
        INT_MAX);
}

// Função para encontrar o caminho com maior gargalo mínimo (Max-Min)
void maxMinPath(const vector<vector<Edge>>& grafo, int origem) {
    cout << "Caminho com maior gargalo mínimo a partir do vértice " << origem << ":\n";
    findPath(grafo, origem,
        less<>{}, // Comparador para maximizar gargalos mínimos
        [](int currentGargalo, int weight) { return min(currentGargalo, weight); }, 
        0);
}

// Função para encontrar o caminho com menor gargalo máximo (Min-Max)
void minMaxPath(const vector<vector<Edge>>& grafo, int origem) {
    cout << "Caminho com menor gargalo máximo a partir do vértice " << origem << ":\n";
    findPath(grafo, origem,
        greater<>{}, // Comparador para minimizar gargalos máximos
        [](int currentGargalo, int weight) { return max(currentGargalo, weight); }, 
        INT_MAX);
}

int main() {
    int V = 5; // Número de vértices
    vector<vector<Edge>> grafo(V);

    // Adicionando arestas ao grafo
    grafo[0].push_back({1, 10});
    grafo[0].push_back({2, 5});
    grafo[1].push_back({2, 2});
    grafo[1].push_back({3, 1});
    grafo[2].push_back({3, 9});
    grafo[3].push_back({4, 4});
    grafo[2].push_back({4, 2});

    int origem = 0; // Vértice de origem

    // Executa os algoritmos
    dijkstra(grafo, origem);
    cout << "\n";
    maxMinPath(grafo, origem);
    cout << "\n";
    minMaxPath(grafo, origem);

    return 0;
}

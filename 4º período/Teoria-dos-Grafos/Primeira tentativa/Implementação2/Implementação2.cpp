#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

// Função para gerar os subgrafos 
void gerarSubgrafos(int n) {
    // Número de vértices (0, 1, ..., n-1)
    int numArestas = n * (n - 1) / 2;
    int numSubgrafos = pow(2, numArestas); // 2^numArestas subgrafos possíveis
    
    // Representação de todas as arestas possíveis
    vector<pair<int, int>> arestas;
    for (int i = 0; i < n; ++i) {
        for (int j = i + 1; j < n; ++j) {
            arestas.push_back({i, j});
        }
    }

    // Gerar todos os subgrafos
    for (int mascara = 0; mascara < numSubgrafos; ++mascara) {
        cout << "Subgrafo " << mascara + 1 << ": ";
        
        // Imprimir as arestas presentes no subgrafo
        for (int k = 0; k < numArestas; ++k) {
            if (mascara & (1 << k)) {
                cout << "(" << arestas[k].first << ", " << arestas[k].second << ") ";
            }
        }
        cout << endl;
    }

    cout << "Numero total de subgrafos gerados: " << numSubgrafos << endl;
}

int main() {
    int n;

    cout << "Informe o numero de vertices: ";
    cin >> n;

    gerarSubgrafos(n);
    
    return 0;
}

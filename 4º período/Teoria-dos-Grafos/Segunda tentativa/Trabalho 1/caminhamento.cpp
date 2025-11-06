#include <iostream>
#include <vector>
#include <stack>
#include <sstream>
#include "graph.hpp"

#include <string>
#include <algorithm>
#include <unordered_set>
#include <chrono>

using namespace std;
vector<string> ciclo;
int vert;

graphVet deep(graphVet g, int VertTemp, bool visitando){
    vector<int> neigh;
    //if (visitando){cout << "VertTemp: " << VertTemp << endl;}

    neigh = g.ShowProx(VertTemp); // Pega seus vizinhos
    g.graph[VertTemp].SetVisited(true); // Marca vértice atula como vizitado
    while (!neigh.empty() && (g.graph[neigh.back()].Visited() || g.graph[neigh.back()].ExisteCaminho(g.graph[VertTemp].caminho[g.graph[VertTemp].caminho.size()-1] + "-" +  to_string(neigh.back())))){
        //cout << "popW: " << neigh.back() << endl;
        neigh.pop_back(); // Remove o vizinho da lista que foi visitado ou se ja existe um caminho igual
    }
    if (!neigh.empty() && !g.graph[neigh.back()].Visited() && !g.graph[neigh.back()].ExisteCaminho(g.graph[VertTemp].caminho[g.graph[VertTemp].caminho.size()-1] + "-" +  to_string(neigh.back()))){
        //cout << "Ver: " << neigh.back() << ": " << g.graph[VertTemp].caminho[g.graph[VertTemp].caminho.size()-1] + "-" + to_string(neigh.back()) << endl;

        //ciclo.push_back(g.graph[VertTemp].caminho[g.graph[VertTemp].caminho.size()-1] + to_string(neigh.back()) + " - " + to_string(neigh.back()));

        // Adiciona caminho feito até o mometo no vértice vizinho à ser vizitado
        g.graph[neigh.back()].caminho.push_back(g.graph[VertTemp].caminho[g.graph[VertTemp].caminho.size()-1] + "-" +  to_string(neigh.back()));
        g = deep(g, neigh.back(), true); // Vai para o vizinho
        //cout << "pop: " << neigh.back() << endl;
        neigh.pop_back(); // remove o vizinho ja vizitado
    }
    if (!neigh.empty()){ // Se acabar todos os camihos(vizinhos) retorne para o anterior
        g = deep(g, VertTemp, false);
    }

    g.graph[VertTemp].SetVisited(false);
    return g;
}

vector<std::string> removePermutacoesIguais(std::vector<std::string>& cycl) {
    // Conjunto para armazenar versões ordenadas das strings
    std::unordered_set<std::string> vistas;
    size_t i = 0;
    
    while (i < cycl.size()) {
        // Cria uma cópia ordenada da string atual
        std::string sorted = cycl[i];
        std::sort(sorted.begin(), sorted.end());
        
        // Se já vimos essa combinação ordenada, remove a string atual
        if (vistas.count(sorted)) {
            cycl.erase(cycl.begin() + i);
        }
        // Se não, adiciona ao conjunto e avança
        else {
            vistas.insert(sorted);
            i++;
        }
    }
    return cycl;
}

int countNumbers(const std::string& str) {
    std::stringstream ss(str);
    std::string temp;
    int count = 0;
    
    // Conta cada segmento separado por hífen
    while (std::getline(ss, temp, '-')) {
        count++;
    }
    
    return count;
}

int contarStrings2(const std::vector<std::string>& vetor) {
    int contador = 0;

    // Percorrer todas as strings no vetor
    for (const auto& str : vetor) {
        // Verificar se o tamanho da string é maior que 2 e se termina com 'k' 
        if (countNumbers(str) > 2) {
            contador++; // Incrementar o contador para cada string que atende a condição
            ciclo.push_back(str);
            //cout << "f: " << str << "-" << str[0] << endl;
        }
    }
    

    return contador; // Retornar o número total de strings que atendem à condição
}

int contar(vector<int> viz, graphVet g){
    int c = 0;
    for (int i = 0; i < viz.size(); i++){
        c += contarStrings2(g.graph[viz[i]].caminho); // Certifica apenas os caminhos que termina em seu vizinho(Possa ser um ciclo) seja contado
    }
    //cout << "C: " << c << endl;
    return c;
}

void bsc(graphVet g){
    int cont = 0;
    graphVet gg = g; // É o grafo baseado na lista de adjacência
    vector<std::string> vet;
    vert = 0;
    std::cout << "Grafo:" << std::endl;
    g.Show(); // Printa os vértices e seus vizinhos
    stack<int> pillow;
    string path = "";
    
    
    for (int i = 0; i < g.NVertice; i++){ // Para todos os vértices
        g = gg; // reinicia a caminhamento resetando os vértices vizitados
        vert = i;
    
    
        path = "" + to_string(vert); // Grava o caminho feito até o vértice atual (O vértice atual entra no caminho)
        g.graph[vert].caminho.push_back(path); // Adiciona caminho a lista de caminhos do vértice

        g = deep(g, vert, true); // Busca profunda
        
        //cout << "FIM" << endl;
        //showCiclo();

        contar(g.ShowProx(vert), g); // remove caminhos que não são ciclos
        vet = removePermutacoesIguais(ciclo); // remove os ciclos com vértices iguais
        
    }
    cout << "\nTotal de ciclos: " << vet.size() << endl;
    
    
    // Imprime resultado
    for (int i = 0; i < vet.size(); i++){
        cout << "F: " << vet[i] << "-" << vet[i][0] << endl;
    }
    
}



int main(int argc, char* argv[]){
    graphVet g;
    g.SetDefault(); // para criar um grafa padrao
    auto inicio = std::chrono::high_resolution_clock::now();
    bsc(g); // inicio da busca em profundidade
    auto fim = std::chrono::high_resolution_clock::now();
    auto duracao = std::chrono::duration_cast<std::chrono::microseconds>(fim - inicio).count();

    std::cout << "Tempo de execução: " << duracao << " microssegundos" << std::endl;
    
    return 0;
}

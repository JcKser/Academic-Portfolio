#include <iostream>
#include <vector>
#include <algorithm> // Para std::find

using namespace std;
 // A B C D E F  //
//  0 1 2 3 4 5 //

class vertice{
    private:
        int uVertice;
        bool visitado;
    public:
        int anterior;
        vertice* prox;
        vector<string> caminho;

        bool ExisteCaminho(string path){
            // Verifica se o path existe no vector
            auto it = std::find(this->caminho.begin(), this->caminho.end(), path);

            if (it != this->caminho.end()) {
                //std::cout << "A path foi encontrada no vetor!" << std::endl;
                //cout << path << endl;
                return true;
            } else {
                //std::cout << "A path não foi encontrada no vetor!" << std::endl;
                //cout << path << endl;
                return false;
            }
        }
        void SetVisited(bool b){
            this->visitado = b;
        }
        bool Visited(){
            return this->visitado;
        }
        
        string ShowCaminho(int v){
            string a = "";
            for (int i = 0; i < this->caminho[v].size(); i++){
                a += this->caminho[v];
                cout << "a: " << this->caminho[i];
            }
            
            return a;
        }
        int Show(){
            return this->uVertice;
        }
        void aponta(int u){
            this->prox = new vertice(u);
        }
        vertice(int v) : uVertice(v), prox(nullptr) {this->visitado = false; }
};

class graphVet{
    public:
        vector<vertice> graph;
        int NVertice;

        
        
        vector<int> ShowProx(int v){
            vector<int> p;
            vertice* tmp = graph[v].prox;

            while (tmp != nullptr){
                p.push_back(tmp->Show());
                tmp = tmp->prox;
            }
            return p;
        }
    
        void SetDefault(){
            int n = 6;
            this->NVertice = n;
            for (int i = 0; i < n; i++){
                vertice novo(-1);
                this->graph.push_back(novo);
            }
             // A B C D E F  //
            //  0 1 2 3 4 5 //
            /*
            Apontar(0,1);
            Apontar(1,2);
            Apontar(2,3);
            Apontar(3,0);
            Apontar(0,3);
            Apontar(3,2);
            Apontar(2,1);
            Apontar(1,0);

            Apontar(0,2);
            Apontar(2,0);
            Apontar(3,1);
            Apontar(1,3);*/
            Apontar(0,1); Apontar(0,3); Apontar(0,4); // A
            Apontar(1, 0); Apontar(1,3); Apontar(1,4); Apontar(1,2); // B
            Apontar(2, 1); Apontar(2,3); Apontar(2,4); Apontar(2,5); // C
            Apontar(3, 0); Apontar(3,1); Apontar(3,2); Apontar(3,5);// D
            Apontar(4, 0); Apontar(4,1); Apontar(4,2); Apontar(4,5);// E
            Apontar(5,3); Apontar(5,2); Apontar(5,4);// F

/*
            Apontar(0,1);
            Apontar(0,2);
            Apontar(0,3);
            Apontar(0,4);
            Apontar(0,5);
            Apontar(0,6);
            Apontar(0,7);

            Apontar(1,0);
            Apontar(1,2);
            Apontar(1,3);
            Apontar(1,4);
            Apontar(1,5);
            Apontar(1,6);
            Apontar(1,7);

            Apontar(2,1);
            Apontar(2,0);
            Apontar(2,3);
            Apontar(2,4);
            Apontar(2,5);
            Apontar(2,6);
            Apontar(2,7);

            Apontar(3,1);
            Apontar(3,2);
            Apontar(3,0);
            Apontar(3,4);
            Apontar(3,5);
            Apontar(3,6);
            Apontar(3,7);

            Apontar(4,1);
            Apontar(4,2);
            Apontar(4,3);
            Apontar(4,0);
            Apontar(4,5);
            Apontar(4,6);
            Apontar(4,7);

            Apontar(5,1);
            Apontar(5,2);
            Apontar(5,3);
            Apontar(5,4);
            Apontar(5,0);
            Apontar(5,6);
            Apontar(5,7);

            Apontar(6,1);
            Apontar(6,2);
            Apontar(6,3);
            Apontar(6,4);
            Apontar(6,5);
            Apontar(6,0);
            Apontar(6,7);

            Apontar(7,1);
            Apontar(7,2);
            Apontar(7,3);
            Apontar(7,4);
            Apontar(7,5);
            Apontar(7,6);
            Apontar(7,0);*/
            
        };
        void Show(){
            for (int i = 0; i < this->NVertice; i++)
            {   
                vector<int> p = this->ShowProx(i);
                cout << i << ": ";
                for (int j = 0; j < p.size(); j++)
                {
                    cout << p[j] << ", ";
                }
                cout << endl;
            }
            
        }
        void Apontar(int v, int u){
            if(this->graph[v].prox == nullptr){
                this->graph[v].aponta(u);
            }else{
                vertice* tmp = this->graph[v].prox;

                while (tmp->prox != nullptr){
                    tmp = tmp->prox;
                }
                tmp->aponta(u);
            }
        }
        vector<int> getNeighbors(int v) const {
            // Como ShowProx não é modificada, podemos chamar ela aqui
            // Se necessário, remova o 'const_cast' ou ajuste a definição de ShowProx para const
            return const_cast<graphVet*>(this)->ShowProx(v);
        }
    };


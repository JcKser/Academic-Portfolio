#include <iostream>
#include <cmath>

class Retangulo {
private:
    double base;
    double altura;

public:
    // Construtor padrão
    Retangulo() : base(0.0), altura(0.0) {}

    // Construtor com parâmetros
    Retangulo(double b, double a) : base(b), altura(a) {}

    // Método para obter a área do retângulo
    double getArea() {
        return base * altura;
    }

    // Método para obter o perímetro do retângulo
    double getPerimetro() {
        return 2 * (base + altura);
    }

    // Método para obter a diagonal do retângulo
    double getDiagonal() {
        return sqrt(base * base + altura * altura);
    }
};

class Lixao {
public:
    static void main() {
        double base1, altura1, base2, altura2;
        std::cout << "Digite a base do primeiro retângulo: ";
        std::cin >> base1;
        std::cout << "Digite a altura do primeiro retângulo: ";
        std::cin >> altura1;
        std::cout << "Digite a base do segundo retângulo: ";
        std::cin >> base2;
        std::cout << "Digite a altura do segundo retângulo: ";
        std::cin >> altura2;

        Retangulo retangulo1(base1, altura1);
        Retangulo retangulo2(base2, altura2);

        std::cout << "Propriedades do primeiro retângulo:" << std::endl;
        std::cout << "Área: " << retangulo1.getArea() << std::endl;
        std::cout << "Perímetro: " << retangulo1.getPerimetro() << std::endl;
        std::cout << "Diagonal: " << retangulo1.getDiagonal() << std::endl;

        std::cout << "Propriedades do segundo retângulo:" << std::endl;
        std::cout << "Área: " << retangulo2.getArea() << std::endl;
        std::cout << "Perímetro: " << retangulo2.getPerimetro() << std::endl;
        std::cout << "Diagonal: " << retangulo2.getDiagonal() << std::endl;
    }
};

int main() {
    Lixao::main();
    return 0;
}

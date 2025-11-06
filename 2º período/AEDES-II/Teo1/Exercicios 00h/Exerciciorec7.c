#include <stdio.h>

int problem1_recursive(int n) {
    if (n == 0) {
        return 1;
    } else if (n == 1) {
        return 2;
    } else {
        return problem1_recursive(n - 1) * problem1_recursive(n - 2) - problem1_recursive(n - 1);
    }
}

int main() {
    int n;
    printf("Digite um valor para n: ");
    scanf("%d", &n);

    int result = problem1_recursive(n);
    printf("T(%d) = %d\n", n, result);

    return 0;
}

#include <stdio.h>

int problem2_recursive(int n) {
    if (n == 0) {
        return 1;
    } else {
        return problem2_recursive(n - 1) * problem2_recursive(n - 1);
    }
}

int main() {
    int n;
    printf("Digite um valor para n: ");
    scanf("%d", &n);

    int result = problem2_recursive(n);
    printf("T(%d) = %d\n", n, result);

    return 0;
}

#include <stdio.h>
#include <string.h>

int main() {
    int N;
    while (1) {
        scanf("%d", &N);

        if (N == 0) {
            break; // Encerra o programa se N for igual a 0
        }

        while (N--) {
            char str1[51], str2[51], result[101];
            scanf("%s %s", str1, str2);

            int len1 = strlen(str1);
            int len2 = strlen(str2);

            int i, j, k;
            for (i = 0, j = 0, k = 0; i < len1 || j < len2; i++, j++) {
                if (i < len1) {
                    result[k++] = str1[i];
                }
                if (j < len2) {
                    result[k++] = str2[j];
                }
            }

            result[k] = '\0';
            printf("%s\n", result);
        }
    }

    return 0;
}

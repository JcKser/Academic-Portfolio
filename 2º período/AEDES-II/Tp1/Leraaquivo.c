
#include <math.h>
#include <stdio.h>
#include <stdbool.h>

void appendFileInt(char *filename, int content)
{
    FILE *arquivo = fopen(filename, "at");

    fprintf(arquivo, "%d\n", content);

    fclose(arquivo);
}

void writeMultiplesOdd(char *fileName, int loop)
{
    FILE *arquivo = fopen(fileName, "wt");

    int loopControl = 1;
    int number = 0;
    int multiplier = 1;

    while (loopControl <= loop)
    {
        number = 3 * multiplier;

        if (number % 2 != 0)
        {
            fprintf(arquivo, "%d\n", number);
            printf("\n%d", number);

            loopControl++;
        }
        multiplier++;
    }
    fclose(arquivo);
}

void readSum(char *filename)
{
    FILE *arquivo = fopen(filename, "r");
    FILE *resposta = fopen("RESULTADO07.TXT", "wt");
    double number = 0;
    double sum = 0;

    fscanf(arquivo, "%lf\n", &number);
    printf("sum = %lf\n", sum);
    sum = sum + number;
    printf("sum = %lf\n", sum);

    while (!feof(arquivo))
    {
        fscanf(arquivo, "%lf\n", &number);

        printf("%lf\n", number);
        sum = sum + number;
        printf("sum = %lf\n", sum);
    }
    fprintf(resposta, "%lf\n", sum);

    fclose(resposta);
    fclose(arquivo);
}

void readchars(char *filenameIn, char *filenameOut)
{
    FILE *arquivoIn = fopen(filenameIn, "r");
    FILE *arquivoOut = fopen(filenameOut, "wt");

    char string[80];
    int stringQuantity = 0;
    int index = 0;
    char singleCharacter;
    int upperCount = 0;

    while (!feof(arquivoIn))
    {
        // fscanf(arquivoIn, "%s\n", &string);
        fgets(string, 80, arquivoIn);
        printf("\nThis line of the archive reads %s", string);
        stringQuantity = strlen(string);
        printf("\nQuantidade de Characteres %d", stringQuantity);

        for (index = 0; index < stringQuantity; index = index + 1)
        {
            singleCharacter = string[index];
            // printf("\n%s\n",singleCharacter);

            if (isUpperCase(singleCharacter))
            {
                upperCount = upperCount + 1;
                fprintf(arquivoOut, "%c\n", singleCharacter);
            }
            // printf("loop Concluido\n");
        }
    }
    fprintf(arquivoOut, "\n%d resultados\n", upperCount);

    fclose(arquivoIn);
    fclose(arquivoOut);
}

void readAndStore(char *filenameOut, int control)
{
    FILE *arquivoOut = fopen(filenameOut, "wt");

    float realnum;

    int index = 0;
    while (index < control)
    {
        scanf("%f", &realnum);
        fprintf(arquivoOut, "%lf\n", realnum);
        index++;
    }

    fclose(arquivoOut);
}

void showFromFile(char *filenameIn, int control, int index)
{
    FILE *arquivoOut = fopen(filenameIn, "r");

    float realnum;

    if (index < control)
    {
        for (int indx = 0; indx < index; indx++)
        {
            fscanf(arquivoOut, "%f\n", &realnum);
        }
        fscanf(arquivoOut, "%f\n", &realnum);

        showFromFile(filenameIn, control, index + 1);

        if ((realnum - (int)realnum) > 0)
        {
            // printf("%.3f\n");
            printf("%.3f\n", realnum);
        }
        else
        {
            printf("%.0f\n", realnum);
        }
    }

    fclose(arquivoOut);
}

int main()
{
    int quantity;
    // printf("Scanning...\n");
    scanf("%d", &quantity);

    // printf("RAS Start...\n");
    readAndStore("pubOUT.txt", quantity);
    // printf("RAS END...\n");

    // printf("SFF Start...\n");
    showFromFile("pubOUT.txt", quantity, 0);
    // printf("SFF END...\n");

    return (0);
} // fim main( )
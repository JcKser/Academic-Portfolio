#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <time.h>
#include <stdlib.h>
#define MAX_ATTRIBUTES 8
#define MAX_LEN 100

//----------------------------------PLAYER CLASS------------------------------//
typedef struct Player
{
    int id;
    char name[50];
    int height;
    int weight;
    char university[100];
    int birthYear;
    char birthCity[50];
    char birthState[50];

} Player;

void printPlayer(Player players)
{
    printf(" ## %s ## %d ## %d ## %d ## %s ## %s ## %s ##\n",
           players.name,
           players.height,
           players.weight,
           players.birthYear,
           players.university,
           players.birthCity,
           players.birthState);
}

//------------------------------------SPLIT CLASS------------------------------//

typedef struct Split
{
    char line[MAX_ATTRIBUTES][MAX_LEN];
} Split;

void split(char line[], char substrings[8][100])
{
    int numSubstrings = 0;
    int currentSubstringPos = 0; // position of the current substring
    int currentPos = 0;          // position in the line
    // initialization of the substrings matrix for control purposes
    for (int i = 0; i < 8; i++)
    {
        for (int j = 0; j < 100; j++)
        {
            substrings[i][j] = '\0';
        }
    }
    // loop that repeats until the line string is completely traversed
    while (line[currentPos] != '\0')
    {
        if (line[currentPos] != ',')
        {
            while (line[currentPos] != ',' && line[currentPos] != '\0')
            {
                if (line[currentPos] == '\n')
                    currentPos++; // ignore line breaks
                else
                {
                    substrings[numSubstrings][currentSubstringPos] = line[currentPos];
                    currentPos++;
                    currentSubstringPos++;
                }
            }
            currentSubstringPos = 0;
            numSubstrings++;
        }
        else
        {
            // conditional in case the field is empty
            if (line[currentPos + 1] == ',' || line[currentPos + 1] == '\n' || line[currentPos + 1] == '\0')
            {
                strcpy(substrings[numSubstrings], "nao informado ");
                numSubstrings++;
            }
            currentPos++;
        }
    }
}

void readPlayers(Player players[], FILE *file)
{

    char line[200];
    int numPlayers = -1; // negative initialization so that the first line is ignored

    while (fgets(line, sizeof(line), file) != NULL)
    {
        char substrings[8][100];
        if (numPlayers >= 0)
        {
            split(line, substrings);
            // conversion from strings to integers
            int ID = atoi(substrings[0]);
            int h = atoi(substrings[2]);
            int w = atoi(substrings[3]);
            int year = atoi(substrings[5]);

            players[numPlayers].id = ID;
            strcpy(players[numPlayers].name, substrings[1]);
            players[numPlayers].height = h;
            players[numPlayers].weight = w;
            strcpy(players[numPlayers].university, substrings[4]);
            players[numPlayers].birthYear = year;
            strcpy(players[numPlayers].birthCity, substrings[6]);
            strcpy(players[numPlayers].birthState, substrings[7]);
            numPlayers++;
        }
        else
            numPlayers++;
    }
}

Split SplitSpace()
{ // asks and splits by spaces

    Split Split;

    for (int i = 0; i < 3; i++)
    {
        scanf("%[^ \n]", Split.line[i]);
        if (getchar() == '\n')
            i = 3;
    }

    return Split;
}

//------------------------------------CELL CLASS------------------------------//

typedef struct Cell
{
    Player player;    // Element inserted in the cell.
    struct Cell *next; // Points to the cell below.
} Cell;

Cell *newCell(Player element)
{
    Cell *newCell = (Cell *)malloc(sizeof(Cell));
    newCell->player = element;
    newCell->next = NULL;

    return newCell;
}

//------------------------------------STACK CLASS------------------------------//
typedef struct Stack
{
    Cell *top;
    int size;

    void (*Insert)(struct Stack *, Player x);

    Player (*Remove)(struct Stack *);

    void (*Show)(struct Stack);

    void (*Close)(struct Stack *);

} Stack;

// INSERT INTO THE STACK

void InsertEndStack(Stack *stack, Player x)
{

    Cell *tmp = newCell(x);

    tmp->next = stack->top;
    stack->top = tmp;
    stack->size++;
}

// REMOVE FROM THE STACK
Player RemoveEndStack(Stack *stack)
{
    // validate removal
    if (stack->top == NULL)
    {
        printf("Error removing!");
        exit(1);
    }

    Cell *tmp = stack->top;
    Player removed = tmp->player;
    stack->top = stack->top->next;

    /*cleaning variables*/
    tmp->next = NULL;
    free(tmp);
    tmp = NULL;

    stack->size--;

    return removed;
}

// Show Stack

void showStack(int size, Cell *top)
{
    if (top->next != NULL)
    {
        showStack(size - 1, top->next);
    }

    printf("[%d]", size);
    printPlayer(top->player);
}

void ShowStack(Stack stack)
{
    if (stack.size == 0)
    {
        printf("Empty Stack");
        exit(1);
    }

    /*Doing it recursively allows it to go from the first element to the last*/
    showStack(stack.size - 1, stack.top);
}

// Close Stack
void CloseStack(Stack *Stack)
{
    Cell *i = Stack->top;
    while (i != NULL)
    {
        i = i->next;
    }
}

Stack newStack()
{

    Stack Stack;

    Stack.size = 0;
    Stack.top = NULL;

    Stack.Insert = InsertEndStack;

    Stack.Remove = RemoveEndStack;

    Stack.Show = ShowStack;
    Stack.Close = CloseStack;

    return Stack;
}

//------------------------------------MAIN------------------------------//

void doCommand(Stack *stack, Player players[])
{

    Split split = SplitSpace();

    // insert
    if (strcmp(split.line[0], "I") == 0)
    {
        int value = atoi(split.line[1]);
        stack->Insert(stack, players[value]);
    }

    // remove
    if (strcmp(split.line[0], "R") == 0)
    {
        Player player = stack->Remove(stack);
        printf("(R) %s\n", player.name);
    }
}

int main()
{

    char id[50];
    Player players[3922];
    Stack Stack = newStack();

    FILE *file = fopen("/tmp/players.csv", "r");
    do
    {
        scanf("%s", id);
        if (strcmp(id, "FIM") != 0 && strcmp(id, "fim") != 0)
        {
            int identifier = atoi(id);

            readPlayers(players, file);

            Stack.Insert(&Stack, players[identifier]);
        }
    } while ((strcmp(id, "FIM") != 0) && (strcmp(id, "fim") != 0));
    fclose(file);

    /* The following has the functionality of performing the requested commands */
    int action;
    scanf("%i", &action); // number of actions to be performed

    for (int i = 0; i <= action; i++) // repetition to perform the actions
    {
        doCommand(&Stack, players); // performs the commands and inserts in the Stack of removed
    }

    // print the results
    Stack.Show(Stack);
    Stack.Close(&Stack);
}

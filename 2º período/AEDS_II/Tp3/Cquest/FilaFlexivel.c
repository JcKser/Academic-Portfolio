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
                strcpy(substrings[numSubstrings], "nao informado");
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

Split splitSpace()
{ // asks and splits by spaces

    Split split;

    for (int i = 0; i < 3; i++)
    {
        scanf("%[^ \n]", split.line[i]);
        if (getchar() == '\n')
            i = 3;
    }

    return split;
}

//------------------------------------CELL CLASS------------------------------//

typedef struct Cell
{
    Player player;       // Element inserted in the cell.
    struct Cell *next;   // Points to the next cell.
} Cell;

Cell *newCell(Player element)
{
    Cell *newCell = (Cell *)malloc(sizeof(Cell));
    newCell->player = element;
    newCell->next = NULL;

    return newCell;
}

//------------------------------------QUEUE CLASS------------------------------//
typedef struct Queue
{
    Cell *first, *last;
    int size, maxSize;

    void (*Insert)(struct Queue *, Player x);

    Player (*Remove)(struct Queue *);

    void (*Show)(struct Queue *);

    float (*getAverageHeights)(struct Queue);

    void (*Close)(struct Queue *);

} Queue;

// average height of players
float GetAverageHeightsQueue(Queue queue)
{
    float average = 0;
    for (Cell *i = queue.first->next; i != NULL; i = i->next)
    {
        average += i->player.height;
    }

    return average / queue.size;
}

// INSERT INTO THE QUEUE

void InsertQueue(Queue *queue, Player x)
{

    // validate insertion
    if (queue->size == 0)
    {
        queue->first = queue->last = newCell(x);
    }
    else if (queue->size == queue->maxSize + 1)
    {
        queue->Remove(queue);
    }

    queue->last->next = newCell(x);
    queue->last = queue->last->next;

    queue->size++;

    printf("%.f\n", queue->getAverageHeights(*queue));
}

// REMOVE FROM THE QUEUE
Player RemoveStartQueue(Queue *queue)
{
    // validate removal
    if (queue->first == queue->last)
    {
        printf("Error removing!");
        exit(1);
    }

    Cell *tmp = queue->first;
    queue->first = queue->first->next;
    Player removed = queue->first->player;

    tmp->next = NULL;
    free(tmp);
    tmp = NULL;

    queue->size--;

    return removed;
}

// Show Queue
void ShowQueue(Queue *queue)
{

    Cell *i;
    int j = 0;
    for (i = queue->first->next; i != NULL; i = i->next, j++)
    {
        printf("[%d]", j);
        printPlayer(i->player);
    }
}

// Close Queue
void CloseQueue(Queue *queue)
{
    Cell *i = queue->first;
    while (i != NULL)
    {
        i = i->next;
    }
}

Queue newQueue()
{

    Queue queue;

    queue.size = 0;
    queue.first = queue.last = NULL;
    queue.maxSize = 4;

    queue.getAverageHeights = GetAverageHeightsQueue;

    queue.Insert = InsertQueue;

    queue.Remove = RemoveStartQueue;

    queue.Show = ShowQueue;
    queue.Close = CloseQueue;

    return queue;
}

//------------------------------------MAIN------------------------------//

void doCommand(Queue *queue, Player players[])
{

    Split split = splitSpace();

    // insert
    if (strcmp(split.line[0], "I") == 0)
    {
        int value = atoi(split.line[1]);
        queue->Insert(queue, players[value]);
    }

    // remove
    if (strcmp(split.line[0], "R") == 0)
    {
        Player player = queue->Remove(queue);
        printf("(R) %s\n", player.name);
    }
}

int main()
{

    char id[50];
    Player players[3922];
    Queue queue = newQueue();

    FILE *file = fopen("/tmp/players.csv", "r");
    do
    {
        scanf("%s", id);
        if (strcmp(id, "FIM") != 0 && strcmp(id, "fim") != 0)
        {
            int identifier = atoi(id);

            readPlayers(players, file);

            queue.Insert(&queue, players[identifier]);
        }
    } while ((strcmp(id, "FIM") != 0) && (strcmp(id, "fim") != 0));
    fclose(file);

    /* The following has the functionality of performing the requested commands */
    int action;
    scanf("%i", &action); // number of actions to be performed

    for (int i = 0; i <= action; i++) // repetition to perform the actions
    {
        doCommand(&queue, players); // performs the commands and inserts in the removed Queue
    }

    // print the results
    queue.Show(&queue);
    queue.Close(&queue);
}

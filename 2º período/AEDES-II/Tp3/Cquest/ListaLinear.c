#include <stdio.h>
#include <stdbool.h>
#include <string.h>
#include <time.h>
#include <stdlib.h>
#define MAXTAM 500
#define MAX_ATTRIBUTES 8
#define MAX_LEN 100 

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

typedef struct Split {
	char line[MAX_ATTRIBUTES][MAX_LEN];
} Split;

void splitLine(char line[], char substrings[8][100])
{
    int numSubstrings = 0;
    int currentSubstringPos = 0;
    int currentPos = 0;

    for (int i = 0; i < 8; i++)
    {
        for (int j = 0; j < 100; j++)
        {
            substrings[i][j] = '\0';
        }
    }

    while (line[currentPos] != '\0')
    {
        if (line[currentPos] != ',')
        {
            while (line[currentPos] != ',' && line[currentPos] != '\0')
            {
                if (line[currentPos] == '\n')
                    currentPos++;
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
            if (line[currentPos + 1] == ',' || line[currentPos + 1] == '\n' || line[currentPos + 1] == '\0')
            {
                strcpy(substrings[numSubstrings], "nao informado");
                numSubstrings++;
            }
            currentPos++;
        }
    }
}

Split splitSpace()
{
    Split split;

    for (int i = 0; i < 3; i++)
    {
        scanf("%[^ \n]", split.line[i]);
        if (getchar() == '\n')
            i = 3;
    }

    return split;
}

void readPlayers(Player players[], FILE *file)
{
    char line[200];
    int numPlayers = -1;

    while (fgets(line, sizeof(line), file) != NULL)
    {
        char substrings[8][100];
        if (numPlayers >= 0)
        {
            splitLine(line, substrings);

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

typedef struct List
{
    Player *array;
    int size;

    void (*InsertAtBeginning)(struct List *, Player x);
    void (*InsertAtEnd)(struct List *, Player x);
    void (*InsertAt)(struct List *, Player x, int pos);

    Player (*RemoveFromBeginning)(struct List *);
    Player (*RemoveFromEnd)(struct List *);
    Player (*RemoveFrom)(struct List *, int pos);

    void (*Show)(struct List *);
    void (*ShowRemoved)(struct List *);
    void (*Close)(struct List *);

} List;

void InsertAtBeginning(List *list, Player x)
{
    if (list->size >= MAXTAM)
    {
        printf("Error inserting at the beginning!");
        exit(1);
    }

    for (int i = list->size; i > 0; i--)
    {
        list->array[i] = list->array[i - 1];
    }

    list->array[0] = x;
    list->size++;
}

void InsertAtEnd(List *list, Player x)
{
    if (list->size >= MAXTAM)
    {
        printf("Error inserting at the end!");
        exit(1);
    }

    list->array[list->size] = x;
    list->size++;
}

void InsertAt(List *list, Player x, int pos)
{
    if (list->size >= MAXTAM || pos < 0 || pos > list->size)
    {
        printf("Error inserting!");
        exit(1);
    }

    for (int i = list->size; i > pos; i--)
    {
        list->array[i] = list->array[i - 1];
    }

    list->array[pos] = x;
    list->size++;
}

Player RemoveFromBeginning(List *list)
{
    if (list->size == 0)
    {
        printf("Error removing!");
        exit(1);
    }

    Player removed = list->array[0];

    for (int i = 0; i < list->size; i++)
    {
        list->array[i] = list->array[i + 1];
    }

    list->size--;
    return removed;
}

Player RemoveFromEnd(List *list)
{
    if (list->size == 0)
    {
        printf("Error removing!");
        exit(1);
    }

    return list->array[--list->size];
}

Player RemoveFrom(List *list, int pos)
{
    if (list->size == 0 || pos < 0 || pos >= list->size)
    {
        printf("Error removing!");
        exit(1);
    }

    Player removed = list->array[pos];

    for (int i = pos; i < list->size; i++)
    {
        list->array[i] = list->array[i + 1];
    }

    list->size--;
    return removed;
}

void ShowList(List *list)
{
    for (int i = 0; i < list->size; i++)
    {
        printf("[%i]", i);
        printPlayer(list->array[i]);
    }
}

void ShowRemovedList(List *list)
{
    for (int i = 0; i < list->size; i++)
    {
        printf("(R) %s\n", list->array[i].name);
    }
}

void CloseList(List *list)
{
    free(list->array);
}

List NewList()
{
    List list;

    list.size = 0;
    list.array = (Player *)malloc(MAXTAM * sizeof(Player));

    list.InsertAtBeginning = InsertAtBeginning;
    list.InsertAtEnd = InsertAtEnd;
    list.InsertAt = InsertAt;

    list.RemoveFromBeginning = RemoveFromBeginning;
    list.RemoveFromEnd = RemoveFromEnd;
    list.RemoveFrom = RemoveFrom;

    list.ShowRemoved = ShowRemovedList;
    list.Show = ShowList;
    list.Close = CloseList;

    return list;
}

void ProcessCommand(List *list, Player players[], List *removed)
{
    Split split = splitSpace();

    // insert
    if (strcmp(split.line[0], "II") == 0)
    {
        int value = atoi(split.line[1]);
        list->InsertAtBeginning(list, players[value]);
    }

    if (strcmp(split.line[0], "IF") == 0)
    {
        int value = atoi(split.line[1]);
        list->InsertAtEnd(list, players[value]);
    }

    if (strcmp(split.line[0], "I*") == 0)
    {
        int value = atoi(split.line[2]);
        int id = atoi(split.line[1]);
        list->InsertAt(list, players[value], id);
    }

    // remove
    if (strcmp(split.line[0], "RI") == 0)
    {
        removed->InsertAtEnd(removed, list->RemoveFromBeginning(list));
    }

    if (strcmp(split.line[0], "RF") == 0)
    {
        removed->InsertAtEnd(removed, list->RemoveFromEnd(list));
    }

    if (strcmp(split.line[0], "R*") == 0)
    {
        int id = atoi(split.line[1]);
        removed->InsertAtEnd(removed, list->RemoveFrom(list, id));
    }
}

int main()
{
    char id[50];
    Player players[3922];
    List list = NewList();

    FILE *file = fopen("/tmp/players.csv", "r");
    do
    {
        scanf("%s", id);
        if (strcmp(id, "FIM") != 0 && strcmp(id, "fim") != 0)
        {
            int identifier = atoi(id);
            readPlayers(players, file);
            list.InsertAtEnd(&list, players[identifier]);
        }
    } while ((strcmp(id, "FIM") != 0) && (strcmp(id, "fim") != 0));

    fclose(file);

    List removed = NewList(); // list to store removed items

    int action;
    scanf("%i", &action); // number of actions to be performed

    for (int i = 0; i <= action; i++) // repetition to perform the actions
    {
        ProcessCommand(&list, players, &removed); // performs the commands and inserts into the removed list
    }

    // print the results
    removed.ShowRemoved(&removed);
    list.Show(&list);
    list.Close(&list);
    removed.Close(&removed);
}

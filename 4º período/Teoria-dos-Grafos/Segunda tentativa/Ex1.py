def ler_vertices():
    n = int(input("Digite o número de vértices: "))
    print("Digite os vértices separados por espaço:")
    vertices = input().split()
    if len(vertices) != n:
        print("Atenção: O número de vértices informados não corresponde à quantidade especificada.")
    return vertices

def ler_arestas():
    m = int(input("Digite o número de arestas: "))
    arestas = []
    print(f"Digite {m} pares de vértices que formam as arestas (ex: A B):")
    for _ in range(m):
        u, v = input().split()
        arestas.append((u, v))
    return arestas

def construir_grafo(vertices, arestas):
    # Inicializa o grafo como um dicionário, onde cada vértice tem uma lista vazia de vizinhos
    grafo = {vertice: [] for vertice in vertices}
    
    # Preenche o grafo com as arestas (grafo não-direcionado)
    for u, v in arestas:
        if u in grafo and v in grafo:
            grafo[u].append(v)
            grafo[v].append(u)
        else:
            print(f"Aresta ({u}, {v}) contém vértices não informados na lista de vértices.")
    return grafo

def busca_profundidade(grafo, vertice, visitados=None):
    if visitados is None:
        visitados = set()  # Conjunto para armazenar os vértices visitados

    visitados.add(vertice)  # 'set.add(vertice)' adiciona o vértice ao conjunto de visitados.
    # Se o vértice já estiver no conjunto, não é adicionado novamente (evita repetições e loops)
    
    for vizinho in grafo.get(vertice, []):  # Para cada vizinho conectado ao vértice
        if vizinho not in visitados:
            busca_profundidade(grafo, vizinho, visitados)
    
    return visitados

def main():
    # Lê vértices e arestas a partir do usuário
    vertices = ler_vertices()
    arestas = ler_arestas()
    
    # Constrói o grafo usando um dicionário de adjacência
    grafo = construir_grafo(vertices, arestas)
    
    print("\nResumo do Grafo:")
    print("Vértices:", vertices)
    print("Arestas:", arestas)
    print("\nGrafo (lista de adjacência):")
    for vertice, vizinhos in grafo.items():
        print(f"{vertice}: {vizinhos}")
    
    # Realiza a busca em profundidade (DFS)
    inicio = input("\nDigite o vértice de início para a busca em profundidade: ")
    if inicio not in grafo:
        print("Vértice inicial não encontrado no grafo.")
        return

    visitados = busca_profundidade(grafo, inicio)
    print("Vértices visitados na DFS:", visitados)

main()

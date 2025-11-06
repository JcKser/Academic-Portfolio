# Programa para ler dois números da memória, determinar a quantidade de bits significativos,
# e realizar a multiplicação. 

.data
num1: .word 10        # Primeiro número (posição 0)
num2: .word 20        # Segundo número (posição 1)
result: .word 0       # Para armazenar resultado se a multiplicação não ultrapassar 32 bits
result_hi: .word 0    # Para armazenar parte alta do resultado se ultrapassar 32 bits
result_lo: .word 0    # Para armazenar parte baixa do resultado se ultrapassar 32 bits

.text
.globl main

main:
    # Carregar os números da memória
    lw $s0, num1      # Carregar num1 para $s0
    lw $s1, num2      # Carregar num2 para $s1

    # Determinar a quantidade de bits significativos de num1
    move $t2, $s0     # Colocar num1 em $t2 para manipulação
    li $t0, 0         # Inicializar contador de bits significativos para num1

count_bits1:
    beq $t2, $zero, end_count1  # Se $t2 for zero, terminar contagem
    srl $t2, $t2, 1             # Deslocar $t2 para a direita
    addi $t0, $t0, 1            # Incrementar contador

    j count_bits1

end_count1:

    # Determinar a quantidade de bits significativos de num2
    move $t3, $s1     # Colocar num2 em $t3 para manipulação
    li $t1, 0         # Inicializar contador de bits significativos para num2

count_bits2:
    beq $t3, $zero, end_count2  # Se $t3 for zero, terminar contagem
    srl $t3, $t3, 1             # Deslocar $t3 para a direita
    addi $t1, $t1, 1            # Incrementar contador

    j count_bits2

end_count2:

    # Realizar a multiplicação
    mult $s0, $s1
    mflo $s2       # Parte baixa do resultado da multiplicação
    mfhi $s3       # Parte alta do resultado da multiplicação

    # Verificar se os bits significativos são menores que 32
    li $t4, 32
    blt $t0, $t4, check_second  # Se os bits significativos de num1 < 32, verificar num2

check_second:
    blt $t1, $t4, store_single  # Se os bits significativos de num2 < 32, armazenar em $s2

    j store_double  # Caso contrário, armazenar em $s2 e $s3

store_single:
    sw $s2, result     # Armazenar resultado em result
    j end_program

store_double:
    sw $s2, result_lo  # Armazenar parte baixa em result_lo
    sw $s3, result_hi  # Armazenar parte alta em result_hi

end_program:
    # Encerrar o programa
    li $v0, 10         # Syscall para encerrar o programa
    syscall            # Chama a syscall para terminar a execução

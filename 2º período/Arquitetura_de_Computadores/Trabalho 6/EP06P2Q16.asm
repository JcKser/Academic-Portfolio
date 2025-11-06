# Programa para avaliar a expressão (x * y) / z
# x = 1600000 (0x186A00)
# y = 80000 (0x13880)
# z = 400000 (0x61A80)

.data
.text

main:
    # Inicializando os registradores com os valores fornecidos
    li $t0, 0x186A00  # x = 1600000
    li $t1, 0x13880   # y = 80000
    li $t2, 0x61A80   # z = 400000

    # Multiplicação x * y
    mult $t0, $t1
    mflo $t3  # Resultado da multiplicação (menos significativos) em $t3

    # Divisão (x * y) / z
    div $t3, $t2
    mflo $t4  # Resultado da divisão (quociente) em $t4

    # Fim do programa (o resultado está em $t4)
  
    li $v0, 1        
    move $a0, $t4    # Coloca o valor do resultado em $a0
    syscall          

    # Encerrar o programa
    li $v0, 10       # Syscall para encerrar o programa
    syscall          # Chama a syscall para terminar a execução

.data
x:  .word 0    # x será lido da primeira posição livre da memória
y:  .word 0    # y será escrito na segunda posição livre

.text
main:
    lw $t0, x    # Carrega o valor de x
    bgtz $t0, greater_than_zero    # Se x > 0, vá para a label greater_than_zero
    blez $t0, less_than_or_equal_zero    # Se x <= 0, vá para a label less_than_or_equal_zero

greater_than_zero:
    # y = x^3 + 1
    mul $t1, $t0, $t0    # $t1 = x^2
    mul $t1, $t1, $t0    # $t1 = x^3
    addi $t1, $t1, 1    # $t1 = x^3 + 1
    sw $t1, y    # Armazena o resultado em y
    j end    # Pula para o final

less_than_or_equal_zero:
    # y = x^4 - 1
    mul $t1, $t0, $t0    # $t1 = x^2
    mul $t1, $t1, $t1    # $t1 = x^4
    addi $t1, $t1, -1    # $t1 = x^4 - 1
    sw $t1, y    # Armazena o resultado em y

end:
    # Fim do programa
    li $v0, 10    # Serviço de saída para encerrar o programa
    syscall

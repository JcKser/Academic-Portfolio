.data
x:  .word 0    # x será lido da primeira posição livre da memória
y:  .word 0    # y será escrito na segunda posição livre

.text
main:
    lw $t0, x    # Carrega o valor de x
    andi $t1, $t0, 1    # Verifica se x é par ou ímpar (par: $t1 = 0, ímpar: $t1 = 1)
    beq $t1, $zero, par    # Se x for par, vá para a label par
    bne $t1, $zero, impar  # Se x for ímpar, vá para a label impar

par:
    # y = x^4 + x^3 - 2x^2
    mul $t2, $t0, $t0    # $t2 = x^2
    mul $t2, $t2, $t2    # $t2 = x^4
    mul $t3, $t0, $t0    # $t3 = x^2
    mul $t3, $t3, $t0    # $t3 = x^3
    mul $t4, $t0, $t0    # $t4 = x^2
    addi $t4, $t4, -2    # $t4 = -2x^2
    add $t5, $t2, $t3    # $t5 = x^4 + x^3
    add $t5, $t5, $t4    # $t5 = x^4 + x^3 - 2x^2
    sw $t5, y    # Armazena o resultado em y
    j end    # Pula para o final

impar:
    # y = x^5 - x^3 + 1
    mul $t2, $t0, $t0    # $t2 = x^2
    mul $t2, $t2, $t0    # $t2 = x^3
    mul $t3, $t0, $t0    # $t3 = x^2
    mul $t3, $t3, $t3    # $t3 = x^4
    mul $t4, $t0, $t3    # $t4 = x^5
    addi $t5, $t2, -1    # $t5 = x^3 - 1
    sub $t5, $t4, $t5    # $t5 = x^5 - x^3 + 1
    sw $t5, y    # Armazena o resultado em y

end:
    # Fim do programa
    li $v0, 10    # Serviço de saída para encerrar o programa
    syscall

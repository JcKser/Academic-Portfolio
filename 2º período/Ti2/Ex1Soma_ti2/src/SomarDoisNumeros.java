import java.util.*;

class SomarDoisNumeros 
{
     public String toString() {
		return "SomarDoisNumeros [getClass()=" + getClass() + ", hashCode()=" + hashCode() + ", toString()="
				+ super.toString() + "]";
	}
	public static Scanner getSc() {
		return sc;
	}
	public static void setSc(Scanner sc) {
		SomarDoisNumeros.sc = sc;
	}
	public static Scanner sc = new Scanner(System.in);
     public static void main (String args[]){
    	//Declaracao de variaveis
    	int num1, num2, soma;
    	//Leituras
    	System.out.println("Digite um número");
    	num1 = sc.nextInt();
    	System.out.println("Digite outro número");
    	num2 = sc.nextInt();
    	//Somar
    	soma = num1 + num2;
    	//Mostrar na tela
    	System.out.println("Soma:" + soma);
    	}
     
}

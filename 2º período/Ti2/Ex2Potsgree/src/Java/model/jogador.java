package model;

public class jogador {
	private int id;
	private String nome;
	private String posicao;
	private int salario;
	
	public jogador() {
		this.id = -1;
		this.nome = "";
		this.posicao = "";
		this.salario = -1;
	}
	
	public jogador(int id, String nome, String posicao, int salario) {
		this.id = id;
		this.nome = nome;
		this.posicao = posicao;
		this.salario = salario;
	}

	public int getid() {
		return id;
	}

	public void setid(int id) {
		this.id = id;
	}

	public String getnome() {
		return nome;
	}

	public void setnome(String nome) {
		this.nome = nome;
	}

	public String getposicao() {
		return posicao;
	}

	public void setposicao(String posicao) {
		this.posicao = posicao;
	}

	public int getsalario() {
		return salario;
	}

	public void setsalario(int salario) {
		this.salario = salario;
	}

	@Override
	public String toString() {
		return "jogador [id=" + id + ", nome=" + nome + ", posicao=" + posicao + ", salario=" + salario + "]";
	}	
}

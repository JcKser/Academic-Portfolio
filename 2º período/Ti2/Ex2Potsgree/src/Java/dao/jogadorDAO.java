package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import model.jogador;

public class jogadorDAO extends DAO {
	
	public jogadorDAO() {
		super();
		conectar();
	}

	public void finalize() {
		close();
	}
	
	
	public boolean insert(jogador jogador) {
		boolean status = false;
		try {  
			Statement st = conexao.createStatement();
			String sql = "INSERT INTO jogador (id, nome, posicao, salario) "
				       + "VALUES ("+jogador.getid()+ ", '" + jogador.getnome() + "', '"  
				       + jogador.getposicao() + "', '" + jogador.getsalario() + "');";
			System.out.println(sql);
			st.executeUpdate(sql);
			st.close();
			status = true;
		} catch (SQLException u) {  
			throw new RuntimeException(u);
		}
		return status;
	}

	
	public jogador get(int id) {
		jogador jogador = null;
		
		try {
			Statement st = conexao.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
			String sql = "SELECT * FROM jogador WHERE id=" + id;
			System.out.println(sql);
			ResultSet rs = st.executeQuery(sql);	
	        if(rs.next()){            
	        	 jogador = new jogador(rs.getInt("id"), rs.getString("nome"), rs.getString("posicao"), rs.getInt("salario"));
	        }
	        st.close();
		} catch (Exception e) {
			System.err.println(e.getMessage());
		}
		return jogador;
	}
	
	
	public List<jogador> get() {
		return get("");
	}

	
	public List<jogador> getOrderByid() {
		return get("id");		
	}
	
	
	public List<jogador> getOrderBynome() {
		return get("nome");		
	}
	
	
	public List<jogador> getOrderBysalario() {
		return get("salario");		
	}
	
	
	private List<jogador> get(String orderBy) {	
	
		List<jogador> jogador = new ArrayList<jogador>();
		
		try {
			Statement st = conexao.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
			String sql = "SELECT * FROM jogador" + ((orderBy.trim().length() == 0) ? "" : (" ORDER BY " + orderBy));
			System.out.println(sql);
			ResultSet rs = st.executeQuery(sql);	           
	        while(rs.next()) {	            	
	        	jogador u = new jogador(rs.getInt("id"), rs.getString("nome"), rs.getString("posicao"), rs.getInt("salario"));
	            jogador.add(u);
	        }
	        st.close();
		} catch (Exception e) {
			System.err.println(e.getMessage());
		}
		return jogador;
	}


	public List<jogador> getsalarioMasculino() {
		List<jogador> jogador = new ArrayList<jogador>();
		
		try {
			Statement st = conexao.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
			String sql = "SELECT * FROM jogador WHERE jogador.salario";
			System.out.println(sql);
			ResultSet rs = st.executeQuery(sql);	           
	        while(rs.next()) {	            	
	        	jogador u = new jogador(rs.getInt("id"), rs.getString("nome"), rs.getString("posicao"), rs.getString("salario").charAt(0));
	            jogador.add(u);
	        }
	        st.close();
		} catch (Exception e) {
			System.err.println(e.getMessage());
		}
		return jogador;
	}
	
	
	public boolean update(jogador jogador) {
		boolean status = false;
		try {  
			Statement st = conexao.createStatement();
			String sql = "UPDATE jogador SET nome = '" + jogador.getnome() + "', posicao = '"  
				       + jogador.getposicao() + "', salario = '" + jogador.getsalario() + "'"
					   + " WHERE id = " + jogador.getid();
			System.out.println(sql);
			st.executeUpdate(sql);
			st.close();
			status = true;
		} catch (SQLException u) {  
			throw new RuntimeException(u);
		}
		return status;
	}
	
	public boolean delete(int id) {
		boolean status = false;
		try {  
			Statement st = conexao.createStatement();
			String sql = "DELETE FROM jogador WHERE id = " + id;
			System.out.println(sql);
			st.executeUpdate(sql);
			st.close();
			status = true;
		} catch (SQLException u) {  
			throw new RuntimeException(u);
		}
		return status;
	}
	
	
	public boolean autenticar(String nome, String posicao) {
		boolean resp = false;
		
		try {
			Statement st = conexao.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE,ResultSet.CONCUR_READ_ONLY);
			String sql = "SELECT * FROM jogador WHERE nome LIKE '" + nome + "' AND posicao LIKE '" + posicao  + "'";
			System.out.println(sql);
			ResultSet rs = st.executeQuery(sql);
			resp = rs.next();
	        st.close();
		} catch (Exception e) {
			System.err.println(e.getMessage());
		}
		return resp;
	}	
}
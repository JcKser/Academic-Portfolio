class Usuario {
  int? id;
  String nome;
  String sobrenome;
  DateTime? data;
  String email;
  String senha;

  Usuario({
    this.id,
    required this.nome,
    required this.sobrenome,
    this.data,
    required this.email,
    required this.senha
  });

  factory Usuario.fromSQLite(Map<String, dynamic> map) {
    return Usuario(
      id: map['id'],
      nome: map['nome'],
      sobrenome: map['sobrenome'],
      data: map['data'] != null ? DateTime.parse(map['data']) : null,
      email: map['email'],
      senha: map['senha']
    );
  }

  static List<Usuario> fromSQLiteList(List<Map<String, dynamic>> listMap) {
  List<Usuario> usuarios = [];
  for (Map<String, dynamic> item in listMap) {
    usuarios.add(Usuario.fromSQLite(item));
  }
  return usuarios;
}

}
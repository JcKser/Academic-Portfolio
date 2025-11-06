// ignore_for_file: constant_identifier_names

import 'package:med_alert/shared/models/remedio_model.dart';
import 'package:med_alert/shared/models/usuario_model.dart';

class ConnectionSQL {
  static const String CREATE_TABLE_REMEDIO= '''
  CREATE TABLE Remedios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    dosagem TEXT NOT NULL,
    frequencia INTEGER,
    horario TEXT
  );
  ''';

  static const String CREATE_TABLE_USUARIO = '''
    CREATE TABLE Usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      sobrenome TEXT NOT NULL,
      data TEXT,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL
    );
  ''';


  static String selecionarTodosOsRemedios() {
    return 'SELECT * FROM Remedios;';
  }

  static String adicionarRemedio(Remedio remedio) {
    return '''
      INSERT INTO Remedios (nome, tipo, dosagem, frequencia, horario)
      VALUES ("${remedio.nome}", "${remedio.tipo}", "${remedio.dosagem}", "${remedio.frequencia}", "${remedio.horario}")
    ''';
  }

  static String atualizarRemedio(Remedio remedio) {
  return '''
    UPDATE Remedios SET 
      nome = "${remedio.nome}", 
      tipo = "${remedio.tipo}", 
      dosagem = "${remedio.dosagem}", 
      frequencia = ${remedio.frequencia}, 
      horario = "${remedio.horario}" 
    WHERE id = ${remedio.id}
  ''';
}


  static String deletarRemedio(Remedio remedio){
    return 'DELETE from Remedios WHERE id = ${remedio.id};';
  }

  static String selecionarTodosOsUsuarios() {
    return 'select * from Usuarios;';
  }

  static String adicionarUsuario(Usuario usuario) {
  return '''
    INSERT INTO Usuarios (nome, sobrenome, data, email, senha)
    VALUES ("${usuario.nome}", "${usuario.sobrenome}", "${usuario.data}", "${usuario.email}", "${usuario.senha}");
  ''';
}


  static String atualizarUsuario(Usuario usuario) {
  return '''
    UPDATE Usuarios
    SET nome = '${usuario.nome}',
      sobrenome = '${usuario.sobrenome}',
      data = '${usuario.data}',
      email = '${usuario.email}',
      senha = '${usuario.senha}'
    WHERE id = ${usuario.id};
  ''';
}


  static String deletarUsuario(Usuario usuario){
    return 'DELETE FROM Usuarios WHERE id = ${usuario.id};';
  }

}
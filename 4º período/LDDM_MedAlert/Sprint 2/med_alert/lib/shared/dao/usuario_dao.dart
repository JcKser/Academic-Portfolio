import 'package:sqflite/sqflite.dart';
import 'package:med_alert/shared/models/usuario_model.dart';
import 'package:med_alert/shared/services/connection_sqlite_service.dart';

class UsuarioDao {
  final ConnectionSqliteService _dbService = ConnectionSqliteService.instance;

  Future<Database> get _db async => await _dbService.db;

  // Função para adicionar um novo usuário
  Future<int> adicionarUsuario(Usuario usuario) async {
    final db = await _db;
    return await db.insert('usuarios', {
      'nome': usuario.nome,
      'sobrenome': usuario.sobrenome,
      'data': usuario.data?.toIso8601String(),
      'email': usuario.email,
      'senha': usuario.senha, // Idealmente, armazene uma senha criptografada
    });
  }

  // Função para verificar login
  Future<Usuario?> verificarLogin(String email, String senha) async {
    final db = await _db;
    final List<Map<String, dynamic>> resultado = await db.query(
      'usuarios',
      where: 'email = ? AND senha = ?',
      whereArgs: [email, senha],
    );
    if (resultado.isNotEmpty) {
      return Usuario.fromSQLite(resultado.first);
    }
    return null;
  }

  Future<Usuario?> getUsuarioById(int id) async {
  final db = await ConnectionSqliteService.instance.db;
  final List<Map<String, dynamic>> maps = await db.query(
    'usuarios',
    where: 'id = ?',
    whereArgs: [id],
  );

  if (maps.isNotEmpty) {
    return Usuario.fromSQLite(maps.first); // Certifique-se de ter um método `fromSQLite` no modelo `Usuario`
  } else {
    return null;
  }
}


}

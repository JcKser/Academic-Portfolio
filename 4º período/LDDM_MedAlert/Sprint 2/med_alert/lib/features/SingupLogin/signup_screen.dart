import 'dart:math';

import 'package:flutter/material.dart';
import 'package:med_alert/shared/dao/usuario_dao.dart';
import 'package:med_alert/shared/models/usuario_model.dart';

class SignupScreen extends StatefulWidget {
  @override
  _SignupScreenState createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final UsuarioDao _usuarioDao = UsuarioDao();

  final TextEditingController _nomeController = TextEditingController();
  final TextEditingController _sobrenomeController = TextEditingController();
  final TextEditingController _dataController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _senhaController = TextEditingController();
  final TextEditingController _confirmarSenhaController = TextEditingController();

  Future<void> _cadastrarUsuario() async {
    if (_senhaController.text != _confirmarSenhaController.text) {
      // Verifica se a senha e a confirmação de senha correspondem
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Erro'),
          content: Text('A confirmação de senha não corresponde à senha.'),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
              },
              child: Text('OK'),
            ),
          ],
        ),
      );
      return;
    }

    if (_formKey.currentState!.validate()) {
      // Cria um novo objeto Usuario com os dados do formulário
      print(_dataController.text);
      Usuario novoUsuario = Usuario(
        nome: _nomeController.text,
        sobrenome: _sobrenomeController.text,
        data: _dataController.text.isNotEmpty ? DateTime.parse(_dataController.text) : null,
        email: _emailController.text,
        senha: _senhaController.text, // Idealmente, armazene uma senha criptografada
      );

      // Insere o usuário no banco de dados
      try {
        await _usuarioDao.adicionarUsuario(novoUsuario);
        Navigator.pushReplacementNamed(context, '/home');
      } catch (e) {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Erro de Cadastro'),
            content: Text('Ocorreu um erro ao cadastrar o usuário. Tente novamente.'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Image.asset('assets/logo.png', width: 100, height: 100),
                SizedBox(height: 20),
                Text(
                  'Cadastro',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 20),
                TextFormField(
                  controller: _nomeController,
                  decoration: InputDecoration(
                    labelText: 'Nome',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Nome é obrigatório';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: _sobrenomeController,
                  decoration: InputDecoration(
                    labelText: 'Sobrenome',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Sobrenome é obrigatório';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: _dataController,
                  decoration: InputDecoration(
                    labelText: 'Data de Nascimento',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Data de nascimento é obrigatória';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: _emailController,
                  decoration: InputDecoration(
                    labelText: 'Email',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  keyboardType: TextInputType.emailAddress,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Email é obrigatório';
                    }
                    if (!value.contains('@')) {
                      return 'Digite um email válido!';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: _senhaController,
                  decoration: InputDecoration(
                    labelText: 'Senha',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  obscureText: true,
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Senha é obrigatória';
                    }
                    if (value.length < 6) {
                      return 'A senha deve ter no mínimo 6 caracteres';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 16),
                TextFormField(
                  controller: _confirmarSenhaController,
                  decoration: InputDecoration(
                    labelText: 'Confirmar Senha',
                    labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                  ),
                  obscureText: true,
                  style: TextStyle(color: Colors.white, fontSize: 18),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Confirmação de senha é obrigatória';
                    }
                    if (value != _senhaController.text) {
                      return 'A confirmação de senha não corresponde à senha';
                    }
                    return null;
                  },
                ),
                SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _cadastrarUsuario,
                  style: ElevatedButton.styleFrom(
                    padding: EdgeInsets.symmetric(vertical: 16, horizontal: 32),
                  ),
                  child: Text(
                    'Cadastrar',
                    style: TextStyle(fontSize: 20),
                  ),
                ),
                SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/login');
                  },
                  child: Text(
                    'Já tem um cadastro? Entre aqui!',
                    style: TextStyle(fontSize: 18),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

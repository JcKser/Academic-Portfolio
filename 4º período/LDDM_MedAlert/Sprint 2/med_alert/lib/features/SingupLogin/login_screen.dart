import 'package:flutter/material.dart';
import 'package:med_alert/shared/dao/usuario_dao.dart';
import 'package:med_alert/shared/models/usuario_model.dart';

class LoginScreen extends StatelessWidget {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final UsuarioDao _usuarioDao = UsuarioDao();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset('assets/logo.png', width: 100, height: 100),
              SizedBox(height: 20),
              Text(
                'Login',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 20),
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
                    return 'Campo obrigatório';
                  }
                  if (!value.contains('@')) {
                    return 'Digite um email válido!';
                  }
                  return null;
                },
              ),
              SizedBox(height: 16),
              TextFormField(
                controller: _passwordController,
                decoration: InputDecoration(
                  labelText: 'Senha',
                  labelStyle: TextStyle(color: Colors.white, fontSize: 18),
                ),
                obscureText: true,
                style: TextStyle(color: Colors.white, fontSize: 18),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Campo obrigatório';
                  }
                  if (value.length < 6) {
                    return 'A senha deve ter no mínimo 6 caracteres';
                  }
                  return null;
                },
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    // Se o formulário for válido, verificar o login
                    String email = _emailController.text;
                    String senha = _passwordController.text;

                    Usuario? usuario = await _usuarioDao.verificarLogin(email, senha);

                    if (usuario != null) {
                      // Login bem-sucedido, navega para a tela home
                      Navigator.pushReplacementNamed(context, '/home');
                    } else {
                      // Exibe mensagem de erro se o login falhar
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          title: Text('Erro de Login'),
                          content: Text('Email ou senha incorretos.'),
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
                },
                style: ElevatedButton.styleFrom(
                  padding: EdgeInsets.symmetric(vertical: 16, horizontal: 32),
                ),
                child: Text('Entrar', style: TextStyle(fontSize: 20)),
              ),
              SizedBox(height: 16),
              TextButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/signup');
                },
                child: Text(
                  'Não tem um cadastro? Faça agora!',
                  style: TextStyle(fontSize: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

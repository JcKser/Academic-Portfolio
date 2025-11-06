import 'package:flutter/material.dart';

class SecurityScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Color.fromARGB(255, 154, 193, 221),
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
        title: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Spacer(),
            Text(
              'Segurança e Permissões',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 23.0,
                color: Colors.black,
              ),
            ),
            Spacer(flex: 2),
          ],
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: 20),
            Text(
              'Segurança e Permissões',
              style: TextStyle(
                fontSize: 28.0,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 40),
            buildSectionTitle('Banco de Dados e Núvem'),
            Text(
              'No MedAlert, valorizamos a segurança e a privacidade dos nossos usuários. Iremos salvar as informações do usuário e as fotos do remédio em um banco de dados seguro e na nuvem. Isso garante que suas informações estejam sempre disponíveis e protegidas.',
              style: TextStyle(fontSize: 20.0, color: Colors.black), 
              textAlign: TextAlign.justify,
            ),
            SizedBox(height: 30),
            buildSectionTitle('Tecnologia'),
            Text(
              'Trabalhamos com tecnologia de ponta para assegurar que os dados dos nossos usuários sejam armazenados de maneira segura e acessível. As permissões solicitadas pelo aplicativo são para garantir que você tenha a melhor experiência ao utilizar o MedAlert.',
              style: TextStyle(fontSize: 20.0, color: Colors.black),
              textAlign: TextAlign.justify,
            ),
          ],
        ),
      ),
    );
  }

  Widget buildSectionTitle(String title) {
    return Text(
      title,
      style: TextStyle(
        fontSize: 24.0,
        fontWeight: FontWeight.bold,
        color: Colors.black,
      ),
      textAlign: TextAlign.center,
    );
  }
}

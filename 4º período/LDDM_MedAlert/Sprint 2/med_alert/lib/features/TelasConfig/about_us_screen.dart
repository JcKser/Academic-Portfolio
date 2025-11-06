import 'package:flutter/material.dart';

class AboutUsScreen extends StatelessWidget {
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
              'Sobre Nós',
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
              'Med.Alert',
              style: TextStyle(
                fontSize: 28.0,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: 40),
            buildSectionTitle('Sobre Nós'),
            Text(
              'O MedAlert é um aplicativo inovador voltado para auxiliar pessoas idosas no controle e administração de seus medicamentos. Com um sistema de notificações baseado em um timer configurado previamente, o MedAlert garante que os usuários sejam lembrados de tomar seus remédios na hora certa.',
              style: TextStyle(fontSize: 18.0, color: Colors.black), 
              textAlign: TextAlign.justify,
            ),
            SizedBox(height: 30),
            buildSectionTitle('Como Nós Trabalhamos'),
            Text(
              'O MedAlert é voltado principalmente para pessoas idosas que precisam de ajuda para lembrar de tomar seus remédios. Além disso, cuidadores, familiares e profissionais de saúde também se beneficiam, pois podem acompanhar o uso dos medicamentos e garantir que o paciente está seguindo o tratamento corretamente.',
              style: TextStyle(fontSize: 18.0, color: Colors.black), 
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

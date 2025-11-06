import 'package:flutter/material.dart';
import 'package:med_alert/shared/dao/remedio_dao.dart';
import 'package:med_alert/shared/models/remedio_model.dart';

class TestScreen extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _TestScreenState createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  @override
  void initState() {
    super.initState();
    _testDatabaseConnection();
  }

  // Função de teste sem retornar Widget
  void _testDatabaseConnection() async {
    RemedioDao remedioDao = RemedioDao();

    // Tente adicionar um novo remédio
    Remedio novoRemedio = Remedio(
      nome: 'Paracetamol',
      tipo: 'Comprimido',
      dosagem: '500mg',
      frequencia: 2,
      horario: '',
    );

    // Adicionar
    try {
      Remedio remedioAdicionado = await remedioDao.adicionar(novoRemedio);
      print('Remédio adicionado: ${remedioAdicionado.nome} com ID ${remedioAdicionado.id}');
    } catch (e) {
      print('Erro ao adicionar remédio: $e');
    }

    // Selecionar todos
    try {
      List<Remedio> remedios = await remedioDao.selecionarTodos();
      print('Remédios encontrados: ${remedios.length}');
      for (var remedio in remedios) {
        print('Remédio: ${remedio.nome}, Dosagem: ${remedio.dosagem}');
      }
    } catch (e) {
      print('Erro ao selecionar remédios: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Home Screen'),
      ),
      body: Center(
        child: Text('Check console for database test results'),
      ),
    );
  }
}

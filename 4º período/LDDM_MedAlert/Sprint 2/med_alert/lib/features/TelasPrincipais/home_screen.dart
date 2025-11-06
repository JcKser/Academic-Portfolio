import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart'; // Import necessário para usar a câmera
import 'account_screen.dart';
import 'settings_screen.dart';
import 'package:med_alert/shared/dao/remedio_dao.dart'; // Import do DAO
import 'package:med_alert/shared/models/remedio_model.dart'; // Import do modelo de Remédio

const Color backgroundColor = Colors.white;

class HomeScreen extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  final ImagePicker _picker =
      ImagePicker(); // Instância do ImagePicker para a câmera

  static List<Widget> _widgetOptions = <Widget>[
    NotificationScreen(), // Criar uma nova tela para as notificações
    AccountScreen(userId: 1),
    SettingsScreen(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  // Função para abrir a câmera
  Future<void> _openCamera() async {
    final XFile? photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo != null) {
      // Adicionar a lógica para salvar ou exibir a foto
      print('Imagem capturada: ${photo.path}');
    }
  }

  // Lista com os títulos correspondentes às páginas
  static List<String> _titles = [
    'Med.Alert', // Título da página inicial
    'Configurações de Conta', // Título da página de conta
    'Configurações Gerais' // Título da página de configurações
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Center(
          child: Text(
            _titles[_selectedIndex],
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 23.0,
              color: Colors.black, 
            ),
          ),
        ),
        backgroundColor: Color.fromARGB(255, 154, 193, 221),
        elevation: 0,
        automaticallyImplyLeading: false,
      ),
      body: Container(
        color: backgroundColor,
        child: _widgetOptions
            .elementAt(_selectedIndex), // Mostrar apenas o body da tela atual
      ),
      floatingActionButton: _selectedIndex == 0 // Mostrar botão flutuante apenas na tela de notificações
          ? FloatingActionButton(
              onPressed: _openCamera,
              child: Icon(Icons.camera_alt),
            )
          : null, // Não exibir o botão nas outras telas
      bottomNavigationBar: SizedBox(
        height: 80,
        child: BottomNavigationBar(
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(
              icon: Icon(Icons.home),
              label: 'Home',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'Conta',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings),
              label: 'Configurações',
            ),
          ],
          currentIndex: _selectedIndex,
          selectedItemColor: Color(0xFF04184B),
          onTap: _onItemTapped,
          selectedFontSize: 18,
          unselectedFontSize: 14,
          iconSize: 30,
        ),
      ),
    );
  }
}

// Criar uma nova classe para a tela de Notificações
class NotificationScreen extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _NotificationScreenState createState() => _NotificationScreenState();
}

class _NotificationScreenState extends State<NotificationScreen> {
  final RemedioDao _remedioDao = RemedioDao();
  List<Remedio> _remedios = [];
  Map<int, bool> _tomados = {};  // Mapa para armazenar o estado de "tomado"
  List<Remedio> _historico = []; // Lista para armazenar os históricos de notificações

  @override
  void initState() {
    super.initState();
    _fetchRemedios();
  }

  // Função para buscar os medicamentos do banco
  Future<void> _fetchRemedios() async {
  await _remedioDao.deletarFrequenciaInvalida(); // Exclui registros inválidos
  List<Remedio> remedios = await _remedioDao.selecionarTodos();

  // Tente converter o horário para DateTime
  remedios.sort((a, b) {
    // Verifica se o horário é válido antes de comparar
    DateTime? horaA = _parseHorario(a.horario);
    DateTime? horaB = _parseHorario(b.horario);

    // Se ambos os horários são válidos, compare-os
    if (horaA != null && horaB != null) {
      return horaA.compareTo(horaB);
    } else {
      // Se algum horário for inválido, considera como maior para que ele vá para o final
      return 1;
    }
  });

  setState(() {
    _remedios = remedios; // Atualiza a lista com os medicamentos
  });
}

// Função para converter a string de horário para DateTime
DateTime? _parseHorario(String? horario) {
  if (horario == null) return null;
  
  // Suponha que o formato do horário seja 'HH:mm', se for diferente, ajuste a lógica
  try {
    return DateTime.parse('2024-01-01 $horario');  // Adiciona uma data arbitrária
  } catch (e) {
    print('Erro ao converter horário: $horario');
    return null;
  }
}
  // Função para exibir o popup de tomada do medicamento
  Future<void> _showTakenPopup(Remedio remedio) async {
    bool? taken = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Você tomou o medicamento?'),
          content: Text(remedio.nome),
          actions: <Widget>[
            TextButton(
              child: Text('Sim'),
              onPressed: () {
                Navigator.of(context).pop(true);
              },
            ),
            TextButton(
              child: Text('Não'),
              onPressed: () {
                Navigator.of(context).pop(false);
              },
            ),
          ],
        );
      },
    );

    if (taken != null) {
      // Atualiza o estado local de "tomado"
      setState(() {
        _tomados[remedio.id!] = taken;
      });

      // Adiciona ao histórico, mesmo que não tenha sido tomado
      setState(() {
        _historico.add(remedio);
      });

      // Recarrega os dados após a atualização
      _fetchRemedios();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(20),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Central de Notificações',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black)),
            SizedBox(height: 20),
            Container(
              padding: EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.5),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: _remedios.isEmpty
                    ? [
                        Container(
                          width: double.infinity,
                          height: 80,
                          color: Colors.white, // Cor branca quando não há histórico
                          child: Center(
                            child: Text(
                              'Nenhum remédio cadastrado',
                              style: TextStyle(color: Colors.black, fontSize: 20),
                            ),
                          ),
                        ),
                      ]
                : _remedios.map((remedio) {
                  return GestureDetector(
                    onTap: () => _showTakenPopup(remedio), // Ao clicar, exibe o popup
                    child: Container(
                      width: double.infinity,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.grey[200],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      margin: EdgeInsets.only(bottom: 10),
                      child: Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.timer, size: 24),
                            Text(remedio.horario ?? 'Sem horário',
                                style: TextStyle(fontSize: 16, color: Colors.black)),
                            Text(remedio.nome,
                                style: TextStyle(fontSize: 18, color: Colors.black)),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            SizedBox(height: 40),
            Text('Histórico de Notificações',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.black)),
            SizedBox(height: 20),
            // Exibe o histórico de notificações
            Container(
              padding: EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.5),
                    spreadRadius: 2,
                    blurRadius: 5,
                    offset: Offset(0, 3),
                  ),
                ],
              ),
              child: Column(
                children: _historico.isEmpty
                    ? [
                        Container(
                          width: double.infinity,
                          height: 80,
                          color: Colors.white, // Cor branca quando não há histórico
                          child: Center(
                            child: Text(
                              'Nenhum histórico de notificações',
                              style: TextStyle(color: Colors.black, fontSize: 20),
                            ),
                          ),
                        ),
                      ]
                    : _historico.map((remedio) {
                        bool taken = _tomados[remedio.id!] ?? false; // Verifica se o remédio foi tomado localmente
                        return Container(
                          width: double.infinity,
                          height: 80,
                          decoration: BoxDecoration(
                            color: taken ? Colors.green : Colors.grey[200],
                            borderRadius: BorderRadius.circular(8),
                          ),
                          margin: EdgeInsets.only(bottom: 10),
                          child: Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.timer, size: 24),
                                Text(remedio.horario ?? 'Sem horário',
                                    style: TextStyle(fontSize: 16, color: Colors.black)),
                                Text(remedio.nome,
                                    style: TextStyle(fontSize: 18, color: Colors.black)),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }
}


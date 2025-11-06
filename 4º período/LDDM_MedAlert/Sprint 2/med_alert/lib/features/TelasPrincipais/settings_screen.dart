import 'package:flutter/material.dart';
import '../TelasConfig/new_medication_screen.dart';
import '../TelasConfig/save_med_screen.dart';
import '../TelasConfig/about_us_screen.dart';
import '../TelasConfig/security_screen.dart';

const Color backgroundColor = Colors.white;

class SettingsScreen extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _SettingsScreenState createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildOption(
              'Adicionar Novo Remédio',
              Icons.medication,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => NewMedicationScreen()),
              ),
            ),
            _buildOption(
              'Medicamentos Salvos',
              Icons.medical_information,
              () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => SaveMedScreen(), // Passa o objeto `Remedio` se for uma edição
                ),
              ),
            ),
            _buildOption(
              'Sobre nós',
              Icons.favorite,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => AboutUsScreen()),
              ),
            ),
            _buildOption(
              'Segurança e Permissões',
              Icons.shield,
              () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => SecurityScreen()),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOption(String title, IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: EdgeInsets.symmetric(vertical: 10),
        padding: EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Color.fromARGB(255, 199, 221, 236),
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(icon, size: 40, color: Colors.black),
            SizedBox(width: 20),
            Text(
              title,
             style: TextStyle(fontSize: 22, color: Colors.black, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }
}

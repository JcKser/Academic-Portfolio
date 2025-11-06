// ignore_for_file: use_build_context_synchronously

import 'package:flutter/material.dart';
import 'package:med_alert/shared/dao/remedio_dao.dart';
import 'package:med_alert/shared/models/remedio_model.dart';

class NewMedicationScreen extends StatefulWidget {
  @override
  // ignore: library_private_types_in_public_api
  _NewMedicationScreenState createState() => _NewMedicationScreenState();
}

const Color backgroundColor = Colors.white;

class _NewMedicationScreenState extends State<NewMedicationScreen> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _doseController = TextEditingController();
  final TextEditingController _frequencyController = TextEditingController();
  final TextEditingController _timeController = TextEditingController();

  final RemedioDao _remedioDao = RemedioDao(); // Instância do DAO para manipular o banco de dados

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: backgroundColor,
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
              'Adicionar Novo Remédio',
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
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                buildTextField(
                  controller: _nameController,
                  label: 'Nome do Remédio',
                ),
                SizedBox(height: 20),
                buildTextField(
                  controller: _doseController,
                  label: 'Dosagem (mg)',
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 20),
                buildTextField(
                  controller: _frequencyController,
                  label: 'Frequência (vezes ao dia)',
                  keyboardType: TextInputType.number,
                ),
                SizedBox(height: 20),
                buildTextField(
                  controller: _timeController,
                  label: 'Horário (Ex: 08:00)',
                  keyboardType: TextInputType.datetime,
                ),
                SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () async {
                    if (_formKey.currentState!.validate()) {
                      // Criar uma instância de Remedio com os dados do formulário
                      Remedio novoRemedio = Remedio(
                        nome: _nameController.text,
                        tipo: "Medicamento", // Pode ser alterado conforme necessário
                        dosagem: _doseController.text,
                        frequencia: int.tryParse(_frequencyController.text),
                        horario: _timeController.text,
                      );



                      try {
                        // Salvar no banco de dados usando o RemedioDao
                        await _remedioDao.adicionar(novoRemedio);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Remédio adicionado com sucesso!')),
                        );
                        // Limpar os campos após adicionar
                        _nameController.clear();
                        _doseController.clear();
                        _frequencyController.clear();
                        _timeController.clear();
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Erro ao adicionar o remédio: $e')),
                        );
                      }
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color.fromARGB(255, 154, 193, 221),
                    padding: EdgeInsets.symmetric(horizontal: 50, vertical: 15),
                  ),
                  child: Text(
                    'Adicionar Remédio',
                    style: TextStyle(fontSize: 20, color: Colors.black),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget buildTextField({
    required TextEditingController controller,
    required String label,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        floatingLabelBehavior: FloatingLabelBehavior.always,
        labelStyle: TextStyle(
          color: Colors.black,
          fontWeight: FontWeight.bold,
          fontSize: 22.0,
        ),
        enabledBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Colors.black, width: 2.0),
        ),
        contentPadding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 20.0),
      ),
      style: TextStyle(fontSize: 20, color: Colors.black),
      keyboardType: keyboardType,
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Por favor, insira $label'.toLowerCase();
        }
        return null;
      },
    );
  }
}

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import axios from 'axios';


export const ExpedientesScreen = () => {
  const [formData, setFormData] = useState({
    numeroControl: '',
    nombre: '',
    sexo: '',
    edad: '',
    estadoCivil: '',
    direccion: '',
    telefono: '',
    ingenieria: '',
    modalidad: '',
    semestre: '',
    fechaRegistro: '',
    motivoConsulta: '',
    desencadenantesMotivo: '',
    planOrientacion: '',
    seguimiento: '',
    numeroSesiones: '',
  });

  const resetFormExceptNumeroControl = () => {
  setFormData((prev) => ({
    ...prev,
    nombre: '',
    sexo: '',
    edad: '',
    estadoCivil: '',
    direccion: '',
    telefono: '',
    ingenieria: '',
    modalidad: '',
    semestre: '',
    fechaRegistro: '',
  }));
};

  const handleChange = (name: string, value: string) => {
  // Si cambia el número de control, reseteamos los campos de usuario
  if (name === 'numeroControl') {
    resetFormExceptNumeroControl();
  }
  setFormData((prevData) => ({ ...prevData, [name]: value }));
};

  useEffect(() => {
    const fetchData = async () => {
      if (formData.numeroControl.length < 8) return; // Ajusta la longitud según tu formato

      try {
        const res = await axios.get(`https://backend-psicologia.fly.dev/api/expediente/expedientes/${formData.numeroControl}`);
        const user = res.data.usuario;

        if (!user) throw new Error("Usuario no encontrado");

        const formattedDate = user.fecha_registro
          ? new Date(user.fecha_registro).toISOString().split("T")[0]
          : '';

        setFormData((prev) => ({
          ...prev,
          nombre: user.nombre || '',
          sexo: user.sexo || '',
          edad: String(user.edad || ''),
          estadoCivil: user.estado_civil || '',
          direccion: user.direccion || '',
          telefono: user.telefono || '',
          ingenieria: user.ingenieria || '',
          modalidad: user.modalidad || '',
          semestre: String(user.semestre || ''),
          fechaRegistro: formattedDate,
        }));
      } catch (error) {
        Alert.alert("Error", "No se pudo obtener el usuario.");
      }
    };

    fetchData();
  }, [formData.numeroControl]);

  const handleSubmit = async () => {
    try {
      const expedienteData = {
        no_control: formData.numeroControl,
        motivo_consulta: formData.motivoConsulta,
        desencadenantes_motivo: formData.desencadenantesMotivo,
        plan_orientacion: formData.planOrientacion,
        seguimiento: formData.seguimiento,
        numero_sesiones: Number(formData.numeroSesiones),
      };

      await axios.post('https://backend-psicologia.fly.dev/api/expediente/expedientes', expedienteData);
      Alert.alert("Éxito", "Expediente guardado correctamente.");
      setFormData({
        numeroControl: '',
        nombre: '',
        sexo: '',
        edad: '',
        estadoCivil: '',
        direccion: '',
        telefono: '',
        ingenieria: '',
        modalidad: '',
        semestre: '',
        fechaRegistro: '',
        motivoConsulta: '',
        desencadenantesMotivo: '',
        planOrientacion: '',
        seguimiento: '',
        numeroSesiones: '',
      });
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el expediente.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Generar Expediente</Text>

      {[
        ['Número de control', 'numeroControl', true],
        ['Nombre', 'nombre'],
        ['Edad', 'edad'],
        ['Teléfono', 'telefono'],
        ['Ingeniería', 'ingenieria'],
        ['Modalidad', 'modalidad'],
        ['Semestre', 'semestre'],
        ['Fecha de Registro', 'fechaRegistro'],
        ['Motivo de Consulta', 'motivoConsulta', true],
        ['Desencadenantes del Motivo', 'desencadenantesMotivo', true],
        ['Plan de Orientación', 'planOrientacion', true],
        ['Seguimiento', 'seguimiento', true],
        ['Número de sesiones', 'numeroSesiones', true],
      ].map(([label, name, editable = false]) => (
        <View key={name.toString()} style={styles.inputGroup}>
          <TextInput
            style={[
              styles.input,
              editable ? styles.inputEditable : styles.inputReadonly
            ]}
            value={formData[name as keyof typeof formData]}
            onChangeText={(text) => handleChange(name as string, text)}
            editable={!!editable}
            keyboardType={name === 'edad' || name === 'semestre' || name === 'numeroSesiones' || name === 'numeroControl' ? 'numeric' : 'default'}
            placeholder={label as string}
            placeholderTextColor="#555" // gris oscuro
          />
        </View>
      ))}

      <Button title="Generar Expediente" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputEditable: {
    backgroundColor: '#fff',
    borderColor: '#007BFF',
  },
  inputReadonly: {
    backgroundColor: '#eee',
  },
});


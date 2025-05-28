import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { updateExpediente } from '../helpers/UpdateExpediente';
import { deleteExpediente } from '../helpers/DeleteExpediente';

interface Expediente {
  id: number;
  motivo_consulta: string;
  numero_sesiones: number;
  plan_orientacion: string;
  seguimiento: string;
  desencadenantes_motivo: string;
}

interface Props {
  expediente: Expediente;
  onEdit: (exp: Expediente) => void;
  onDelete: (id: number) => void;
  paciente: any;
  onUpdated: () => void // Add this line
  onDeleted: () => void // Add this line
}

export const ListarExpedienteItem = ({ expediente, onEdit, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpediente, setEditedExpediente] = useState<Expediente>(expediente);

  const handleInputChange = (name: keyof Expediente, value: string) => {
    setEditedExpediente({ ...editedExpediente, [name]: name === 'numero_sesiones' ? Number(value) : value });
  };

  const handleSave = async () => {
    try {
      const updated = await updateExpediente(expediente.id, editedExpediente);
      onEdit(updated);
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el expediente');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este expediente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpediente(expediente.id);
              onDelete(expediente.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el expediente');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {isEditing ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Motivo de consulta"
            placeholderTextColor={'#555'}
            value={editedExpediente.motivo_consulta}
            onChangeText={(text) => handleInputChange('motivo_consulta', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Número de sesiones"
            placeholderTextColor={'#555'}
            value={String(editedExpediente.numero_sesiones)}
            onChangeText={(text) => handleInputChange('numero_sesiones', text)}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Plan de orientación"
            placeholderTextColor={'#555'}
            value={editedExpediente.plan_orientacion}
            onChangeText={(text) => handleInputChange('plan_orientacion', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Seguimiento"
            placeholderTextColor={'#555'}
            value={editedExpediente.seguimiento}
            onChangeText={(text) => handleInputChange('seguimiento', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Motivo desencadenante"
            placeholderTextColor={'#555'}
            value={editedExpediente.desencadenantes_motivo}
            onChangeText={(text) => handleInputChange('desencadenantes_motivo', text)}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.title}>Expediente</Text>
          <Text><Text style={styles.label}>Motivo de consulta:</Text> {expediente.motivo_consulta}</Text>
          <Text><Text style={styles.label}>Número de sesiones:</Text> {expediente.numero_sesiones}</Text>
          <Text><Text style={styles.label}>Plan de orientación:</Text> {expediente.plan_orientacion}</Text>
          <Text><Text style={styles.label}>Seguimiento:</Text> {expediente.seguimiento}</Text>
          <Text><Text style={styles.label}>Motivo desencadenante:</Text> {expediente.desencadenantes_motivo}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
    padding: 10,
    borderRadius: 6,
    flex: 1,
  },
});

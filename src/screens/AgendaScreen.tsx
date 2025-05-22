import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Alert } from 'react-native';


type Appointment = {
  id: number;
  no_control_user: number | null;
  no_control_admin: number | null;
  title: string;
  session_number: number;
  start_time: string;
  end_time: string;
  estatus: string | null;
  date: string;
};

const availableHours = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];


export const AgendaScreen = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Campos para crear una nueva cita
  const [modalidad, setModalidad] = useState('');
  const [sessionNumber, setSessionNumber] = useState('');
  const [hora, setHora] = useState('');
  const [noControl, setNoControl] = useState('');
  const [estatus, setEstatus] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const response = await axios.get(
          'https://backend-psicologia.fly.dev/api/agenda/getAllEvents',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const processed = response.data.map((a: any) => ({
          ...a,
          date: a.start_time.split(' ')[0], // yyyy-mm-dd
        }));

        setAppointments(processed);
      } catch (error) {
        console.error('Error al cargar citas:', error);
      }
    };

    fetchAppointments();
  }, []);

  const isPastDate = (dateStr: string) => {
    const today = new Date();
    const date = new Date(dateStr);
    return date.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  const openModal = () => {
    setModalVisible(true);
  };

  const saveAppointment = async () => {
    if (
      !modalidad ||
      !sessionNumber ||
      !hora ||
      !noControl ||
      !estatus
    ) {
      Alert.alert('Todos los campos son obligatorios');
      return;
    }

    const sessionNum = Number(sessionNumber);
    if (sessionNum < 1 || sessionNum > 100) {
      Alert.alert('El número de sesión debe estar entre 1 y 100');
      return;
    }

    const [hourStr, minuteStr] = hora.split(':');
    const hour = parseInt(hourStr, 10);
    if (isNaN(hour) || hour < 8 || hour > 16) {
      Alert.alert('La hora debe estar entre 08:00 y 16:00');
      return;
    }


    // Calcular end_time sumando 1 hora
    const [startHour, startMinute] = hora.split(':').map(Number);
    const endHour = startHour + 1;
    const endTimeStr = `${selectedDate} ${endHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}:00`;

    const newAppointment = {
      title: modalidad,
      session_number: Number(sessionNumber),
      start_time: `${selectedDate} ${hora}:00`,
      end_time: endTimeStr,
      no_control_user: Number(noControl),
      status: estatus,
    };

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        'https://backend-psicologia.fly.dev/api/agenda/createEvent',
        newAppointment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const saved = {
        ...response.data,
        date: response.data.start_time.split(' ')[0],
      };

      setAppointments(prev => [...prev, saved]);
      setModalVisible(false);

      // Limpiar campos
      setModalidad('');
      setSessionNumber('');
      setHora('');
      setNoControl('');
      setEstatus('');
    } catch (error) {
      console.error('Error al guardar la cita:', error);
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.delete(
        `https://backend-psicologia.fly.dev/api/agenda/deleteEvent/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setAppointments(prev => prev.filter(a => a.id !== id));
      setDetailsModalVisible(false);
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
    }
  };

  const editAppointment = () => {
    Alert.alert('Función para editar cita aún no implementada');
  };

  const markedDates = appointments.reduce(
    (acc, appointment) => {
      acc[appointment.date] = {
        marked: true,
        dotColor: 'blue',
      };
      return acc;
    },
    {
      [selectedDate]: { selected: true, selectedColor: '#3498db' },
    } as Record<string, any>,
  );

  const appointmentsForSelectedDate = appointments.filter(
    a => a.date === selectedDate,
  );

  return (
    <View style={styles.container}>
      <Calendar onDayPress={onDayPress} markedDates={markedDates} />

      <Text style={styles.selectedText}>
        Fecha seleccionada: {selectedDate}
      </Text>

      <FlatList
        data={appointmentsForSelectedDate}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appointmentItem}
            onPress={() => {
              setSelectedAppointment(item);
              setDetailsModalVisible(true);
            }}>
            <Text>{item.title}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', marginTop: 10 }}>
            No hay citas para este día
          </Text>
        }
      />

      {!isPastDate(selectedDate) && (
        <TouchableOpacity style={styles.agendarButton} onPress={openModal}>
          <Text style={styles.agendarButtonText}>Agendar</Text>
        </TouchableOpacity>
      )}

      {/* Modal para nueva cita */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva cita para {selectedDate}</Text>

            {/* Modalidad */}
            <Text style={styles.label}>Modalidad</Text>
            <Picker
              selectedValue={modalidad}
              onValueChange={(itemValue) => setModalidad(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona modalidad" value="" />
              <Picker.Item label="Presencial" value="Presencial" />
              <Picker.Item label="En línea" value="En línea" />
            </Picker>

            {/* Número de sesión */}
            <Text style={styles.label}>Número de sesión (1-100)</Text>
            <TextInput
              placeholder="Ej. 1"
              value={sessionNumber}
              onChangeText={setSessionNumber}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Hora */}
            <Text style={styles.label}>Hora (formato 24h HH:MM, entre 08:00 y 16:00)</Text>
            <Picker
              selectedValue={hora}
              onValueChange={(itemValue) => setHora(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una hora" value="" />
              {availableHours.map(h => (
                <Picker.Item key={h} label={h} value={h} />
              ))}
            </Picker>



            {/* No. Control */}
            <Text style={styles.label}>Número de control</Text>
            <TextInput
              placeholder="Número de control"
              value={noControl}
              onChangeText={setNoControl}
              keyboardType="numeric"
              style={styles.input}
            />

            {/* Estatus */}
            <Text style={styles.label}>Estatus</Text>
            <Picker
              selectedValue={estatus}
              onValueChange={(itemValue) => setEstatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona estatus" value="" />
              <Picker.Item label="Pendiente" value="Pendiente" />
              <Picker.Item label="Cancelado" value="Cancelado" />
              <Picker.Item label="Realizado" value="Realizado" />
            </Picker>


            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.buttonCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonSave} onPress={saveAppointment}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles */}
      <Modal visible={detailsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detalles de la cita</Text>

            {selectedAppointment && (
              <>
                <Text>ID: {selectedAppointment.id}</Text>
                <Text>Usuario: {selectedAppointment.no_control_user}</Text>
                <Text>Administrador: {selectedAppointment.no_control_admin ?? 'N/A'}</Text>
                <Text>Título: {selectedAppointment.title}</Text>
                <Text>Sesión: {selectedAppointment.session_number}</Text>
                <Text>Inicio: {selectedAppointment.start_time}</Text>
                <Text>Fin: {selectedAppointment.end_time}</Text>
                <Text>Estatus: {selectedAppointment.estatus ?? 'Pendiente'}</Text>

                {!isPastDate(selectedAppointment.date) ? (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
                    <TouchableOpacity style={[styles.buttonSave, { flex: 1, marginRight: 10 }]} onPress={editAppointment}>
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.buttonCancel, { flex: 1 }]} onPress={() => deleteAppointment(selectedAppointment.id)}>
                      <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={{ marginTop: 20, fontStyle: 'italic', color: '#666' }}>
                    Esta cita es de un día pasado y no puede ser modificada.
                  </Text>
                )}
              </>
            )}

            <TouchableOpacity style={[styles.buttonCancel, { marginTop: 20 }]} onPress={() => setDetailsModalVisible(false)}>
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20 },
  selectedText: { marginTop: 20, fontSize: 16, textAlign: 'center' },
  appointmentItem: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  agendarButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    marginHorizontal: 40,
  },
  agendarButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',

  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonCancel: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  buttonSave: {
    backgroundColor: '#2ecc71',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  picker: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
  },

});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment';

type Appointment = {
  id: number;
  no_control_user: number | null;
  no_control_admin: number | null;
  title: string;
  session_number: number;
  start_time: string;
  end_time: string;
  status: string | null;
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
    new Date().toISOString().split('T')[0]
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
  const [role, setRole] = useState<string | null>(null);

  const API_BASE = 'https://backend-psicologia.fly.dev/api/agenda';

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      const storedRole = await AsyncStorage.getItem('role');
      const token = await AsyncStorage.getItem('token');

      if (!token) throw new Error('No se encontró el token');
      if (!storedRole) throw new Error('No se encontró el rol');

      setRole(storedRole);

      let response;
      if (storedRole === 'admin') {
        response = await axios.get(
          'https://backend-psicologia.fly.dev/api/admin/getAdminData',
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.get(
          'https://backend-psicologia.fly.dev/api/users/getUserData',
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      if (response.data && response.data.no_control) {
        setNoControl(response.data.no_control.toString());
      } else {
        console.warn('no_control no está definido en la respuesta:', response.data);
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  };

  // Función para cargar citas
  const fetchAppointments = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No se encontró el token');

      const response = await axios.get(
        `${API_BASE}/getAllEvents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
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

  // Alias para recargar citas manualmente
  const reloadAppointments = fetchAppointments;

  useEffect(() => {
    const fetchUserDataAndAppointments = async () => {
      try {
        await fetchUserData();
        await reloadAppointments();
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDataAndAppointments();
  }, []);

  // Función para resetear formulario
  const resetFields = () => {
    setModalidad('');
    setSessionNumber('');
    setHora('');
    setEstatus('');
    setSelectedAppointment(null);
  };

  // Verifica si una fecha ya pasó
  const isPastDate = (dateStr: string) => {
    const today = moment().startOf('day');
    const date = moment(dateStr).startOf('day');
    return date.isBefore(today);
  };

  const isReadOnly = isPastDate(selectedDate);

  // Abrir modal para nueva cita (solo si la fecha no pasó)
  const openNewAppointmentModal = (date: string) => {
    if (isPastDate(date)) {
      Alert.alert('No puedes agendar citas en días anteriores.');
      return;
    }
    resetFields();
    setSelectedDate(date);
    setModalVisible(true);
  };

  // Abrir modal para editar cita (solo si la fecha no pasó)
  const openEditAppointmentModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalidad(appointment.title.split(' - ')[1] || '');
    setSessionNumber(appointment.session_number.toString());
    setHora(moment(appointment.start_time).format('HH:mm'));
    setEstatus(appointment.status || '');
    setSelectedDate(appointment.date);
    setModalVisible(true);
  };

  // Guardar cita nueva o editar existente
  const saveAppointment = async () => {
    if (!modalidad || !sessionNumber || !hora || (role === 'admin' && !estatus)) {
      Alert.alert('Por favor, completa todos los campos.');
      return;
    }

    if (!hora.includes(':')) {
      Alert.alert('Formato de hora inválido. Usa HH:mm');
      return;
    }

    const [hours, minutes] = hora.split(':').map(Number);
    if (hours < 8 || hours > 16) {
      Alert.alert('La hora debe estar entre 08:00 y 16:00');
      return;
    }

    try {
      const eventStart = moment(selectedDate)
        .set({ hour: hours, minute: minutes })
        .subtract(6, 'hours')
        .toISOString();

      const eventEnd = moment(eventStart).add(1, 'hours').toISOString();

      const payload = {
        title: `Sesión ${sessionNumber} - ${modalidad}`,
        session_number: parseInt(sessionNumber, 10),
        start_time: eventStart,
        end_time: eventEnd,
        no_control_user: role === 'usuario' ? Number(noControl) : null,
        no_control_admin: role === 'admin' ? Number(noControl) : null,
        estatus: role === 'admin' ? estatus : 'Pendiente',
        status: role === 'admin' ? estatus : 'Pendiente',
      };

      const token = await AsyncStorage.getItem('token');

      if (selectedAppointment) {
        // Editar cita
        const response = await axios.put(
          `${API_BASE}/updateEvent/${selectedAppointment.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
          setAppointments((prev) =>
            prev.map((item) =>
              item.id === selectedAppointment.id
                ? { ...item, ...payload, date: selectedDate }
                : item
            )
          );
          setModalVisible(false);
          resetFields();
        } else {
          Alert.alert('Error al actualizar la cita');
        }
      } else {
        // Crear cita nueva
        const response = await axios.post(`${API_BASE}/createEvent`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 || response.status === 201) {
          const newEvent = {
            ...payload,
            id: response.data.id,
            date: selectedDate,
            status: (payload.status ?? null) as string | null,
            estatus: (payload.estatus ?? null) as string | null,
          };
          setAppointments((prev) => [...prev, newEvent]);
          setModalVisible(false);
          resetFields();
        } else {
          Alert.alert('Error al crear la cita');
        }
      }
    } catch (error) {
      console.error('Error guardando cita:', error);
      Alert.alert('Error al guardar la cita');
    }
  };

  // Eliminar cita
  const deleteAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const token = await AsyncStorage.getItem('token');

      await axios.delete(
        `${API_BASE}/deleteEvent/${selectedAppointment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) =>
        prev.filter((item) => item.id !== selectedAppointment.id)
      );
      setModalVisible(false);
      resetFields();
    } catch (error) {
      console.error('Error eliminando cita:', error);
      Alert.alert('Error al eliminar la cita');
    }
  };

  // Filtrar citas del día seleccionado
  const appointmentsForSelectedDate = appointments.filter(
    (a) => a.date === selectedDate
  );

  return (
    <View style={styles.container}
    >

      <TouchableOpacity style={styles.reloadButton} onPress={reloadAppointments}>
        <Text style={styles.reloadButtonText}>Recargar Citas</Text> </TouchableOpacity>

      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{
          ...appointments.reduce((acc, a) => {
            // Si el día es el seleccionado y tiene citas, combinamos ambos
            if (a.date === selectedDate) {
              acc[a.date] = {
                selected: true,
                selectedColor: '#00adf5',
                marked: true,
                dotColor: 'red',
              } as any;
            } else {
              acc[a.date] = { marked: true, dotColor: 'red' } as any;
            }
            return acc;
          }, {
            // Si el día seleccionado no tiene citas, aún debe marcarse como seleccionado
            [selectedDate]: {
              selected: true,
              selectedColor: '#00adf5',
            }
          }),
        }}

      />

      <Text style={styles.title}>Citas para {selectedDate}</Text>

      <FlatList
        data={appointmentsForSelectedDate}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <Text style={styles.noAppointmentsText}>No hay citas para esta fecha.</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.appointmentItem}
            onPress={() => openEditAppointmentModal(item)}
          >
            <Text style={styles.appointmentText}>{item.title}</Text>
            <Text style={styles.appointmentText}>
              {moment(item.start_time).format('HH:mm')} - {moment(item.end_time).format('HH:mm')}
            </Text>
            <Text style={styles.appointmentText}>Estado: {item.estatus}</Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => openNewAppointmentModal(selectedDate)}
      >
        <Text style={styles.newButtonText}>Nueva cita</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {selectedAppointment ? 'Editar cita' : 'Nueva cita'}
            </Text>

            <Text style={styles.label}>Modalidad:</Text>
            <Picker
              selectedValue={modalidad}
              onValueChange={(itemValue) => setModalidad(itemValue)}
              style={styles.picker}
              enabled={!isReadOnly && !(role !== 'admin' && selectedAppointment)} // Solo se desactiva si es usuario y está editando
            >
              <Picker.Item label="-- Selecciona modalidad --" value="" />
              <Picker.Item label="Presencial" value="Presencial" />
              <Picker.Item label="Virtual" value="Virtual" />
            </Picker> 

            <Text style={styles.label}>Número de sesión:</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={sessionNumber}
              onChangeText={setSessionNumber}
              placeholder='Número de sesión'
              editable={!isReadOnly && !(role !== 'admin' && selectedAppointment)} // Solo se desactiva si es usuario y está editando
            />

            <Text style={styles.label}>Hora (HH:mm):</Text>
            <Picker
              selectedValue={hora}
              onValueChange={(itemValue) => setHora(itemValue)}
              style={styles.picker}
              enabled={!isReadOnly && !(role !== 'admin' && selectedAppointment)} // Solo se desactiva si es usuario y está editando
            >
              <Picker.Item label="-- Selecciona hora --" value="" />
              {availableHours.map((h) => (
                <Picker.Item key={h} label={h} value={h} />
              ))}
            </Picker>

            {/* No. Control */}
            {role === 'admin' && (
              <>
                <Text style={styles.label}>Número de control</Text>
                <TextInput
                  placeholder="Número de control"
                  value={
                    selectedAppointment
                      ? selectedAppointment.no_control_user?.toString() ||
                      selectedAppointment.no_control_admin?.toString() ||
                      ''
                      : noControl
                  }
                  //onChangeText={setNoControl}
                  keyboardType="numeric"
                  style={styles.input}
                  editable={false} // <-- usar "editable" en lugar de "readOnly" en React Native
                />

                <Text style={styles.label}>Estatus:</Text>
                <Picker
                  selectedValue={estatus}
                  onValueChange={(itemValue) => setEstatus(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Selecciona estatus --" value="" />
                  <Picker.Item label="Pendiente" value="Pendiente" />
                  <Picker.Item label="Completada" value="Completada" />
                  <Picker.Item label="Cancelada" value="Cancelada" />
                </Picker>
              </>

            )}


            <View style={styles.modalButtons}>
              {(
                role === 'admin' || // siempre mostrar para admin
                (!selectedAppointment && role === 'usuario') // mostrar para user solo si está agendando (no editando)
              ) && (
                  <TouchableOpacity style={styles.buttonSave} onPress={saveAppointment}>
                    <Text style={styles.buttonText}>Guardar</Text>
                  </TouchableOpacity>
                )}

              <TouchableOpacity
                style={styles.buttonCancel}
                onPress={() => {
                  setModalVisible(false);
                  resetFields();
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>

            {!isReadOnly && (
              <>
                {selectedAppointment && role === 'admin' && (
                  <TouchableOpacity style={styles.buttonDelete} onPress={deleteAppointment}>
                    <Text style={styles.buttonDeleteText}>Eliminar cita</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  noAppointmentsText: { textAlign: 'center', marginVertical: 20, color: '#888' },
  appointmentItem: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  appointmentText: { fontSize: 16 },
  newButton: {
    backgroundColor: '#00adf5',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  newButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: { fontSize: 16, marginTop: 10, fontWeight: 'bold' },
  input: {
    color: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#ccc',
  },
  picker: {
    marginTop: 5,
    borderWidth: 0.1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginBottom: 1,
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonSave: {
    backgroundColor: '#00adf5',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#999',
    padding: 10,
    borderRadius: 6,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  buttonDelete: {
    marginTop: 15,
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonDeleteText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reloadButton: {
padding: 10,
backgroundColor: '#00adf5',
borderRadius: 5,
marginBottom: 10,
alignItems: 'center',
},
reloadButtonText: {
color: '#fff',
fontWeight: 'bold',
},
});


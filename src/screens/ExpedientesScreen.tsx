import React, { useEffect, useState } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';



interface Expediente {
    id: number;
    no_control: number;
    numero_sesiones: number;
    motivo_consulta: string;
    desencadenantes_motivo: string;
    plan_orientacion: string;
    seguimiento: string;
  }



export const ExpedientesScreen = () => {
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<Expediente[]>('https://backend-psicologia.fly.dev/api/expediente/getAllExpediente')
      .then((response) => {
        setExpedientes(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error al obtener expedientes:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Text>Cargando expedientes...</Text>;
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Expedientes</Text>
        {expedientes.map((exp) => (
          <View key={exp.id} style={styles.card}>
            <Text style={styles.item}>
              <Text style={styles.label}>No. Control:</Text> {exp.no_control}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.label}>Sesiones:</Text> {exp.numero_sesiones}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.label}>Motivo:</Text> {exp.motivo_consulta}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.label}>Desencadenantes:</Text> {exp.desencadenantes_motivo}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.label}>Plan:</Text> {exp.plan_orientacion}
            </Text>
            <Text style={styles.item}>
              <Text style={styles.label}>Seguimiento:</Text> {exp.seguimiento}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 24,
      marginBottom: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    card: {
      padding: 12,
      marginBottom: 10,
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      elevation: 2,
    },
    item: {
      fontSize: 16,
      marginBottom: 4,
    },
    label: {
      fontWeight: 'bold',
    },
  });

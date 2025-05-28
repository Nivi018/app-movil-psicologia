import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Button,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { fetchExpedienteData } from '../helpers/DataFetchExpediente';
import { ListarExpedienteItem } from '../components/ListarExpedienteItem';

export const MostrarExpedientesScreen = () => {
    const [numeroControl, setNumeroControl] = useState('');
    const [resultado, setResultado] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const buscarExpediente = async (control: string) => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchExpedienteData(control);
            setResultado(data);
        } catch (e: any) {
            setError(e.message || 'Error al buscar');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        if (!numeroControl) {
            setError('Por favor ingrese un número de control');
            return;
        }
        buscarExpediente(numeroControl);
    };

    const handleReload = () => {
        if (!numeroControl) {
            setError('Ingrese un número de control para recargar');
            return;
        }
        buscarExpediente(numeroControl);
    };

    // Funciones para actualizar la UI luego de editar o eliminar expediente
    const handleEdit = (updatedExpediente: any) => {
        if (!resultado) return;
        setResultado({
            ...resultado,
            expedientes: resultado.expedientes.map((exp: any) =>
                exp.id === updatedExpediente.id ? updatedExpediente : exp
            ),
        });
    };

    const handleDelete = (id: number) => {
        if (!resultado) return;
        setResultado({
            ...resultado,
            expedientes: resultado.expedientes.filter((exp: any) => exp.id !== id),
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TextInput
                style={styles.input}
                value={numeroControl}
                onChangeText={setNumeroControl}
                placeholder="Número de Control"
                placeholderTextColor={'#555'}
                keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title={loading ? 'Buscando...' : 'Buscar'} onPress={handleSearch} disabled={loading} />
                <Button title="Recargar" onPress={handleReload} disabled={loading || !numeroControl} />
            </View>

            {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
            {error !== '' && <Text style={styles.error}>{error}</Text>}

            {resultado && (
                <View style={styles.result}>
                    <Text style={styles.resultText}>Número de Control: {resultado.numeroControl}</Text>
                    <Text style={styles.resultText}>Nombre: {resultado.nombre}</Text>
                    <Text style={styles.resultText}>Carrera: {resultado.carrera}</Text>

                    {resultado.expedientes?.map((expediente: any) => (
                        <ListarExpedienteItem
                            key={expediente.id}
                            expediente={expediente}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            paciente={resultado}
                            onUpdated={() => console.log('Updated')} // Add this property
                            onDeleted={() => console.log('Deleted')} // Add this property
                        />
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
    },
    loader: {
        marginTop: 10,
    },
    error: {
        color: 'red',
        marginTop: 10,
    },
    result: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
    },
    resultText: {
        fontSize: 14,
        marginBottom: 6,
    },
    expedienteItem: {
        padding: 8,
        backgroundColor: '#ffffff',
        marginTop: 10,
        borderRadius: 6,
        elevation: 1,
    },
});

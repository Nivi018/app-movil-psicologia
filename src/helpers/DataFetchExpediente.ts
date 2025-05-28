// src/helpers/DataFetchExpediente.ts

export const fetchExpedienteData = async (noControl: string) => {
  try {
    // IMPORTANTE: cambia esto por la IP local de tu PC si estás usando emulador/dispositivo físico
    const API_URL = `https://backend-psicologia.fly.dev/api/expediente/expedientes/${noControl}`;

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Usuario no encontrado');
    }

    const userData = await response.json();
    console.log('Resultado de la respuesta de la API:', userData);

    const user = userData.usuario;
    const expedientes = userData.expedientes;

    return {
      numeroControl: user.no_control,
      nombre: user.nombre,
      apellido: user.apellido,
      edad: user.edad,
      sexo: user.sexo,
      diereccion: user.diereccion,
      telefono: user.telefono,
      carrera: user.ingenieria,
      modalidad: user.modalidad,
      semestre: user.semestre,
      expedientes: expedientes,
    };
  } catch (error: any) {
    console.error('Error al cargar los datos del usuario:', error.message);
    throw new Error(error.message || 'Error de red');
  }
};

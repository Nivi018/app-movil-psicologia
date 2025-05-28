export const updateExpediente = async (id: number, expedienteData: any) => {
  try {
    const response = await fetch(`https://backend-psicologia.fly.dev/api/expediente/expedienteUpdate/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expedienteData),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el expediente');
    }

    const updatedExpediente = await response.json();
    console.log('Expediente actualizado con éxito:', updatedExpediente);

    return updatedExpediente;
  } catch (error: any) {
    console.error('Error al actualizar el expediente:', error.message);
    throw error;
  }
};

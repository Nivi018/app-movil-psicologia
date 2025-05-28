export const deleteExpediente = async (id: number) => {
  try {
    const response = await fetch(`https://backend-psicologia.fly.dev/api/expediente/expedienteDelete/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('No se pudo eliminar el expediente');
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error al eliminar expediente: ${error.message}`);
  }
};

// Function to consume the comets endpoint
import axios from 'axios';
const apiUrl = 'http://localhost:3001/comets';  // Endpoint de tu servidor
export async function fetchComets(page = 1, limit = 10, full_name = '') {
  try {
    const response = await axios.get(apiUrl, {
    });

    // Procesar los datos recibidos
    console.log('Comets data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching comets:', error);
  }
}
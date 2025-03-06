import axios from 'axios';
import { Equipment, Rack } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const equipmentService = {
  // Get all equipment
  getAllEquipment: async (): Promise<Equipment[]> => {
    const response = await axios.get(`${API_URL}/api/equipment`);
    return response.data;
  },

  // Get equipment by ID
  getEquipmentById: async (id: string): Promise<Equipment> => {
    const response = await axios.get(`${API_URL}/api/equipment/${id}`);
    return response.data;
  },

  // Create new equipment
  createEquipment: async (equipment: Omit<Equipment, '_id'>): Promise<Equipment> => {
    const response = await axios.post(`${API_URL}/api/equipment`, equipment);
    return response.data;
  },

  // Update equipment
  updateEquipment: async (id: string, equipment: Partial<Equipment>): Promise<Equipment> => {
    const response = await axios.put(`${API_URL}/api/equipment/${id}`, equipment);
    return response.data;
  },

  // Delete equipment
  deleteEquipment: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/equipment/${id}`);
  },

  // Get equipment by rack
  getEquipmentByRack: async (rackId: string): Promise<Equipment[]> => {
    const response = await axios.get(`${API_URL}/api/equipment/rack/${rackId}`);
    return response.data;
  },

  // Update equipment status
  updateEquipmentStatus: async (id: string, status: Equipment['status']): Promise<Equipment> => {
    const response = await axios.patch(`${API_URL}/api/equipment/${id}/status`, { status });
    return response.data;
  },

  // Upload document for equipment
  uploadDocument: async (id: string, file: File): Promise<Equipment> => {
    const formData = new FormData();
    formData.append('document', file);
    const response = await axios.post(`${API_URL}/api/equipment/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
}; 
import axios from 'axios';
import { Workflow, WorkflowStep } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const workflowService = {
  // Get all workflows
  getAllWorkflows: async (): Promise<Workflow[]> => {
    const response = await axios.get(`${API_URL}/api/workflows`);
    return response.data;
  },

  // Get workflow by ID
  getWorkflowById: async (id: string): Promise<Workflow> => {
    const response = await axios.get(`${API_URL}/api/workflows/${id}`);
    return response.data;
  },

  // Create new workflow
  createWorkflow: async (workflow: Omit<Workflow, '_id'>): Promise<Workflow> => {
    const response = await axios.post(`${API_URL}/api/workflows`, workflow);
    return response.data;
  },

  // Update workflow
  updateWorkflow: async (id: string, workflow: Partial<Workflow>): Promise<Workflow> => {
    const response = await axios.put(`${API_URL}/api/workflows/${id}`, workflow);
    return response.data;
  },

  // Delete workflow
  deleteWorkflow: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/api/workflows/${id}`);
  },

  // Update workflow step
  updateWorkflowStep: async (
    workflowId: string,
    stepIndex: number,
    step: Partial<WorkflowStep>
  ): Promise<Workflow> => {
    const response = await axios.patch(
      `${API_URL}/api/workflows/${workflowId}/steps/${stepIndex}`,
      step
    );
    return response.data;
  },

  // Update checklist item
  updateChecklistItem: async (
    workflowId: string,
    stepIndex: number,
    itemIndex: number,
    completed: boolean,
    notes?: string
  ): Promise<Workflow> => {
    const response = await axios.patch(
      `${API_URL}/api/workflows/${workflowId}/steps/${stepIndex}/checklist/${itemIndex}`,
      { completed, notes }
    );
    return response.data;
  },

  // Get workflows by equipment type
  getWorkflowsByEquipmentType: async (equipmentType: string): Promise<Workflow[]> => {
    const response = await axios.get(
      `${API_URL}/api/workflows/equipment-type/${equipmentType}`
    );
    return response.data;
  },

  // Start workflow for equipment
  startWorkflowForEquipment: async (
    workflowId: string,
    equipmentId: string
  ): Promise<Workflow> => {
    const response = await axios.post(
      `${API_URL}/api/workflows/${workflowId}/start/${equipmentId}`
    );
    return response.data;
  },
}; 
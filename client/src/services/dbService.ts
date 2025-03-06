import Dexie, { Table } from 'dexie';
import { Equipment, Rack, Workflow } from '../types';

export class ServerRoomDB extends Dexie {
  equipment!: Table<Equipment>;
  racks!: Table<Rack>;
  workflows!: Table<Workflow>;
  syncQueue!: Table<{
    id: string;
    type: 'create' | 'update' | 'delete';
    entityType: 'equipment' | 'rack' | 'workflow';
    data: any;
    timestamp: Date;
  }>;

  constructor() {
    super('ServerRoomDB');
    this.version(1).stores({
      equipment: '++id, name, manufacturer, model, serialNumber, status, rackId',
      racks: '++id, rowId, rackNumber, status',
      workflows: '++id, name, equipmentType, status',
      syncQueue: '++id, type, entityType, timestamp'
    });
  }
}

export const dbService = {
  db: new ServerRoomDB(),

  // Equipment operations
  async saveEquipment(equipment: Equipment): Promise<void> {
    await this.db.equipment.put(equipment);
  },

  async getEquipment(id: string): Promise<Equipment | undefined> {
    return await this.db.equipment.get(id);
  },

  async getAllEquipment(): Promise<Equipment[]> {
    return await this.db.equipment.toArray();
  },

  async deleteEquipment(id: string): Promise<void> {
    await this.db.equipment.delete(id);
  },

  // Rack operations
  async saveRack(rack: Rack): Promise<void> {
    await this.db.racks.put(rack);
  },

  async getRack(id: string): Promise<Rack | undefined> {
    return await this.db.racks.get(id);
  },

  async getAllRacks(): Promise<Rack[]> {
    return await this.db.racks.toArray();
  },

  async deleteRack(id: string): Promise<void> {
    await this.db.racks.delete(id);
  },

  // Workflow operations
  async saveWorkflow(workflow: Workflow): Promise<void> {
    await this.db.workflows.put(workflow);
  },

  async getWorkflow(id: string): Promise<Workflow | undefined> {
    return await this.db.workflows.get(id);
  },

  async getAllWorkflows(): Promise<Workflow[]> {
    return await this.db.workflows.toArray();
  },

  async deleteWorkflow(id: string): Promise<void> {
    await this.db.workflows.delete(id);
  },

  // Sync queue operations
  async addToSyncQueue(
    type: 'create' | 'update' | 'delete',
    entityType: 'equipment' | 'rack' | 'workflow',
    data: any
  ): Promise<void> {
    await this.db.syncQueue.add({
      type,
      entityType,
      data,
      timestamp: new Date()
    });
  },

  async getSyncQueue(): Promise<any[]> {
    return await this.db.syncQueue.toArray();
  },

  async removeFromSyncQueue(id: string): Promise<void> {
    await this.db.syncQueue.delete(id);
  },

  // Sync operations
  async syncWithServer(): Promise<void> {
    const queue = await this.getSyncQueue();
    
    for (const item of queue) {
      try {
        switch (item.entityType) {
          case 'equipment':
            await this.syncEquipment(item);
            break;
          case 'rack':
            await this.syncRack(item);
            break;
          case 'workflow':
            await this.syncWorkflow(item);
            break;
        }
        await this.removeFromSyncQueue(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
      }
    }
  },

  private async syncEquipment(item: any): Promise<void> {
    const { type, data } = item;
    switch (type) {
      case 'create':
        await equipmentService.createEquipment(data);
        break;
      case 'update':
        await equipmentService.updateEquipment(data._id, data);
        break;
      case 'delete':
        await equipmentService.deleteEquipment(data._id);
        break;
    }
  },

  private async syncRack(item: any): Promise<void> {
    const { type, data } = item;
    switch (type) {
      case 'create':
        await rackService.createRack(data);
        break;
      case 'update':
        await rackService.updateRack(data._id, data);
        break;
      case 'delete':
        await rackService.deleteRack(data._id);
        break;
    }
  },

  private async syncWorkflow(item: any): Promise<void> {
    const { type, data } = item;
    switch (type) {
      case 'create':
        await workflowService.createWorkflow(data);
        break;
      case 'update':
        await workflowService.updateWorkflow(data._id, data);
        break;
      case 'delete':
        await workflowService.deleteWorkflow(data._id);
        break;
    }
  }
}; 
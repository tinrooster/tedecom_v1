import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../services/equipmentService';
import { Equipment } from '../types';

const EquipmentManagement: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const queryClient = useQueryClient();

  // Fetch equipment list
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentService.getAllEquipment,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: equipmentService.createEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Equipment> }) =>
      equipmentService.updateEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      setOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: equipmentService.deleteEquipment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });

  const handleOpen = (equipment?: Equipment) => {
    setSelectedEquipment(equipment || null);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedEquipment(null);
    setOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const equipmentData = {
      name: formData.get('name') as string,
      manufacturer: formData.get('manufacturer') as string,
      model: formData.get('model') as string,
      serialNumber: formData.get('serialNumber') as string,
      equipmentType: formData.get('equipmentType') as string,
      status: formData.get('status') as Equipment['status'],
    };

    if (selectedEquipment) {
      updateMutation.mutate({ id: selectedEquipment._id, data: equipmentData });
    } else {
      createMutation.mutate(equipmentData);
    }
  };

  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'in_signal_path':
        return 'warning';
      case 'ready_for_decommission':
        return 'info';
      case 'decommissioned':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Equipment Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Add Equipment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {equipment?.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.manufacturer}</TableCell>
                <TableCell>{item.model}</TableCell>
                <TableCell>{item.serialNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={getStatusColor(item.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteMutation.mutate(item._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedEquipment ? 'Edit Equipment' : 'Add New Equipment'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Name"
                  fullWidth
                  defaultValue={selectedEquipment?.name}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="manufacturer"
                  label="Manufacturer"
                  fullWidth
                  defaultValue={selectedEquipment?.manufacturer}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="model"
                  label="Model"
                  fullWidth
                  defaultValue={selectedEquipment?.model}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="serialNumber"
                  label="Serial Number"
                  fullWidth
                  defaultValue={selectedEquipment?.serialNumber}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="equipmentType"
                  label="Equipment Type"
                  fullWidth
                  defaultValue={selectedEquipment?.equipmentType}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="status"
                  label="Status"
                  select
                  fullWidth
                  defaultValue={selectedEquipment?.status || 'active'}
                  required
                >
                  <option value="active">Active</option>
                  <option value="in_signal_path">In Signal Path</option>
                  <option value="ready_for_decommission">Ready for Decommission</option>
                  <option value="decommissioned">Decommissioned</option>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {selectedEquipment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EquipmentManagement; 
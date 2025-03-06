import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

interface Equipment {
  id: string;
  name: string;
  startUnit: number;
  endUnit: number;
  position: 'front' | 'back';
  status: 'active' | 'in_signal_path' | 'ready_for_decommission' | 'decommissioned';
}

interface RackViewProps {
  rackNumber: string;
  totalUnits: number;
  equipment: Equipment[];
  onEquipmentClick?: (equipmentId: string) => void;
}

const RackUnit = styled(Paper)(({ theme }) => ({
  height: '20px',
  margin: '1px 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const RackView: React.FC<RackViewProps> = ({
  rackNumber,
  totalUnits,
  equipment,
  onEquipmentClick,
}) => {
  const theme = useTheme();
  
  const getStatusColor = (status: Equipment['status']) => {
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'in_signal_path':
        return theme.palette.warning.main;
      case 'ready_for_decommission':
        return theme.palette.info.main;
      case 'decommissioned':
        return theme.palette.grey[500];
      default:
        return theme.palette.grey[300];
    }
  };

  const renderEquipment = (position: 'front' | 'back') => {
    const positionEquipment = equipment.filter(e => e.position === position);
    
    return (
      <Box sx={{ width: '100%', p: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          {position === 'front' ? 'Front View' : 'Back View'}
        </Typography>
        {Array.from({ length: totalUnits }, (_, i) => {
          const unitNumber = i + 1;
          const equipmentInUnit = positionEquipment.find(
            e => unitNumber >= e.startUnit && unitNumber <= e.endUnit
          );

          if (equipmentInUnit) {
            return (
              <RackUnit
                key={i}
                sx={{
                  backgroundColor: getStatusColor(equipmentInUnit.status),
                  color: theme.palette.common.white,
                }}
                onClick={() => onEquipmentClick?.(equipmentInUnit.id)}
              >
                <Typography variant="caption" noWrap>
                  {equipmentInUnit.name}
                </Typography>
              </RackUnit>
            );
          }

          return (
            <RackUnit
              key={i}
              sx={{
                backgroundColor: theme.palette.grey[200],
                border: `1px solid ${theme.palette.grey[300]}`,
              }}
            >
              <Typography variant="caption" color="textSecondary">
                {unitNumber}U
              </Typography>
            </RackUnit>
          );
        })}
      </Box>
    );
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Rack {rackNumber}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        {renderEquipment('front')}
        {renderEquipment('back')}
      </Box>
    </Paper>
  );
};

export default RackView; 
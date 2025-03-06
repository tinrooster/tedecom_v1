import React from 'react';
import { Chip, Tooltip, ChipProps } from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Pending as PendingIcon,
  HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';

export type StatusType = 'pending' | 'in-progress' | 'completed' | 'failed' | 'cancelled' | string;

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  tooltip?: string;
  size?: ChipProps['size'];
  className?: string;
}

/**
 * StatusBadge component displays a color-coded badge for different statuses
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  tooltip,
  size = 'small',
  className
}) => {
  // Define status configurations
  const statusConfig: Record<string, { color: ChipProps['color']; icon: React.ReactNode; defaultLabel: string }> = {
    'pending': {
      color: 'default',
      icon: <PendingIcon fontSize="small" />,
      defaultLabel: 'Pending'
    },
    'in-progress': {
      color: 'primary',
      icon: <HourglassEmptyIcon fontSize="small" />,
      defaultLabel: 'In Progress'
    },
    'completed': {
      color: 'success',
      icon: <CheckCircleIcon fontSize="small" />,
      defaultLabel: 'Completed'
    },
    'failed': {
      color: 'error',
      icon: <ErrorIcon fontSize="small" />,
      defaultLabel: 'Failed'
    },
    'cancelled': {
      color: 'warning',
      icon: <ErrorIcon fontSize="small" />,
      defaultLabel: 'Cancelled'
    }
  };

  // Get configuration for the current status or use a default
  const config = statusConfig[status.toLowerCase()] || {
    color: 'default',
    icon: <PendingIcon fontSize="small" />,
    defaultLabel: status
  };

  const displayLabel = label || config.defaultLabel;
  
  const chip = (
    <Chip
      label={displayLabel}
      color={config.color}
      icon={config.icon}
      size={size}
      className={className}
    />
  );

  // Wrap in tooltip if tooltip text is provided
  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow>
        {chip}
      </Tooltip>
    );
  }

  return chip;
};

export default StatusBadge; 
import React from 'react';
import { Driver } from '../../types/index';
import { Table } from '../common/Table';
import { ExpirationBadge } from '../common/ExpirationBadge';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/dateUtils';

interface DriverTableProps {
  drivers: Driver[];
  loading?: boolean;
  onEdit?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}

export const DriverTable: React.FC<DriverTableProps> = ({
  drivers,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const columns = [
    {
      key: 'full_name' as const,
      label: 'Nombre Completo',
      width: '20%',
    },
    {
      key: 'license_number' as const,
      label: 'Número de Licencia',
      width: '15%',
    },
    {
      key: 'type' as const,
      label: 'Tipo',
      width: '10%',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value === 'PROPIO'
            ? 'bg-green-100 text-green-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {value === 'PROPIO' ? 'Propio' : 'Contratado'}
        </span>
      ),
    },
    {
      key: 'phone' as const,
      label: 'Teléfono',
      width: '15%',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'cuit_cuil' as const,
      label: 'CUIT / CUIL',
      width: '12%',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'license_exp_date' as const,
      label: 'Vencimiento Licencia',
      width: '18%',
      render: (value: string, item: Driver) => (
        <ExpirationBadge date={value} compact={true} />
      ),
    },
    {
      key: 'is_active' as const,
      label: 'Estado',
      width: '10%',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          value
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
  ];

  const handleDelete = (item: Driver) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este chofer?')) {
      onDelete?.(item);
    }
  };

  const actionColumn = {
    key: 'actions' as const,
    label: 'Acciones',
    width: '10%',
    align: 'center' as const,
    render: (_value: any, item: Driver) => (
      <div className="flex gap-2 justify-center">
        {onEdit && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(item);
            }}
          >
            Editar
          </Button>
        )}
        {onDelete && (
          <Button
            size="sm"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            Eliminar
          </Button>
        )}
      </div>
    ),
  };

  return (
    <Table
      columns={[...columns, actionColumn]}
      data={drivers}
      keyExtractor={(item) => item.id}
      loading={loading}
      emptyMessage="No hay choferes registrados"
    />
  );
};

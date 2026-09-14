import React from 'react';
import { Vehicle } from '../../types/index';
import { Table } from '../common/Table';
import { ExpirationBadge } from '../common/ExpirationBadge';
import { Button } from '../common/Button';

interface VehicleTableProps {
  vehicles: Vehicle[];
  loading?: boolean;
  onEdit?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onOpenFuel?: (vehicle: Vehicle) => void;
}

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  loading = false,
  onEdit,
  onDelete,
  onOpenFuel,
}) => {
  const columns = [
    {
      key: 'plate' as const,
      label: 'Patente',
      width: '10%',
      render: (value: string) => (
        <span className="font-semibold text-gray-900">{value}</span>
      ),
    },
    {
      key: 'vehicle_type' as const,
      label: 'Tipo',
      width: '10%',
      render: (value: string) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          {value}
        </span>
      ),
    },
    {
      key: 'brand' as const,
      label: 'Marca',
      width: '8%',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'model' as const,
      label: 'Modelo',
      width: '8%',
      render: (value: string | undefined) => value || '-',
    },
    {
      key: 'year' as const,
      label: 'Ano',
      width: '6%',
      render: (value: number | undefined) => value || '-',
    },
    {
      key: 'truck_rto_exp_date' as const,
      label: 'Vto. RTO (Camion)',
      width: '13%',
      render: (value: string | undefined, item: Vehicle) => (
        value ? <ExpirationBadge date={value} compact={true} /> : <span className="text-gray-500">-</span>
      ),
    },
    {
      key: 'trailer_rto_exp_date' as const,
      label: 'Vto. RTO (Acoplado)',
      width: '13%',
      render: (value: string | undefined, item: Vehicle) => (
        value ? <ExpirationBadge date={value} compact={true} /> : <span className="text-gray-500">-</span>
      ),
    },
    {
      key: 'truck_insurance_exp_date' as const,
      label: 'Vto. Seguro (Camion)',
      width: '13%',
      render: (value: string | undefined, item: Vehicle) => (
        value ? <ExpirationBadge date={value} compact={true} /> : <span className="text-gray-500">-</span>
      ),
    },
    {
      key: 'trailer_insurance_exp_date' as const,
      label: 'Vto. Seguro (Acoplado)',
      width: '13%',
      render: (value: string | undefined, item: Vehicle) => (
        value ? <ExpirationBadge date={value} compact={true} /> : <span className="text-gray-500">-</span>
      ),
    },
    {
      key: 'is_active' as const,
      label: 'Estado',
      width: '8%',
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

  const handleDelete = (item: Vehicle) => {
    if (window.confirm('Estas seguro de que deseas eliminar este vehiculo?')) {
      onDelete?.(item);
    }
  };

  const actionColumn = {
    key: 'actions' as const,
    label: 'Acciones',
    width: '12%',
    align: 'center' as const,
    render: (_value: any, item: Vehicle) => (
      <div className="flex gap-2 justify-center flex-wrap">
        {onOpenFuel && (
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              onOpenFuel(item);
            }}
            className="bg-amber-100 text-amber-700 hover:bg-amber-200"
          >
            Gasoil
          </Button>
        )}
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
      data={vehicles}
      keyExtractor={(item) => item.id}
      loading={loading}
      emptyMessage="No hay vehiculos registrados"
    />
  );
};

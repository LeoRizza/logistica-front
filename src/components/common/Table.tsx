import React, { ReactNode } from 'react';

interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  render?: (value: any, item: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string | number;
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  striped?: boolean;
  hover?: boolean;
  compact?: boolean;
}

export const Table = React.forwardRef<HTMLTableElement, TableProps<any>>(
  (
    {
      columns,
      data,
      keyExtractor,
      loading = false,
      onRowClick,
      emptyMessage = 'No hay datos disponibles',
      striped = true,
      hover = true,
      compact = false,
    },
    ref,
  ) => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="flex justify-center items-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table ref={ref} className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${
                    compact ? 'py-2 px-4' : ''
                  } ${
                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                  }`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr
                key={keyExtractor(item, index)}
                className={`border-b border-gray-200 transition-colors ${
                  striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } ${hover && onRowClick ? 'hover:bg-blue-50 cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className={`px-6 py-4 text-sm text-gray-900 ${compact ? 'py-2 px-4' : ''} ${
                      column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {column.render
                      ? column.render((item as any)[column.key as any], item, index)
                      : (item as any)[column.key as any] ?? '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  },
);

Table.displayName = 'Table';

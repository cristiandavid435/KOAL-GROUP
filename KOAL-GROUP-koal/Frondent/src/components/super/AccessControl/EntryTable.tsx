import React, { useEffect, useState } from 'react';

type EntryLog = {
  id: number;
  name: string;
  employeeId: string;
  timestampEntrada?: string;
  date: string;
  area: string;
};

type EntryLogTableProps = {
  logs: any[];
};

export const EntryTable: React.FC<EntryLogTableProps> = ({ logs }) => {
  const [entries, setEntries] = useState<EntryLog[]>([]);

  useEffect(() => {
    const formatTime = (hora: string) => hora ? hora.slice(0, 5) : '-';
    const formatDate = (fecha: string) => {
      if (!fecha) return '';
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    };

    const mapLogs = (data: any[]): EntryLog[] =>
      data
        .filter((item) => item.hora_entrada)
        .map((item) => ({
          id: item.id,
          name: item.empleadoNombre,
          employeeId: item.empleadoId?.toString() || '',
          timestampEntrada: formatTime(item.hora_entrada),
          date: formatDate(item.fecha),
          area: item.lugar_trabajo,
        }));

    setEntries(mapLogs(logs));
  }, [logs]);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-4 text-left">Empleado</th>
            <th className="py-3 px-4 text-left">Cédula</th>
            <th className="py-3 px-4 text-left">Hora</th>
            <th className="py-3 px-4 text-left">Fecha</th>
            <th className="py-3 px-4 text-left">Área</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{entry.name}</td>
              <td className="py-3 px-4">{entry.employeeId}</td>
              <td className="py-3 px-4">{entry.timestampEntrada}</td>
              <td className="py-3 px-4">{entry.date}</td>
              <td className="py-3 px-4">{entry.area}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


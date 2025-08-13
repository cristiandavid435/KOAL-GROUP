import React, { useEffect, useState } from 'react';

type ExitLog = {
  id: number;
  name: string;
  employeeId: string;
  timestampSalida: string;
  date: string;
  area: string;
};

type ExitLogTableProps = {
  logs: any[];
};

export const ExitTable: React.FC<ExitLogTableProps> = ({ logs }) => {
  const [exits, setExits] = useState<ExitLog[]>([]);

  useEffect(() => {
    const formatTime = (hora: string) => hora ? hora.slice(0, 5) : '-';
    const formatDate = (fecha: string) => {
      if (!fecha) return '';
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    };

    const mapLogs = (data: any[]): ExitLog[] =>
      data
        .filter((item) => item.hora_salida)
        .map((item) => ({
          id: item.id,
          name: item.empleadoNombre,
          employeeId: item.empleadoId?.toString() || '',
          timestampSalida: formatTime(item.hora_salida),
          date: formatDate(item.fecha),
          area: item.lugar_trabajo,
        }));

    setExits(mapLogs(logs));
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
          {exits.map((exit) => (
            <tr key={exit.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{exit.name}</td>
              <td className="py-3 px-4">{exit.employeeId}</td>
              <td className="py-3 px-4">{exit.timestampSalida}</td>
              <td className="py-3 px-4">{exit.date}</td>
              <td className="py-3 px-4">{exit.area}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../axiosInstance';

interface AccessLog {
  id: number;
  employee_name: string;
  employee: string;
  access_type: string;
  timestamp: string;
  area: string;
}

interface Props {
  filter: string;
  reload: boolean;
}

export const AccessLogTable: React.FC<Props> = ({ filter, reload }) => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get<AccessLog[]>('access-logs/')
      .then(res => {
        let data = res.data;
        if (filter === 'entries') {
          data = data.filter(l => l.access_type === 'ENTRADA');
        }
        if (filter === 'exits') {
          data = data.filter(l => l.access_type === 'SALIDA');
        }
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando access logs", err);
        setLoading(false);
      });
  }, [filter, reload]);

  if (loading) {
    return <div className="text-center text-gray-500">Cargando registros...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-4 text-left">Empleado</th>
            <th className="py-3 px-4 text-left">ID</th>
            <th className="py-3 px-4 text-left">Tipo</th>
            <th className="py-3 px-4 text-left">Hora</th>
            <th className="py-3 px-4 text-left">Área</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {logs.map(log => (
            <tr key={log.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">{log.employee_name || '---'}</td>
              <td className="py-3 px-4">{log.employee}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.access_type === 'ENTRADA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {log.access_type}
                </span>
              </td>
              <td className="py-3 px-4">{new Date(log.timestamp).toLocaleTimeString()}</td>
              <td className="py-3 px-4">{log.area}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

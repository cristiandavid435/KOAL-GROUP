import React, { useState } from 'react';
import { UserPlusIcon, UserMinusIcon, RefreshCwIcon, DownloadIcon } from 'lucide-react';
import { AccessLogTable } from './AccessLogTable';
import { RegisterEntryForm, EntryFormData } from './RegisterEntryForm';
import { RegisterExitForm, ExitFormData } from './RegisterExitForm';
import axiosInstance from '../../../axiosInstance';

export const AccessControlPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [showExitForm, setShowExitForm] = useState(false);
  const [reload, setReload] = useState(false);

  const handleRegisterEntry = async (data: EntryFormData) => {
    try {
      await axiosInstance.post('access-logs/', {
        employee: data.employeeId,
        access_type: 'ENTRADA',
        area: data.area,
        notes: data.notes,
        health_status_or_rfc: (data as any).rfc || '',
      });
      setReload(!reload);
    } catch (error) {
      console.error("Error registrando entrada:", error);
    }
  };

  const handleRegisterExit = async (data: ExitFormData) => {
    try {
      await axiosInstance.post('access-logs/', {
        employee: data.employeeId,
        access_type: 'SALIDA',
        area: data.area,
        notes: data.notes,
        health_status_or_rfc: (data as any).rfc || '',
      });
      setReload(!reload);
    } catch (error) {
      console.error("Error registrando salida:", error);
    }
  };

  return (
    <div className="space-y-6">
      {showEntryForm && (
        <RegisterEntryForm
          onClose={() => setShowEntryForm(false)}
          onSubmit={handleRegisterEntry}
        />
      )}
      {showExitForm && (
        <RegisterExitForm
          onClose={() => setShowExitForm(false)}
          onSubmit={handleRegisterExit}
        />
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Control de Acceso</h1>
        <div className="flex gap-3">
          <button
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => setShowEntryForm(true)}
          >
            <UserPlusIcon size={18} className="mr-2" />
            Registrar Entrada
          </button>
          <button
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => setShowExitForm(true)}
          >
            <UserMinusIcon size={18} className="mr-2" />
            Registrar Salida
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-4">
            <button className={`px-3 py-2 ${activeTab === 'all' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('all')}>
              Todos
            </button>
            <button className={`px-3 py-2 ${activeTab === 'entries' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('entries')}>
              Entradas
            </button>
            <button className={`px-3 py-2 ${activeTab === 'exits' ? 'border-b-2 border-gray-800 font-medium' : 'text-gray-600'}`} onClick={() => setActiveTab('exits')}>
              Salidas
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <button onClick={() => setReload(!reload)} className="p-2 text-gray-600 hover:text-gray-900">
              <RefreshCwIcon size={18} />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <DownloadIcon size={18} />
            </button>
          </div>
        </div>
        <AccessLogTable filter={activeTab} reload={reload} />
      </div>
    </div>
  );
};

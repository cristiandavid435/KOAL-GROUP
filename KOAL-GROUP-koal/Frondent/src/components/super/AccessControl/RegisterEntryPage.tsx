import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { RegisterEntryForm } from './RegisterEntryForm';
import { RegisterExitForm } from './RegisterExitForm';

export const RegisterEntryPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          className="p-2 text-gray-600 hover:text-gray-900"
          onClick={() => navigate('/access-control')}
        >
          <ArrowLeftIcon size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Registrar Entrada</h1>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <RegisterEntryForm
          onClose={() => navigate('/access-control')}
          onSubmit={() => navigate('/access-control')}
        />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <RegisterExitForm
          onClose={() => navigate('/access-control')}
          onSubmit={() => navigate('/access-control')}
        />
      </div>
    </div>
  );
};

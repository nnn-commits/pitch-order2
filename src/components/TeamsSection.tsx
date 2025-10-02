'use client';

import { useState } from 'react';
import { TrashIcon } from './TrashIcon';
import { EditIcon } from './Icons';
import { Team, Partner } from '@/types';

interface TeamsSectionProps {
  teams: Team[];
  partners: Partner[];
  onAddTeam: (name: string, partnerId: string, caseName?: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onEditTeam: (teamId: string, updates: Partial<Team>) => void;
}

export function TeamsSection({
  teams,
  partners,
  onAddTeam,
  onDeleteTeam,
  onEditTeam
}: TeamsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    partnerId: '',
    caseName: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.partnerId) return;
    
    // Проверяем на дубликаты названий команд
    const isDuplicate = teams.some(t => 
      t.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Команда с таким названием уже существует');
      return;
    }
    
    onAddTeam(
      formData.name.trim(),
      formData.partnerId,
      formData.caseName.trim() || undefined
    );
    
    resetForm();
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team.id);
    setFormData({
      name: team.name,
      partnerId: team.partnerId,
      caseName: team.caseName || ''
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.partnerId || !editingTeam) return;
    
    // Проверяем на дубликаты (исключая текущую команду)
    const isDuplicate = teams.some(t => 
      t.id !== editingTeam && 
      t.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Команда с таким названием уже существует');
      return;
    }
    
    onEditTeam(editingTeam, {
      name: formData.name.trim(),
      partnerId: formData.partnerId,
      caseName: formData.caseName.trim() || undefined
    });
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', partnerId: '', caseName: '' });
    setIsAdding(false);
    setEditingTeam(null);
  };

  const handleDelete = (team: Team) => {
    if (window.confirm(`Удалить команду "${team.name}"?`)) {
      onDeleteTeam(team.id);
    }
  };

  const groupedTeams = partners.map(partner => ({
    partner,
    teams: teams.filter(team => team.partnerId === partner.id)
  })).filter(group => group.teams.length > 0);

  if (partners.length === 0) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Сначала добавьте партнеров
          </h3>
          <p className="text-gray-600">
            Команды привязываются к партнерам. Перейдите во вкладку &quot;Партнеры&quot; и добавьте их.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Команды
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="text-white px-4 py-2 rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2"
          style={{ backgroundColor: '#47EA91' }}
        >
          <span>➕</span>
          <span>Добавить команду</span>
        </button>
      </div>

      {/* Форма добавления/редактирования */}
      {(isAdding || editingTeam) && (
        <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-4">
            {editingTeam ? 'Редактировать команду' : 'Добавить команду'}
          </h3>
          <form onSubmit={editingTeam ? handleSaveEdit : handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название команды <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Команда Ромашки"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Партнер <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.partnerId}
                  onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Выберите партнера</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название кейса (опционально)
              </label>
              <input
                type="text"
                value={formData.caseName}
                onChange={(e) => setFormData({ ...formData, caseName: e.target.value })}
                placeholder="Например: Искусственный интеллект"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="text-white px-4 py-2 rounded hover:opacity-90 transition-colors"
                style={{ backgroundColor: '#47EA91' }}
                disabled={!formData.name.trim() || !formData.partnerId}
              >
                {editingTeam ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список команд */}
      {teams.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Команд пока нет
          </h3>
          <p className="text-gray-600">
            Добавьте команды для проведения жеребьевки
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedTeams.map(({ partner, teams: partnerTeams }) => (
            <div key={partner.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900 flex items-center space-x-2">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {partner.name.charAt(0).toUpperCase()}
                  </span>
                  <span>{partner.name}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {partnerTeams.length} команд
                  </span>
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {partnerTeams.map((team) => (
                  <div key={team.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {team.name}
                        </div>
                        {team.caseName && (
                          <div className="text-sm text-gray-600 mt-1">
                            Кейс: {team.caseName}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Создана: {new Intl.DateTimeFormat('ru-RU', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }).format(team.createdAt)}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                          title="Редактировать команду"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(team)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Удалить команду"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
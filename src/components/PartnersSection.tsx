'use client';

import { useState } from 'react';
import { Partner } from '@/types';

interface PartnersSectionProps {
  partners: Partner[];
  onAddPartner: (name: string) => void;
  onDeletePartner: (partnerId: string) => void;
}

export function PartnersSection({ 
  partners, 
  onAddPartner, 
  onDeletePartner 
}: PartnersSectionProps) {
  const [newPartnerName, setNewPartnerName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPartnerName.trim()) return;
    
    // Проверяем на дубликаты
    const isDuplicate = partners.some(p => 
      p.name.toLowerCase() === newPartnerName.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Партнер с таким названием уже существует');
      return;
    }
    
    onAddPartner(newPartnerName.trim());
    setNewPartnerName('');
    setIsAdding(false);
  };

  const handleDelete = (partner: Partner) => {
    if (window.confirm(`Удалить партнера "${partner.name}"?`)) {
      onDeletePartner(partner.id);
    }
  };

  const defaultPartners = [
    'Альфа-Банк', 'НСПК', 'Центр-инвест', 'Московская Биржа', 'Т-Банк', 
    'ВТБ', 'ИТ Холдинг Т1', 'Газпромбанк.Тех', 'Робокасса'
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Список партнеров
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Добавить</span>
        </button>
      </div>

      {/* Быстрое добавление */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-3">
          Быстрое добавление популярных партнеров:
        </h3>
        <div className="flex flex-wrap gap-2">
          {defaultPartners.map((partnerName) => (
            <button
              key={partnerName}
              onClick={() => onAddPartner(partnerName)}
              className="bg-white border border-blue-300 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-50 transition-colors"
            >
              {partnerName}
            </button>
          ))}
        </div>
      </div>

      {/* Форма добавления */}
      {isAdding && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={newPartnerName}
              onChange={(e) => setNewPartnerName(e.target.value)}
              placeholder="Название партнера"
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              disabled={!newPartnerName.trim()}
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewPartnerName('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Список партнеров */}
      {partners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Партнеров пока нет
          </h3>
          <p className="text-gray-600 mb-4">
            Добавьте партнеров для создания команд
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-medium">
                  {partner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {partner.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Intl.DateTimeFormat('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                    }).format(partner.createdAt)}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(partner)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Удалить партнера"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

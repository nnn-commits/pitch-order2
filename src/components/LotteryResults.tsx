'use client';

import { Event, LotteryResult } from '@/types';

interface LotteryResultsProps {
  result: LotteryResult;
  event: Event;
  showDetails?: boolean;
}

export function LotteryResults({ result, event, showDetails = false }: LotteryResultsProps) {
  const getPartnerName = (partnerId: string) => {
    const partner = event.partners.find(p => p.id === partnerId);
    return partner ? partner.name : 'Неизвестный партнер';
  };

  const getPartnerColor = (partnerId: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800', 
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
    ];
    
    // Используем стабильный цвет для каждого партнера
    const partnerIndex = event.partners.findIndex(p => p.id === partnerId);
    return colors[partnerIndex % colors.length];
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Заголовок результата */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Результат жеребьевки
            </h2>
            <p className="text-blue-100">
              {formatTime(result.createdAt)}
            </p>
          </div>
          <div className="text-right">
            {/* Скрыта кнопка статуса корректности */}
          </div>
        </div>
      </div>

      {/* Нарушения (если есть) */}
      {result.violations && result.violations.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200 p-4">
          <h3 className="font-medium text-yellow-900 mb-2">
            ⚠️ Обнаружены нарушения ограничений:
          </h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            {result.violations.map((violation, index) => (
              <li key={index}>
                • Позиция {violation.position + 1}: {violation.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Последовательность команд */}
      <div className="p-6">
        <div className="grid gap-4">
          {result.sequence.map((team, index) => {
            const partnerName = getPartnerName(team.partnerId);
            const colorClass = getPartnerColor(team.partnerId);
            const isViolation = result.violations?.some(v => v.position === index);
            
            return (
              <div
                key={`${team.id}-${index}`}
                className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                  isViolation 
                    ? 'border-yellow-300 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {/* Номер */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isViolation ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-600 text-white'
                  }`}>
                    {index + 1}
                  </div>
                </div>

                {/* Информация о команде */}
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg">
                    {team.name}
                  </div>
                  {team.caseName && (
                    <div className="text-gray-600 text-sm mt-1">
                      Кейс: {team.caseName}
                    </div>
                  )}
                </div>

                {/* Партнер */}
                <div className="flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colorClass}`}>
                    {partnerName}
                  </span>
                </div>

                {/* Индикатор нарушения */}
                {isViolation && (
                  <div className="flex-shrink-0 text-yellow-600" title="Нарушение ограничений">
                    ⚠️
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Статистика (если показывать детали) */}
      {showDetails && (
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">
            Статистика распределения:
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Общая статистика */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Общие показатели:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between">
                  <span>Всего команд:</span>
                  <span className="font-medium">{result.sequence.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Партнеров:</span>
                  <span className="font-medium">{event.partners.length}</span>
                </li>
                <li className="flex justify-between">
                  <span>Команд с кейсами:</span>
                  <span className="font-medium">
                    {result.sequence.filter(team => team.caseName).length}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Нарушений:</span>
                  <span className={`font-medium ${result.violations?.length ? 'text-red-600' : 'text-green-600'}`}>
                    {result.violations?.length || 0}
                  </span>
                </li>
              </ul>
            </div>

            {/* По партнерам */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">По партнерам:</h4>
              <div className="space-y-2">
                {event.partners.map(partner => {
                  const partnerTeams = result.sequence.filter(team => team.partnerId === partner.id);
                  const colorClass = getPartnerColor(partner.id);
                  
                  return (
                    <div key={partner.id} className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-xs ${colorClass}`}>
                        {partner.name}
                      </span>
                      <span className="text-sm font-medium">
                        {partnerTeams.length} команд
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
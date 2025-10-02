'use client';

import { Event, LotteryValidationResult } from '@/types';
import { CheckIcon, WarningIcon } from './Icons';

interface LotteryValidationProps {
  validation: LotteryValidationResult;
  event: Event;
}

export function LotteryValidation({ validation, event }: LotteryValidationProps) {
  const partnerCounts = new Map<string, { name: string; count: number }>();
  
  // Подсчитываем команды по партнерам
  event.teams.forEach(team => {
    const partner = event.partners.find(p => p.id === team.partnerId);
    const partnerName = partner ? partner.name : 'Неизвестный партнер';
    
    if (partnerCounts.has(team.partnerId)) {
      partnerCounts.get(team.partnerId)!.count += 1;
    } else {
      partnerCounts.set(team.partnerId, { name: partnerName, count: 1 });
    }
  });

  const maxAllowedPerPartner = Math.ceil(validation.totalTeams / 2);

  if (validation.canGenerate) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <CheckIcon className="w-8 h-8 text-green-500" />
          <div className="flex-1">
            <h3 className="font-medium text-green-900 mb-2">
              Жеребьевка возможна
            </h3>
            <p className="text-green-700 text-sm mb-4">
              Все ограничения соблюдены. Можно провести жеребьевку без нарушений.
            </p>
            
            <div className="text-sm text-green-600">
              <div className="mb-2">
                <strong>Общая статистика:</strong>
              </div>
              <ul className="space-y-1">
                <li>• Команд: {validation.totalTeams}</li>
                <li>• Максимально команд на партнера: {maxAllowedPerPartner}</li>
                <li>• Наибольшая группа: {validation.maxPartnerCount} команд</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start space-x-3">
        <div className="text-2xl">❌</div>
        <div className="flex-1">
          <h3 className="font-medium text-red-900 mb-2">
            Жеребьевка невозможна
          </h3>
          <div className="text-red-700 text-sm mb-4">
            {validation.violations.map((violation, index) => (
              <p key={index} className="mb-2">
                {violation}
              </p>
            ))}
          </div>

          <div className="bg-white border border-red-200 rounded p-4 mb-4">
            <h4 className="font-medium text-red-900 mb-3">
              Распределение команд по партнерам:
            </h4>
            <div className="space-y-2">
              {Array.from(partnerCounts.entries()).map(([partnerId, { name, count }]) => (
                <div 
                  key={partnerId} 
                  className={`flex justify-between items-center p-2 rounded ${
                    count > maxAllowedPerPartner 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="font-medium">{name}</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    count > maxAllowedPerPartner 
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    <span className="flex items-center space-x-1">
                      <span>{count} команд</span>
                      {count > maxAllowedPerPartner && <WarningIcon className="w-4 h-4 text-yellow-500" />}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Как исправить:
            </h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Уменьшите количество команд у проблемных партнеров</li>
              <li>• Добавьте больше команд от других партнеров</li>
              <li>• Перераспределите команды между партнерами</li>
              <li>• Максимально допустимо: {maxAllowedPerPartner} команд на партнера</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

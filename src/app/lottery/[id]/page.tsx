'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckIcon, WarningIcon } from '@/components/Icons';
import { Event, LotteryResult, LotteryValidationResult } from '@/types';
import { loadEvents, loadLotteryResults, saveLotteryResults } from '@/lib/storage';
import { 
  validateLotteryFeasibility, 
  generateLotterySequence, 
  createLotteryResult 
} from '@/lib/lottery';
import { LotteryResults } from '@/components/LotteryResults';

export default function LotteryPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [validation, setValidation] = useState<LotteryValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentResult, setCurrentResult] = useState<LotteryResult | null>(null);
  const [pastResults, setPastResults] = useState<LotteryResult[]>([]);
  const [showTeamsList, setShowTeamsList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const events = loadEvents();
    const foundEvent = events.find(e => e.id === eventId);
    
    if (!foundEvent) {
      router.push('/');
      return;
    }
    
    setEvent(foundEvent);
    
    // Проверяем возможность проведения жеребьевки
    const validationResult = validateLotteryFeasibility(foundEvent.teams, foundEvent.partners);
    setValidation(validationResult);
    
    // Загружаем историю результатов
    const allResults = loadLotteryResults();
    const eventResults = allResults.filter(r => r.eventId === eventId);
    setPastResults(eventResults);
    
    setLoading(false);
  }, [eventId, router]);

  const startCountdown = async (callback: () => Promise<void>) => {
    setCountdown(3);
    
    for (let i = 3; i > 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCountdown(null);
    await callback();
  };

  const handleGenerateLottery = async () => {
    if (!event || !validation?.canGenerate) return;
    
    await startCountdown(async () => {
      setIsGenerating(true);
      
      try {
        // Добавляем небольшую задержку для UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const sequence = generateLotterySequence(event.teams, event.partners);
        const result = createLotteryResult(event.id, sequence);
        
        // Сохраняем результат
        const allResults = loadLotteryResults();
        const updatedResults = [...allResults, result];
        saveLotteryResults(updatedResults);
        
        setCurrentResult(result);
        setPastResults(prev => [...prev, result]);
        
        // Автоматически скрываем список команд после жеребьевки для экономии места
        setShowTeamsList(false);
        
      } catch (error) {
        console.error('Ошибка генерации жеребьевки:', error);
        alert(`Ошибка: ${error}`);
      } finally {
        setIsGenerating(false);
      }
    });
  };

  const handleRepeatLottery = async () => {
    setCurrentResult(null);
    // Показываем список команд при повторной жеребьевке
    setShowTeamsList(true);
    await handleGenerateLottery();
  };

  const handleShowPastResult = (result: LotteryResult) => {
    setCurrentResult(result);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка события...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Событие не найдено
        </h2>
        <p className="text-gray-600 mb-6">
          Возможно, событие было удалено или не существует
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#3B9BFF' }}
        >
          Вернуться к событиям
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Распределение кейсов по командам
        </h1>
        <div className="text-lg text-gray-600">
          {event.name}
        </div>
      </div>

      {/* Навигация */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push(`/events/${event.id}`)}
          className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>←</span>
          <span>Вернуться к редактированию события</span>
        </button>
      </div>


      {/* Список команд */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between p-6 pb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Команды для жеребьевки ({event.teams.length})
          </h3>
          <button
            onClick={() => setShowTeamsList(!showTeamsList)}
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-1"
          >
            <span>{showTeamsList ? 'Скрыть' : 'Показать'}</span>
            <span className="transform transition-transform duration-200" style={{
              transform: showTeamsList ? 'rotate(180deg)' : 'rotate(0deg)'
            }}>
              ▼
            </span>
          </button>
        </div>
        
        {showTeamsList && (
          <div className="px-6 pb-6">
            {/* Поиск и фильтрация */}
            {event.teams.length > 6 && (
              <div className="mb-4 space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Поиск по названию команды или кейса..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <select
                    value={selectedPartner}
                    onChange={(e) => setSelectedPartner(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">Все партнеры</option>
                    {event.partners.map(partner => (
                      <option key={partner.id} value={partner.id}>
                        {partner.name}
                      </option>
                    ))}
                  </select>
                </div>
                {(searchTerm || selectedPartner) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedPartner('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ✕ Очистить фильтры
                  </button>
                )}
              </div>
            )}
        
        {event.teams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>Команды не добавлены</p>
          </div>
        ) : (
          <>
            {(() => {
              const filteredTeams = event.teams.filter(team => {
                // Фильтр по поиску
                const matchesSearch = !searchTerm || 
                  team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (team.caseName && team.caseName.toLowerCase().includes(searchTerm.toLowerCase()));
                
                // Фильтр по партнеру
                const matchesPartner = !selectedPartner || team.partnerId === selectedPartner;
                
                return matchesSearch && matchesPartner;
              });

              return (
                <>
                  {(searchTerm || selectedPartner) && (
                    <div className="mb-3 text-sm text-gray-600">
                      Показано команд: {filteredTeams.length} из {event.teams.length}
                    </div>
                  )}
                  
                  {filteredTeams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🔍</div>
                      <p>Команды по заданным фильтрам не найдены</p>
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {filteredTeams.map((team) => {
              const partner = event.partners.find(p => p.id === team.partnerId);
              const partnerName = partner ? partner.name : 'Неизвестный партнер';
              
              return (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {team.name}
                    </div>
                    {team.caseName && (
                      <div className="text-sm text-gray-600 truncate">
                        {team.caseName}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {partnerName}
                    </span>
                  </div>
                </div>
              );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </>
        )}

        {/* Статистика партнеров */}
        {event.partners.length > 0 && event.teams.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="font-medium text-gray-700 mb-3">Распределение по партнерам:</h4>
            <div className="flex flex-wrap gap-2">
              {event.partners.map(partner => {
                const partnerTeams = event.teams.filter(team => team.partnerId === partner.id);
                if (partnerTeams.length === 0) return null;
                
                return (
                  <span
                    key={partner.id}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                  >
                    {partner.name}: {partnerTeams.length}
                  </span>
                );
              })}
            </div>
          </div>
        )}
          </div>
        )}
      </div>

      {/* Основной контент */}
      {validation?.canGenerate ? (
        <div className="space-y-8">
          {/* Кнопки управления */}
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-4">
              {!currentResult && (
                <button
                  onClick={handleGenerateLottery}
                  disabled={isGenerating || countdown !== null}
                  className="text-white px-8 py-4 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 text-lg font-medium"
                  style={{ backgroundColor: '#3B9BFF' }}
                >
                  {countdown !== null ? (
                    <div className="text-4xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  ) : isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Определение последовательности...</span>
                    </>
                  ) : (
                    <>
                      <span>Определить последовательность</span>
                    </>
                  )}
                </button>
              )}
              
              {currentResult && (
                <div className="flex space-x-4">
                  <button
                    onClick={handleRepeatLottery}
                    disabled={isGenerating || countdown !== null}
                    className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    style={{ backgroundColor: '#FE7096' }}
                  >
                    {countdown !== null ? (
                      <div className="text-2xl font-bold animate-pulse">
                        {countdown}
                      </div>
                    ) : (
                      <span>Повторить жеребьевку</span>
                    )}
                  </button>
                  
                  <button
                    onClick={() => router.push(`/results/${eventId}`)}
                    className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors flex items-center space-x-2"
                    style={{ backgroundColor: '#47EA91' }}
                  >
                    <span>Смотреть результаты</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Результаты */}
          {currentResult && (
            <LotteryResults
              result={currentResult}
              event={event}
              showDetails={true}
            />
          )}

          {/* История результатов скрыта по требованию UX */}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mb-4">
            <WarningIcon className="w-16 h-16 text-yellow-500 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Невозможно провести жеребьевку
          </h3>
          <p className="text-gray-600 mb-6">
            Исправьте ошибки выше и попробуйте снова
          </p>
          <button
            onClick={() => router.push(`/events/${event.id}`)}
            className="text-white px-6 py-3 rounded-lg hover:opacity-90 transition-colors"
            style={{ backgroundColor: '#3B9BFF' }}
          >
            Редактировать событие
          </button>
        </div>
      )}
    </div>
  );
}

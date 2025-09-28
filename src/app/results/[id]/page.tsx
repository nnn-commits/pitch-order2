'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Event, LotteryResult } from '@/types';
import { loadEvents, loadLotteryResults } from '@/lib/storage';
import { LotteryResults } from '@/components/LotteryResults';

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [results, setResults] = useState<LotteryResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<LotteryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const events = loadEvents();
    const foundEvent = events.find(e => e.id === eventId);
    
    if (!foundEvent) {
      router.push('/');
      return;
    }
    
    setEvent(foundEvent);
    
    // Загружаем результаты для этого события
    const allResults = loadLotteryResults();
    const eventResults = allResults
      .filter(r => r.eventId === eventId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    setResults(eventResults);
    
    // Выбираем последний результат по умолчанию
    if (eventResults.length > 0) {
      setSelectedResult(eventResults[0]);
    }
    
    setLoading(false);
  }, [eventId, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка результатов...</p>
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
        <button
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Вернуться к событиям
        </button>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Результатов пока нет
          </h2>
          <p className="text-gray-600 mb-6">
            Проведите жеребьевку для события &quot;{event.name}&quot;
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push(`/lottery/${event.id}`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>🎲</span>
              <span>Провести жеребьевку</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Вернуться к событиям
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Результаты жеребьевки
        </h1>
        <p className="text-lg text-gray-600">
          {event.name}
        </p>
      </div>

      {/* Навигация */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => router.push(`/events/${event.id}`)}
          className="text-blue-600 hover:text-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>←</span>
          <span>К событию</span>
        </button>
        <button
          onClick={() => router.push(`/lottery/${event.id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <span>🎲</span>
          <span>Новая жеребьевка</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Список результатов */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">
                История жеребьевок ({results.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => setSelectedResult(result)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedResult?.id === result.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      #{results.length - index}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      result.isValid 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.isValid ? '✅' : '⚠️'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(result.createdAt)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {result.sequence.length} команд
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Детали выбранного результата */}
        <div className="lg:col-span-3">
          {selectedResult ? (
            <LotteryResults
              result={selectedResult}
              event={event}
              showDetails={true}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
              <div className="text-4xl mb-4">👈</div>
              <p className="text-gray-600">
                Выберите результат жеребьевки из списка слева
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Экспорт/Печать */}
      {selectedResult && (
        <div className="text-center">
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>🖨️</span>
            <span>Распечатать результат</span>
          </button>
        </div>
      )}
    </div>
  );
}
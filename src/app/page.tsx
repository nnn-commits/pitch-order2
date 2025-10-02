'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Event } from '@/types';
import { loadEvents, saveEvents, saveCurrentEventId } from '@/lib/storage';
import { EventCard } from '@/components/EventCard';

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEvents = loadEvents();
    console.log('Загружено событий:', storedEvents.length);
    console.log('События:', storedEvents.map(e => ({ id: e.id, name: e.name })));
    
    // Проверяем на дубликаты по ID
    const uniqueEvents = storedEvents.filter((event, index, self) => 
      index === self.findIndex(e => e.id === event.id)
    );
    
    if (uniqueEvents.length !== storedEvents.length) {
      console.warn('Обнаружены дубликаты событий! Исправляем...');
      saveEvents(uniqueEvents);
      setEvents(uniqueEvents);
    } else {
      setEvents(storedEvents);
    }
    
    setLoading(false);
  }, []);

  const handleEventSelect = (eventId: string) => {
    saveCurrentEventId(eventId);
  };

  const handleEventDelete = (eventId: string) => {
    // Удаляем из localStorage
    const allEvents = loadEvents();
    const updatedEvents = allEvents.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
    
    // Обновляем состояние компонента
    setEvents(updatedEvents);
  };

  const handleClearAllData = () => {
    if (window.confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
      localStorage.clear();
      setEvents([]);
      alert('Все данные удалены');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка событий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Выберите событие и начните жеребьевку
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Система случайного определения последовательности выступлений команд 
          с ограничением на соседние партнеры
        </p>
      </div>

      {/* Кнопка создания события */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">Выберите событие</h2>
        <div className="flex space-x-3">
          {/* Кнопка очистки данных (только для разработки) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={handleClearAllData}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
              title="Очистить все данные (только для разработки)"
            >
              🗑️ Очистить данные
            </button>
          )}
          
          <Link
            href="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Не нашли нужного события?</span>
            <span className="bg-white text-blue-600 px-3 py-1 rounded font-medium">
              Создать
            </span>
          </Link>
        </div>
      </div>

      {/* Список событий */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Событий пока нет
          </h3>
          <p className="text-gray-600 mb-6">
            Создайте первое событие для проведения жеребьевки
          </p>
          <Link
            href="/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <span>➕</span>
            <span>Создать событие</span>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={handleEventSelect}
              onDelete={handleEventDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvent, saveEvents, loadEvents } from '@/lib/storage';

export default function CreateEventPage() {
  const [eventName, setEventName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventName.trim()) {
      alert('Пожалуйста, введите название события');
      return;
    }

    setIsSubmitting(true);

    try {
      const existingEvents = loadEvents();
      
      // Проверяем на дубликаты по названию
      const isDuplicate = existingEvents.some(event => 
        event.name.toLowerCase().trim() === eventName.toLowerCase().trim()
      );
      
      if (isDuplicate) {
        alert('Событие с таким названием уже существует');
        setIsSubmitting(false);
        return;
      }
      
      const newEvent = createEvent(eventName.trim());
      const updatedEvents = [...existingEvents, newEvent];
      saveEvents(updatedEvents);
      
      console.log('Создано событие:', newEvent.id, newEvent.name);
      console.log('Всего событий после создания:', updatedEvents.length);
      
      // Перенаправляем на страницу редактирования события
      router.push(`/events/${newEvent.id}`);
    } catch (error) {
      console.error('Ошибка создания события:', error);
      alert('Произошла ошибка при создании события');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Создайте событие
          </h1>
          <p className="text-gray-600">
            Начните с названия события. Партнеров и команды можно будет добавить на следующем этапе.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="eventName" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Название события <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventName"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="Например: Определение последовательности 1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
              maxLength={100}
            />
            <div className="mt-1 text-sm text-gray-500">
              {eventName.length}/100 символов
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Что дальше?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Добавите список партнеров</li>
              <li>• Создадите команды с привязкой к партнерам</li>
              <li>• Укажете названия кейсов (опционально)</li>
              <li>• Проведете жеребьевку</li>
            </ul>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Отменить
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !eventName.trim()}
            >
              {isSubmitting ? 'Создание...' : 'Создать событие'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

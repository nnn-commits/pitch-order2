'use client';

import Link from 'next/link';
import { Event } from '@/types';
import { TrashIcon } from './TrashIcon';

interface EventCardProps {
  event: Event;
  onSelect: (eventId: string) => void;
  onDelete: (eventId: string) => void;
}

export function EventCard({ event, onSelect, onDelete }: EventCardProps) {
  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить событие "${event.name}"?`)) {
      onDelete(event.id);
    }
  };

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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {event.name}
        </h3>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Удалить событие"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">Команд:</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {event.teams.length}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium mr-2">Кейсов:</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            {event.teams.filter(team => team.caseName).length}
          </span>
        </div>

        <div className="text-sm text-gray-600">
          <span className="font-medium">Партнеры:</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {event.partners.length > 0 ? (
              event.partners.slice(0, 3).map((partner) => (
                <span 
                  key={partner.id}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {partner.name}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">Партнеры не добавлены</span>
            )}
            {event.partners.length > 3 && (
              <span className="text-gray-400 text-xs px-2 py-1">
                +{event.partners.length - 3}
              </span>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500">
          Создано: {formatDate(event.createdAt)}
        </div>
      </div>

      <div className="flex space-x-2">
        <Link
          href={`/events/${event.id}`}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors text-center text-sm font-medium"
        >
          Редактировать
        </Link>
        <Link
          href={`/lottery/${event.id}`}
          onClick={() => onSelect(event.id)}
          className="flex-1 text-white px-4 py-2 rounded hover:opacity-90 transition-colors text-center text-sm font-medium"
          style={{ backgroundColor: '#3B9BFF' }}
        >
          Жеребьевка
        </Link>
      </div>
    </div>
  );
}
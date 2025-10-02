'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WarningIcon } from '@/components/Icons';
import { Event, Partner, Team, LotteryValidationResult } from '@/types';
import { loadEvents, saveEvents, createPartner, createTeam } from '@/lib/storage';
import { validateLotteryFeasibility } from '@/lib/lottery';
import { PartnersSection } from '@/components/PartnersSection';
import { TeamsSection } from '@/components/TeamsSection';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'partners' | 'teams'>('info');
  const [lotteryValidation, setLotteryValidation] = useState<LotteryValidationResult | null>(null);

  useEffect(() => {
    const events = loadEvents();
    const foundEvent = events.find(e => e.id === eventId);
    
    if (!foundEvent) {
      router.push('/');
      return;
    }
    
    setEvent(foundEvent);
    
    // Проверяем возможность проведения жеребьевки
    const validation = validateLotteryFeasibility(foundEvent.teams, foundEvent.partners);
    setLotteryValidation(validation);
    
    setLoading(false);
  }, [eventId, router]);

  const saveEvent = (updatedEvent: Event) => {
    const events = loadEvents();
    const updatedEvents = events.map(e => 
      e.id === updatedEvent.id ? { ...updatedEvent, updatedAt: new Date() } : e
    );
    saveEvents(updatedEvents);
    setEvent({ ...updatedEvent, updatedAt: new Date() });
    
    // Обновляем проверку валидности жеребьевки
    const validation = validateLotteryFeasibility(updatedEvent.teams, updatedEvent.partners);
    setLotteryValidation(validation);
  };

  const handleAddPartner = (name: string) => {
    if (!event) return;
    
    const newPartner = createPartner(name);
    const updatedEvent = {
      ...event,
      partners: [...event.partners, newPartner]
    };
    saveEvent(updatedEvent);
  };

  const handleDeletePartner = (partnerId: string) => {
    if (!event) return;
    
    const updatedEvent = {
      ...event,
      partners: event.partners.filter(p => p.id !== partnerId),
      teams: event.teams.filter(t => t.partnerId !== partnerId)
    };
    saveEvent(updatedEvent);
  };

  const handleAddTeam = (name: string, partnerId: string, caseName?: string) => {
    if (!event) return;
    
    const newTeam = createTeam(name, partnerId, caseName);
    const updatedEvent = {
      ...event,
      teams: [...event.teams, newTeam]
    };
    saveEvent(updatedEvent);
  };

  const handleDeleteTeam = (teamId: string) => {
    if (!event) return;
    
    const updatedEvent = {
      ...event,
      teams: event.teams.filter(t => t.id !== teamId)
    };
    saveEvent(updatedEvent);
  };

  const handleEditTeam = (teamId: string, updates: Partial<Team>) => {
    if (!event) return;
    
    const updatedEvent = {
      ...event,
      teams: event.teams.map(t => 
        t.id === teamId ? { ...t, ...updates } : t
      )
    };
    saveEvent(updatedEvent);
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Событие не найдено</h1>
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

  const tabs = [
    { id: 'info' as const, label: 'Основная информация' },
    { id: 'partners' as const, label: `Партнеры (${event.partners.length})` },
    { id: 'teams' as const, label: `Команды (${event.teams.length})` },
  ];

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
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {event.name}
          </h1>
          <p className="text-gray-600">
            Создано: {formatDate(event.createdAt)}
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Назад к событиям
          </button>
          <button
            onClick={() => router.push(`/lottery/${event.id}`)}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              lotteryValidation?.canGenerate 
                ? 'text-white hover:opacity-90' 
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
            style={{
              backgroundColor: lotteryValidation?.canGenerate ? '#3B9BFF' : undefined
            }}
            disabled={!lotteryValidation?.canGenerate}
            title={!lotteryValidation?.canGenerate ? 'Невозможно провести жеребьевку без нарушений' : ''}
          >
            <span>Жеребьевка</span>
          </button>
        </div>
      </div>

      {/* Предупреждение о невозможности жеребьевки */}
      {lotteryValidation && !lotteryValidation.canGenerate && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <WarningIcon className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="font-medium text-red-800 mb-2">
                Невозможно провести жеребьевку без нарушений
              </h3>
              <ul className="text-sm text-red-700 space-y-1">
                {lotteryValidation.violations.map((violation, index) => (
                  <li key={index}>• {violation}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Табы */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Контент табов */}
      <div className="bg-white rounded-lg shadow-sm">
        {activeTab === 'info' && (
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Основная информация
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {event.teams.length}
                </div>
                <div className="text-sm text-blue-700 font-medium">
                  Команд добавлено
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {event.partners.length}
                </div>
                <div className="text-sm text-green-700 font-medium">
                  Партнеров
                </div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  {event.teams.filter(team => team.caseName).length}
                </div>
                <div className="text-sm text-purple-700 font-medium">
                  Кейсов указано
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Следующие шаги:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                {event.partners.length === 0 && (
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>Добавьте партнеров во вкладке &quot;Партнеры&quot;</span>
                  </li>
                )}
                {event.teams.length === 0 && event.partners.length > 0 && (
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span>Добавьте команды во вкладке &quot;Команды&quot;</span>
                  </li>
                )}
                {lotteryValidation?.canGenerate && event.teams.length > 0 && (
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Готово к проведению жеребьевки!</span>
                  </li>
                )}
                {lotteryValidation && !lotteryValidation.canGenerate && event.teams.length > 0 && (
                  <li className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span>Невозможно провести жеребьевку без нарушений</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <PartnersSection
            partners={event.partners}
            onAddPartner={handleAddPartner}
            onDeletePartner={handleDeletePartner}
          />
        )}

        {activeTab === 'teams' && (
          <TeamsSection
            teams={event.teams}
            partners={event.partners}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
            onEditTeam={handleEditTeam}
          />
        )}
      </div>
    </div>
  );
}
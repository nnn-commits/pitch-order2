// Локальное хранилище данных (без бэкенда)
import { Event, Partner, Team, LotteryResult } from '@/types';

const STORAGE_KEYS = {
  EVENTS: 'pitchorder_events',
  CURRENT_EVENT: 'pitchorder_current_event',
  LOTTERY_RESULTS: 'pitchorder_lottery_results'
} as const;

// События
export const saveEvents = (events: Event[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  }
};

export const loadEvents = (): Event[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Event[];
        return parsed.map((event) => ({
          ...event,
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
          partners: event.partners?.map((p) => ({
            ...p,
            createdAt: new Date(p.createdAt)
          })) || [],
          teams: event.teams?.map((t) => ({
            ...t,
            createdAt: new Date(t.createdAt)
          })) || []
        }));
      } catch (error) {
        console.error('Ошибка загрузки событий:', error);
      }
    }
  }
  return [];
};

export const saveCurrentEventId = (eventId: string | null): void => {
  if (typeof window !== 'undefined') {
    if (eventId) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_EVENT, eventId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_EVENT);
    }
  }
};

export const loadCurrentEventId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_EVENT);
  }
  return null;
};

// Результаты жеребьевок
export const saveLotteryResults = (results: LotteryResult[]): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.LOTTERY_RESULTS, JSON.stringify(results));
  }
};

export const loadLotteryResults = (): LotteryResult[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEYS.LOTTERY_RESULTS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LotteryResult[];
        return parsed.map((result) => ({
          ...result,
          createdAt: new Date(result.createdAt),
          sequence: result.sequence?.map((team) => ({
            ...team,
            createdAt: new Date(team.createdAt)
          })) || []
        }));
      } catch (error) {
        console.error('Ошибка загрузки результатов жеребьевки:', error);
      }
    }
  }
  return [];
};

// Утилиты для работы с данными
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const createEvent = (name: string): Event => {
  const now = new Date();
  return {
    id: generateId(),
    name,
    partners: [],
    teams: [],
    createdAt: now,
    updatedAt: now
  };
};

export const createPartner = (name: string): Partner => {
  return {
    id: generateId(),
    name,
    createdAt: new Date()
  };
};

export const createTeam = (name: string, partnerId: string, caseName?: string): Team => {
  return {
    id: generateId(),
    name,
    partnerId,
    caseName,
    createdAt: new Date()
  };
};
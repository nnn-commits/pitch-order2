// Базовые типы для системы жеребьевки

export interface Partner {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  partnerId: string;
  caseName?: string; // опциональное название кейса
  createdAt: Date;
}

export interface Event {
  id: string;
  name: string;
  partners: Partner[];
  teams: Team[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LotteryResult {
  id: string;
  eventId: string;
  sequence: Team[];
  createdAt: Date;
  isValid: boolean; // проверка, что нет соседних команд с одинаковыми партнерами
  violations?: LotteryViolation[]; // нарушения ограничений
}

export interface LotteryViolation {
  position: number;
  teamId: string;
  partnerId: string;
  message: string;
}

export interface LotteryValidationResult {
  isValid: boolean;
  canGenerate: boolean;
  violations: string[];
  maxPartnerCount: number;
  totalTeams: number;
}

// Вспомогательные типы для UI
export interface TeamWithPartner extends Team {
  partner: Partner;
}

export interface PartnerGroup {
  partner: Partner;
  teams: Team[];
  count: number;
}

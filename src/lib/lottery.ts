// Алгоритм жеребьевки с ограничениями
import { Team, Partner, LotteryResult, LotteryValidationResult, LotteryViolation } from '@/types';
import { generateId } from './storage';

/**
 * Проверяет возможность проведения жеребьевки
 * Правило: максимальное количество команд одного партнера не должно превышать ceil(N/2)
 */
export const validateLotteryFeasibility = (
  teams: Team[], 
  partners: Partner[]
): LotteryValidationResult => {
  if (teams.length === 0) {
    return {
      isValid: false,
      canGenerate: false,
      violations: ['Нет команд для жеребьевки'],
      maxPartnerCount: 0,
      totalTeams: 0
    };
  }

  // Группируем команды по партнерам
  const partnerCounts = new Map<string, number>();
  teams.forEach(team => {
    const count = partnerCounts.get(team.partnerId) || 0;
    partnerCounts.set(team.partnerId, count + 1);
  });

  const totalTeams = teams.length;
  const maxAllowedPerPartner = Math.ceil(totalTeams / 2);
  const violations: string[] = [];
  let maxPartnerCount = 0;

  partnerCounts.forEach((count, partnerId) => {
    maxPartnerCount = Math.max(maxPartnerCount, count);
    
    if (count > maxAllowedPerPartner) {
      const partner = partners.find(p => p.id === partnerId);
      const partnerName = partner ? partner.name : `Партнер ${partnerId}`;
      violations.push(
        `Невозможно построить порядок: у партнёра "${partnerName}" слишком много команд (${count} из ${totalTeams}). Максимально допустимо: ${maxAllowedPerPartner}.`
      );
    }
  });

  const canGenerate = violations.length === 0;

  return {
    isValid: canGenerate,
    canGenerate,
    violations,
    maxPartnerCount,
    totalTeams
  };
};

/**
 * Генерирует случайную последовательность команд с ограничением на соседних партнеров
 * Использует алгоритм "размещение с ограничениями"
 */
export const generateLotterySequence = (
  teams: Team[],
  partners: Partner[]
): Team[] => {
  if (teams.length === 0) return [];
  if (teams.length === 1) return [...teams];

  // Проверяем возможность генерации
  const validation = validateLotteryFeasibility(teams, partners);
  if (!validation.canGenerate) {
    throw new Error(validation.violations.join('\n'));
  }

  // Группируем команды по партнерам
  const partnerGroups = new Map<string, Team[]>();
  teams.forEach(team => {
    if (!partnerGroups.has(team.partnerId)) {
      partnerGroups.set(team.partnerId, []);
    }
    partnerGroups.get(team.partnerId)!.push(team);
  });

  // Сортируем группы по размеру (убывание)
  const sortedGroups = Array.from(partnerGroups.entries())
    .map(([partnerId, groupTeams]) => ({
      partnerId,
      teams: shuffleArray([...groupTeams])
    }))
    .sort((a, b) => b.teams.length - a.teams.length);

  const result: Team[] = [];
  const remainingTeams = new Map(sortedGroups.map(g => [g.partnerId, [...g.teams]]));

  // Алгоритм размещения
  while (result.length < teams.length) {
    const lastPartner = result.length > 0 ? result[result.length - 1].partnerId : null;
    
    // Находим партнера с максимальным количеством оставшихся команд,
    // но не того же, что и последний размещенный
    let bestPartner: string | null = null;
    let maxCount = 0;

    for (const [partnerId, partnerTeams] of remainingTeams) {
      if (partnerTeams.length > 0 && partnerId !== lastPartner) {
        if (partnerTeams.length > maxCount) {
          maxCount = partnerTeams.length;
          bestPartner = partnerId;
        }
      }
    }

    // Если не нашли подходящего партнера (все оставшиеся команды от последнего партнера)
    if (!bestPartner) {
      // Ищем любого партнера с командами
      for (const [partnerId, partnerTeams] of remainingTeams) {
        if (partnerTeams.length > 0) {
          bestPartner = partnerId;
          break;
        }
      }
    }

    if (!bestPartner) break; // Больше нет команд

    // Берем случайную команду от выбранного партнера
    const partnerTeams = remainingTeams.get(bestPartner)!;
    const teamIndex = Math.floor(Math.random() * partnerTeams.length);
    const selectedTeam = partnerTeams.splice(teamIndex, 1)[0];
    
    result.push(selectedTeam);

    // Удаляем пустые группы
    if (partnerTeams.length === 0) {
      remainingTeams.delete(bestPartner);
    }
  }

  return result;
};

/**
 * Проверяет последовательность на нарушения (соседние команды одного партнера)
 */
export const validateSequence = (sequence: Team[]): LotteryViolation[] => {
  const violations: LotteryViolation[] = [];

  for (let i = 1; i < sequence.length; i++) {
    const currentTeam = sequence[i];
    const previousTeam = sequence[i - 1];

    if (currentTeam.partnerId === previousTeam.partnerId) {
      violations.push({
        position: i,
        teamId: currentTeam.id,
        partnerId: currentTeam.partnerId,
        message: `Команда "${currentTeam.name}" стоит после команды "${previousTeam.name}" того же партнера`
      });
    }
  }

  return violations;
};

/**
 * Создает результат жеребьевки
 */
export const createLotteryResult = (
  eventId: string,
  sequence: Team[]
): LotteryResult => {
  const violations = validateSequence(sequence);
  
  return {
    id: generateId(),
    eventId,
    sequence,
    createdAt: new Date(),
    isValid: violations.length === 0,
    violations: violations.length > 0 ? violations : undefined
  };
};

/**
 * Перемешивает массив (алгоритм Фишера-Йетса)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

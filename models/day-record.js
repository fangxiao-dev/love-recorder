const FLOW_LEVELS = ['light', 'medium', 'heavy'];
const PAIN_LEVELS = ['none', 'mild', 'moderate', 'severe'];
const COLOR_LEVELS = ['normal', 'dark', 'bright'];
const BLEEDING_STATES = ['period', 'special'];

function createDayRecord(input) {
  return {
    id: input.id,
    moduleInstanceId: input.moduleInstanceId,
    recordDate: input.recordDate,
    bleedingState: input.bleedingState || 'period',
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    colorLevel: input.colorLevel || null,
    notes: input.notes || '',
    source: input.source || 'owner',
    lastEditedByUserId: input.lastEditedByUserId || input.createdByUserId,
    createdByUserId: input.createdByUserId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

function resolveBleedingState(record) {
  if (!record) {
    return 'none';
  }

  if (record.bleedingState === 'spotting') {
    return 'special';
  }

  return record.bleedingState || 'period';
}

function deriveCycleGroups(moduleInstanceId, records) {
  const sorted = [...records]
    .filter((record) => resolveBleedingState(record) === 'period')
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));

  if (!sorted.length) {
    return [];
  }

  const groups = [];
  let current = {
    moduleInstanceId,
    cycleStartDate: sorted[0].recordDate,
    cycleEndDate: sorted[0].recordDate,
    days: [sorted[0]],
  };

  for (let index = 1; index < sorted.length; index += 1) {
    const item = sorted[index];
    const previous = current.days[current.days.length - 1];
    const previousDate = new Date(`${previous.recordDate}T00:00:00Z`);
    const nextDate = new Date(previousDate.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    if (item.recordDate === nextDate) {
      current.cycleEndDate = item.recordDate;
      current.days.push(item);
      continue;
    }

    groups.push(toCycleSummary(current));
    current = {
      moduleInstanceId,
      cycleStartDate: item.recordDate,
      cycleEndDate: item.recordDate,
      days: [item],
    };
  }

  groups.push(toCycleSummary(current));
  return groups;
}

function toCycleSummary(group) {
  const days = [...group.days].sort((left, right) => left.recordDate.localeCompare(right.recordDate));
  return {
    cycleId: `${group.moduleInstanceId}:${group.cycleStartDate}`,
    moduleInstanceId: group.moduleInstanceId,
    cycleStartDate: group.cycleStartDate,
    cycleEndDate: group.cycleEndDate,
    dayCount: days.length,
    days,
    latestUpdatedAt: days[days.length - 1].updatedAt || null,
  };
}

module.exports = {
  BLEEDING_STATES,
  FLOW_LEVELS,
  PAIN_LEVELS,
  COLOR_LEVELS,
  createDayRecord,
  deriveCycleGroups,
  resolveBleedingState,
};

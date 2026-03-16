const { FLOW_LEVELS, PAIN_LEVELS } = require('../models/cycle-record');
const { seedCollections } = require('../mock/seed-data');
const { STORAGE_KEYS, get, set, loadSeedData } = require('./storage');
const { DAY_IN_MS, diffDays, formatDate, parseDateString } = require('../utils/date');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function ensureSeeded() {
  const hasRecords = get(STORAGE_KEYS.CYCLE_RECORDS);
  const hasModules = get(STORAGE_KEYS.MODULE_INSTANCES);

  if (!hasRecords || !hasModules) {
    loadSeedData(seedCollections);
  }
}

function getAllCycleRecords() {
  ensureSeeded();
  const records = get(STORAGE_KEYS.CYCLE_RECORDS) || [];
  const migrated = migrateLegacyRecords(records);
  if (migrated.changed) {
    saveAllCycleRecords(migrated.records);
  }
  return migrated.records;
}

function saveAllCycleRecords(records) {
  set(STORAGE_KEYS.CYCLE_RECORDS, records);
  return records;
}

function listCycleRecordsByModule(moduleInstanceId) {
  return getAllCycleRecords()
    .filter((record) => record.moduleInstanceId === moduleInstanceId)
    .sort((left, right) => {
      const rightDate = right.recordDate || '';
      const leftDate = left.recordDate || '';
      return rightDate.localeCompare(leftDate);
    });
}

function getCycleGroupsByModule(moduleInstanceId) {
  const records = listCycleRecordsByModule(moduleInstanceId)
    .filter((record) => record.recordDate)
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));

  if (!records.length) {
    return [];
  }

  const groups = [];
  let current = {
    moduleInstanceId,
    cycleStartDate: records[0].recordDate,
    cycleEndDate: records[0].recordDate,
    days: [records[0]],
  };

  for (let index = 1; index < records.length; index += 1) {
    const item = records[index];
    const gap = diffDays(current.cycleEndDate, item.recordDate);
    if (gap <= 1) {
      current.days.push(item);
      current.cycleEndDate = item.recordDate;
    } else {
      groups.push(toCycleSummary(current));
      current = {
        moduleInstanceId,
        cycleStartDate: item.recordDate,
        cycleEndDate: item.recordDate,
        days: [item],
      };
    }
  }

  groups.push(toCycleSummary(current));
  return groups.sort((left, right) => right.cycleStartDate.localeCompare(left.cycleStartDate));
}

function listCycleDays(moduleInstanceId, cycleId) {
  const group = getCycleGroupsByModule(moduleInstanceId).find((item) => item.cycleId === cycleId);
  if (!group) {
    return [];
  }

  return listCycleRecordsByModule(moduleInstanceId)
    .filter((record) => record.recordDate >= group.cycleStartDate && record.recordDate <= group.cycleEndDate)
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));
}

function toCycleSummary(group) {
  const days = group.days.sort((left, right) => left.recordDate.localeCompare(right.recordDate));
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

function migrateLegacyRecords(records) {
  let changed = false;
  const normalized = records.flatMap((record) => {
    if (record.recordDate) {
      return [record];
    }

    if (record.startDate) {
      changed = true;
      if (record.endDate && record.endDate >= record.startDate) {
        return expandLegacyCycleRecord(record);
      }

      return [{
        ...record,
        recordDate: record.startDate,
      }];
    }

    return [record];
  });

  return {
    changed,
    records: normalized,
  };
}

function expandLegacyCycleRecord(record) {
  const total = diffDays(record.startDate, record.endDate);
  const expanded = [];
  for (let index = 0; index <= total; index += 1) {
    const date = formatDate(new Date(parseDateString(record.startDate).getTime() + index * DAY_IN_MS));
    expanded.push({
      ...record,
      id: `${record.id}-d${index + 1}`,
      recordDate: date,
    });
  }
  return expanded;
}

function getCycleRecordById(recordId) {
  const record = getAllCycleRecords().find((item) => item.id === recordId);
  return record || null;
}

function validateRecordPatch(patch) {
  if (!patch.recordDate || typeof patch.recordDate !== 'string') {
    throw new ValidationError('记录日期不能为空');
  }

  if (patch.flowLevel && !FLOW_LEVELS.includes(patch.flowLevel)) {
    throw new ValidationError('流量等级无效');
  }

  if (patch.painLevel && !PAIN_LEVELS.includes(patch.painLevel)) {
    throw new ValidationError('疼痛等级无效');
  }
}

function updateCycleRecord(recordId, patch, editorUserId) {
  const records = getAllCycleRecords();
  const recordIndex = records.findIndex((record) => record.id === recordId);

  if (recordIndex < 0) {
    throw new ValidationError('记录不存在');
  }

  const merged = {
    ...records[recordIndex],
    ...patch,
  };

  validateRecordPatch(merged);

  const now = new Date().toISOString();
  const updatedRecord = {
    ...merged,
    notes: merged.notes || '',
    updatedAt: now,
    lastEditedByUserId: editorUserId || merged.lastEditedByUserId,
  };

  const nextRecords = [...records];
  nextRecords[recordIndex] = updatedRecord;
  saveAllCycleRecords(nextRecords);
  return updatedRecord;
}

module.exports = {
  ValidationError,
  getCycleGroupsByModule,
  getCycleRecordById,
  listCycleDays,
  listCycleRecordsByModule,
  updateCycleRecord,
  validateRecordPatch,
};

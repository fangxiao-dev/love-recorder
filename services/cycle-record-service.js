const { FLOW_LEVELS, PAIN_LEVELS } = require('../models/cycle-record');
const { seedCollections } = require('../mock/seed-data');
const { STORAGE_KEYS, get, set, loadSeedData } = require('./storage');
const { DAY_IN_MS, diffDays, formatDate, parseDateString } = require('../utils/date');
const DEFAULT_MENSTRUAL_DAYS = 7;

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

function createRecordId(moduleInstanceId, recordDate) {
  return `${moduleInstanceId}-${recordDate}`;
}

function buildRecord(moduleInstanceId, recordDate, editorUserId) {
  const now = new Date().toISOString();
  return {
    id: createRecordId(moduleInstanceId, recordDate),
    moduleInstanceId,
    recordDate,
    flowLevel: null,
    painLevel: null,
    notes: '',
    source: 'owner',
    createdByUserId: editorUserId,
    lastEditedByUserId: editorUserId,
    createdAt: now,
    updatedAt: now,
  };
}

function saveNewRecords(recordsToCreate) {
  if (!recordsToCreate.length) {
    return [];
  }

  const allRecords = getAllCycleRecords();
  const existingKeys = new Set(allRecords.map((item) => `${item.moduleInstanceId}:${item.recordDate}`));
  const deduped = recordsToCreate.filter(
    (item) => !existingKeys.has(`${item.moduleInstanceId}:${item.recordDate}`)
  );

  if (!deduped.length) {
    return [];
  }

  saveAllCycleRecords([...allRecords, ...deduped]);
  return deduped;
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

function validateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new ValidationError('开始和结束日期不能为空');
  }

  if (endDate < startDate) {
    throw new ValidationError('结束日期不能早于开始日期');
  }
}

function validateNotFuture(dateString, today) {
  if (today && dateString > today) {
    throw new ValidationError('暂不支持记录未来日期');
  }
}

function createCycleRangeRecord(moduleInstanceId, startDate, endDate, editorUserId) {
  const options = arguments[4] || {};
  validateRange(startDate, endDate);
  validateNotFuture(startDate, options.today);
  validateNotFuture(endDate, options.today);

  const totalDays = diffDays(startDate, endDate);
  const toCreate = [];
  for (let index = 0; index <= totalDays; index += 1) {
    const recordDate = formatDate(new Date(parseDateString(startDate).getTime() + index * DAY_IN_MS));
    toCreate.push(buildRecord(moduleInstanceId, recordDate, editorUserId));
  }

  const createdRecords = saveNewRecords(toCreate);
  return {
    moduleInstanceId,
    startDate,
    endDate,
    createdDates: createdRecords.map((item) => item.recordDate).sort(),
  };
}

function markCycleStart(moduleInstanceId, recordDate, editorUserId) {
  const options = arguments[3] || {};
  validateRange(recordDate, recordDate);
  validateNotFuture(recordDate, options.today);
  const createdRecords = saveNewRecords([
    buildRecord(moduleInstanceId, recordDate, editorUserId),
  ]);

  return createdRecords[0] || listCycleRecordsByModule(moduleInstanceId).find((item) => item.recordDate === recordDate);
}

function findActiveCycleStart(moduleInstanceId, endDate, defaultMenstrualDays) {
  const groups = getCycleGroupsByModule(moduleInstanceId)
    .filter((item) => item.cycleStartDate <= endDate)
    .sort((left, right) => right.cycleStartDate.localeCompare(left.cycleStartDate));
  const latest = groups[0];
  if (!latest) {
    return null;
  }

  if (diffDays(latest.cycleStartDate, endDate) > defaultMenstrualDays - 1) {
    return null;
  }

  return latest.cycleStartDate;
}

function markCycleEnd(moduleInstanceId, endDate, editorUserId, options) {
  const defaultMenstrualDays = options && options.defaultMenstrualDays
    ? options.defaultMenstrualDays
    : DEFAULT_MENSTRUAL_DAYS;
  const cycleStartDate = findActiveCycleStart(moduleInstanceId, endDate, defaultMenstrualDays);

  if (!cycleStartDate) {
    throw new ValidationError('没有可结束的进行中周期');
  }

  createCycleRangeRecord(moduleInstanceId, cycleStartDate, endDate, editorUserId);

  return getCycleGroupsByModule(moduleInstanceId).find(
    (item) => item.cycleStartDate === cycleStartDate
  );
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
  DEFAULT_MENSTRUAL_DAYS,
  ValidationError,
  createCycleRangeRecord,
  getCycleGroupsByModule,
  getCycleRecordById,
  listCycleDays,
  listCycleRecordsByModule,
  markCycleEnd,
  markCycleStart,
  updateCycleRecord,
  validateRecordPatch,
};

const {
  BLEEDING_STATES,
  FLOW_LEVELS,
  PAIN_LEVELS,
  COLOR_LEVELS,
  createDayRecord,
  deriveCycleGroups,
  resolveBleedingState,
} = require('../models/day-record');
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
  const hasRecords = get(STORAGE_KEYS.DAY_RECORDS);
  const hasModules = get(STORAGE_KEYS.MODULE_INSTANCES);

  if (!hasRecords || !hasModules) {
    loadSeedData(seedCollections);
  }
}

function getAllCycleRecords() {
  ensureSeeded();
  const records = get(STORAGE_KEYS.DAY_RECORDS) || [];
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
  return createDayRecord({
    id: createRecordId(moduleInstanceId, recordDate),
    moduleInstanceId,
    recordDate,
    bleedingState: 'period',
    flowLevel: null,
    painLevel: null,
    colorLevel: null,
    notes: '',
    source: 'owner',
    createdByUserId: editorUserId,
    lastEditedByUserId: editorUserId,
    createdAt: now,
    updatedAt: now,
  });
}

function saveChangedRecords(recordsToSave) {
  const allRecords = getAllCycleRecords();
  const recordMap = new Map(allRecords.map((item) => [`${item.moduleInstanceId}:${item.recordDate}`, item]));
  recordsToSave.forEach((item) => {
    recordMap.set(`${item.moduleInstanceId}:${item.recordDate}`, item);
  });
  const merged = [...recordMap.values()].sort((left, right) => {
    const leftKey = `${left.moduleInstanceId}:${left.recordDate}`;
    const rightKey = `${right.moduleInstanceId}:${right.recordDate}`;
    return leftKey.localeCompare(rightKey);
  });
  saveAllCycleRecords(merged);
  return recordsToSave;
}

function saveAllCycleRecords(records) {
  set(STORAGE_KEYS.DAY_RECORDS, records);
  return records;
}

function buildRecordId(moduleInstanceId, recordDate) {
  return `${moduleInstanceId}:${recordDate}`;
}

function createRecord(input) {
  const now = new Date().toISOString();
  return createDayRecord({
    id: input.id || buildRecordId(input.moduleInstanceId, input.recordDate),
    moduleInstanceId: input.moduleInstanceId,
    recordDate: input.recordDate,
    bleedingState: input.bleedingState || 'period',
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    colorLevel: input.colorLevel || null,
    notes: input.notes || '',
    source: input.source || 'owner',
    createdByUserId: input.createdByUserId,
    lastEditedByUserId: input.lastEditedByUserId || input.createdByUserId,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  });
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
  return deriveCycleGroups(
    moduleInstanceId,
    listCycleRecordsByModule(moduleInstanceId)
  ).sort((left, right) => right.cycleStartDate.localeCompare(left.cycleStartDate));
}

function listCycleDays(moduleInstanceId, cycleId) {
  const group = getCycleGroupsByModule(moduleInstanceId).find((item) => item.cycleId === cycleId);
  return group ? [...group.days].sort((left, right) => left.recordDate.localeCompare(right.recordDate)) : [];
}

function migrateLegacyRecords(records) {
  let changed = false;
  const normalized = records.flatMap((record) => {
    if (record.recordDate && record.bleedingState) {
      if (record.bleedingState === 'spotting') {
        changed = true;
        return [createRecord({
          ...record,
          bleedingState: 'special',
        })];
      }
      return [record];
    }

    if (record.startDate) {
      changed = true;
      if (record.endDate && record.endDate >= record.startDate) {
        return expandLegacyCycleRecord(record);
      }

      return [createRecord({
        ...record,
        recordDate: record.startDate,
        bleedingState: 'period',
      })];
    }

    if (record.recordDate) {
      changed = true;
      return [createRecord({
        ...record,
        bleedingState: resolveBleedingState(record),
      })];
    }

    return [];
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
    expanded.push(createRecord({
      ...record,
      id: `${record.id}-d${index + 1}`,
      recordDate: date,
      bleedingState: 'period',
    }));
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
  const records = getAllCycleRecords();
  const recordMap = new Map(records.map((item) => [`${item.moduleInstanceId}:${item.recordDate}`, item]));
  const changedDates = [];
  const toSave = [];
  for (let index = 0; index <= totalDays; index += 1) {
    const recordDate = formatDate(new Date(parseDateString(startDate).getTime() + index * DAY_IN_MS));
    const key = `${moduleInstanceId}:${recordDate}`;
    const existing = recordMap.get(key);
    const next = createRecord({
      ...(existing || {}),
      id: existing ? existing.id : createRecordId(moduleInstanceId, recordDate),
      moduleInstanceId,
      recordDate,
      bleedingState: 'period',
      createdByUserId: existing ? existing.createdByUserId : editorUserId,
      lastEditedByUserId: editorUserId,
    });
    const isChanged = !existing
      || existing.bleedingState !== next.bleedingState
      || existing.lastEditedByUserId !== next.lastEditedByUserId;
    if (isChanged) {
      changedDates.push(recordDate);
      toSave.push(next);
    }
  }

  const createdRecords = saveChangedRecords(toSave);
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
  createCycleRangeRecord(moduleInstanceId, recordDate, recordDate, editorUserId, options);
  return listCycleRecordsByModule(moduleInstanceId).find((item) => item.recordDate === recordDate);
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

  const latestGroup = getCycleGroupsByModule(moduleInstanceId).find(
    (item) => item.cycleStartDate === cycleStartDate
  );
  const fillStartDate = latestGroup && latestGroup.cycleEndDate > cycleStartDate
    ? formatDate(new Date(parseDateString(latestGroup.cycleEndDate).getTime() + DAY_IN_MS))
    : cycleStartDate;

  if (fillStartDate <= endDate) {
    createCycleRangeRecord(moduleInstanceId, fillStartDate, endDate, editorUserId, options);
  }

  return getCycleGroupsByModule(moduleInstanceId).find(
    (item) => item.cycleStartDate === cycleStartDate
  );
}

function getCycleRecordById(recordId) {
  const record = getAllCycleRecords().find((item) => item.id === recordId);
  return record || null;
}

function getCycleRecordByDate(moduleInstanceId, recordDate) {
  return getAllCycleRecords().find(
    (item) => item.moduleInstanceId === moduleInstanceId && item.recordDate === recordDate
  ) || null;
}

function saveDayRecord(moduleInstanceId, input) {
  const recordDate = input.recordDate;
  const existing = getCycleRecordByDate(moduleInstanceId, recordDate);
  const patch = {
    recordDate,
    bleedingState: input.bleedingState,
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    colorLevel: input.colorLevel || null,
    notes: input.notes || '',
  };

  validateRecordPatch(patch);

  if (existing) {
    return updateCycleRecord(existing.id, patch, input.editorUserId);
  }

  const records = getAllCycleRecords();
  const created = createRecord({
    moduleInstanceId,
    ...patch,
    createdByUserId: input.editorUserId,
    lastEditedByUserId: input.editorUserId,
  });
  saveAllCycleRecords([...records, created]);
  return created;
}

function clearDayRecord(moduleInstanceId, recordDate) {
  const records = getAllCycleRecords();
  const nextRecords = records.filter(
    (item) => !(item.moduleInstanceId === moduleInstanceId && item.recordDate === recordDate)
  );
  saveAllCycleRecords(nextRecords);
  return nextRecords.length !== records.length;
}

function saveNormalDayRecord(moduleInstanceId, input) {
  return saveDayRecord(moduleInstanceId, {
    recordDate: input.recordDate,
    bleedingState: 'period',
    flowLevel: 'medium',
    painLevel: 'none',
    colorLevel: 'normal',
    notes: input.notes || '',
    editorUserId: input.editorUserId,
  });
}

function validateRecordPatch(patch) {
  if (!patch.recordDate || typeof patch.recordDate !== 'string') {
    throw new ValidationError('记录日期不能为空');
  }

  if (patch.bleedingState && !BLEEDING_STATES.includes(patch.bleedingState)) {
    throw new ValidationError('月经状态无效');
  }

  if (patch.flowLevel && !FLOW_LEVELS.includes(patch.flowLevel)) {
    throw new ValidationError('流量等级无效');
  }

  if (patch.painLevel && !PAIN_LEVELS.includes(patch.painLevel)) {
    throw new ValidationError('疼痛等级无效');
  }

  if (patch.colorLevel && !COLOR_LEVELS.includes(patch.colorLevel)) {
    throw new ValidationError('颜色等级无效');
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
    bleedingState: merged.bleedingState || 'period',
    colorLevel: merged.colorLevel || null,
    notes: merged.notes || '',
    updatedAt: now,
    lastEditedByUserId: editorUserId || merged.lastEditedByUserId,
  };

  const nextRecords = [...records];
  nextRecords[recordIndex] = updatedRecord;
  saveAllCycleRecords(nextRecords);
  return updatedRecord;
}

function createCycleRange(moduleInstanceId, input) {
  const { startDate, endDate, editorUserId } = input;
  createCycleRangeRecord(moduleInstanceId, startDate, endDate, editorUserId, {
    today: input.today,
  });
  return listCycleRecordsByModule(moduleInstanceId)
    .filter((item) => item.recordDate >= startDate && item.recordDate <= endDate)
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));
}

function recordCycleStart(moduleInstanceId, input) {
  const today = input.today || formatDate(new Date());
  return saveDayRecord(moduleInstanceId, {
    recordDate: today,
    bleedingState: 'period',
    editorUserId: input.editorUserId,
  });
}

function recordCycleEnd(moduleInstanceId, input) {
  const today = input.today || formatDate(new Date());
  const defaultMenstrualDays = input.defaultMenstrualDays || DEFAULT_MENSTRUAL_DAYS;
  const latest = findActiveCycleStart(moduleInstanceId, today, defaultMenstrualDays);

  if (!latest) {
    throw new ValidationError('没有可结束的经期');
  }

  const latestGroup = getCycleGroupsByModule(moduleInstanceId).find(
    (item) => item.cycleStartDate === latest
  );
  const fillStartDate = latestGroup
    ? formatDate(new Date(parseDateString(latestGroup.cycleEndDate).getTime() + DAY_IN_MS))
    : today;

  if (fillStartDate > today) {
    return [];
  }

  return createCycleRange(moduleInstanceId, {
    startDate: fillStartDate,
    endDate: today,
    editorUserId: input.editorUserId,
    today,
  });
}

function saveCycleException(moduleInstanceId, input) {
  const recordDate = input.recordDate || input.today || formatDate(new Date());
  const existing = getCycleRecordByDate(moduleInstanceId, recordDate);
  const patch = {
    recordDate,
    bleedingState: input.bleedingState || (existing ? existing.bleedingState : 'period'),
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    colorLevel: input.colorLevel || null,
    notes: input.notes || '',
  };

  validateRecordPatch(patch);
  if (existing) {
    return updateCycleRecord(existing.id, patch, input.editorUserId);
  }
  return saveDayRecord(moduleInstanceId, {
    ...patch,
    editorUserId: input.editorUserId,
  });
}

module.exports = {
  DEFAULT_MENSTRUAL_DAYS,
  COLOR_LEVELS,
  ValidationError,
  clearDayRecord,
  createCycleRange,
  createCycleRangeRecord,
  getCycleGroupsByModule,
  getCycleRecordByDate,
  getCycleRecordById,
  listCycleDays,
  listCycleRecordsByModule,
  recordCycleEnd,
  recordCycleStart,
  saveDayRecord,
  saveNormalDayRecord,
  saveCycleException,
  markCycleEnd,
  markCycleStart,
  updateCycleRecord,
  validateRecordPatch,
};

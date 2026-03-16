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

function buildRecordId(moduleInstanceId, recordDate) {
  return `${moduleInstanceId}:${recordDate}`;
}

function createRecord(input) {
  const now = new Date().toISOString();
  return {
    id: input.id || buildRecordId(input.moduleInstanceId, input.recordDate),
    moduleInstanceId: input.moduleInstanceId,
    recordDate: input.recordDate,
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    notes: input.notes || '',
    source: input.source || 'owner',
    createdByUserId: input.createdByUserId,
    lastEditedByUserId: input.lastEditedByUserId || input.createdByUserId,
    createdAt: input.createdAt || now,
    updatedAt: input.updatedAt || now,
  };
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

function getCycleRecordByDate(moduleInstanceId, recordDate) {
  return getAllCycleRecords().find(
    (item) => item.moduleInstanceId === moduleInstanceId && item.recordDate === recordDate
  ) || null;
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

function createCycleRange(moduleInstanceId, input) {
  const { startDate, endDate, editorUserId } = input;
  if (!startDate || !endDate) {
    throw new ValidationError('开始和结束日期不能为空');
  }

  if (endDate < startDate) {
    throw new ValidationError('结束日期不能早于开始日期');
  }

  const records = getAllCycleRecords();
  const nextRecords = [...records];
  const created = [];
  const total = diffDays(startDate, endDate);

  for (let index = 0; index <= total; index += 1) {
    const recordDate = formatDate(new Date(parseDateString(startDate).getTime() + index * DAY_IN_MS));
    const existing = nextRecords.find(
      (item) => item.moduleInstanceId === moduleInstanceId && item.recordDate === recordDate
    );

    if (existing) {
      created.push(existing);
      continue;
    }

    const record = createRecord({
      moduleInstanceId,
      recordDate,
      createdByUserId: editorUserId,
      lastEditedByUserId: editorUserId,
    });
    nextRecords.push(record);
    created.push(record);
  }

  saveAllCycleRecords(nextRecords);
  return created;
}

function recordCycleStart(moduleInstanceId, input) {
  const today = input.today || formatDate(new Date());
  const existing = getCycleRecordByDate(moduleInstanceId, today);
  if (existing) {
    return existing;
  }

  const records = getAllCycleRecords();
  const record = createRecord({
    moduleInstanceId,
    recordDate: today,
    createdByUserId: input.editorUserId,
    lastEditedByUserId: input.editorUserId,
  });
  saveAllCycleRecords([...records, record]);
  return record;
}

function recordCycleEnd(moduleInstanceId, input) {
  const today = input.today || formatDate(new Date());
  const groups = getCycleGroupsByModule(moduleInstanceId)
    .sort((left, right) => right.cycleStartDate.localeCompare(left.cycleStartDate));
  const latest = groups[0];

  if (!latest) {
    throw new ValidationError('没有可结束的经期');
  }

  const startDate = formatDate(
    new Date(parseDateString(latest.cycleEndDate).getTime() + DAY_IN_MS)
  );

  if (startDate > today) {
    return [];
  }

  return createCycleRange(moduleInstanceId, {
    startDate,
    endDate: today,
    editorUserId: input.editorUserId,
  });
}

function saveCycleException(moduleInstanceId, input) {
  const recordDate = input.recordDate || input.today || formatDate(new Date());
  const patch = {
    recordDate,
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    notes: input.notes || '',
  };

  validateRecordPatch(patch);

  const existing = getCycleRecordByDate(moduleInstanceId, recordDate);
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

module.exports = {
  ValidationError,
  createCycleRange,
  getCycleGroupsByModule,
  getCycleRecordByDate,
  getCycleRecordById,
  listCycleDays,
  listCycleRecordsByModule,
  recordCycleEnd,
  recordCycleStart,
  saveCycleException,
  updateCycleRecord,
  validateRecordPatch,
};

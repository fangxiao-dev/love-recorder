const test = require('node:test');
const assert = require('node:assert/strict');

const { STORAGE_KEYS, remove } = require('../../services/storage');
const {
  createCycleRangeRecord,
  getCycleGroupsByModule,
  listCycleRecordsByModule,
  listCycleDays,
  markCycleEnd,
  markCycleStart,
  updateCycleRecord,
  ValidationError,
} = require('../../services/cycle-record-service');

test.beforeEach(() => {
  remove(STORAGE_KEYS.CYCLE_RECORDS);
  remove(STORAGE_KEYS.MODULE_INSTANCES);
});

test('listCycleRecordsByModule sorts by latest recordDate first', () => {
  remove(STORAGE_KEYS.CYCLE_RECORDS);
  remove(STORAGE_KEYS.MODULE_INSTANCES);

  const records = listCycleRecordsByModule('module-shared');

  assert.ok(records.length >= 2);
  assert.equal(records[0].recordDate >= records[1].recordDate, true);
});

test('updateCycleRecord rejects empty recordDate', () => {
  assert.throws(
    () => {
      updateCycleRecord('record-shared-001-d2', {
        recordDate: '',
      }, 'user-owner');
    },
    (error) => error instanceof ValidationError
  );
});

test('updateCycleRecord keeps record identity and updates editor', () => {
  const updated = updateCycleRecord(
    'record-shared-001-d2',
    {
      recordDate: '2026-03-23',
      flowLevel: 'heavy',
      painLevel: 'moderate',
      notes: '',
    },
    'user-partner'
  );

  assert.equal(updated.id, 'record-shared-001-d2');
  assert.equal(updated.lastEditedByUserId, 'user-partner');
  assert.equal(updated.flowLevel, 'heavy');
  assert.equal(updated.notes, '');
});

test('listCycleRecordsByModule returns empty array when module has no records', () => {
  const records = listCycleRecordsByModule('module-not-exists');
  assert.deepEqual(records, []);
});

test('updateCycleRecord rejects invalid enum values', () => {
  assert.throws(
    () => {
      updateCycleRecord('record-shared-001-d2', {
        recordDate: '2026-03-24',
        flowLevel: 'extreme',
      }, 'user-owner');
    },
    (error) => error instanceof ValidationError
  );
});

test('updateCycleRecord rejects unknown record id', () => {
  assert.throws(
    () => {
      updateCycleRecord('record-unknown', {
        recordDate: '2026-02-20',
      }, 'user-owner');
    },
    (error) => error instanceof ValidationError
  );
});

test('getCycleGroupsByModule groups contiguous days into one cycle', () => {
  const groups = getCycleGroupsByModule('module-shared');
  assert.ok(groups.length >= 1);
  assert.equal(groups[0].cycleStartDate <= groups[0].cycleEndDate, true);
  assert.ok(groups[0].dayCount >= 1);
});

test('listCycleDays returns daily entries inside selected cycle', () => {
  const groups = getCycleGroupsByModule('module-shared');
  const first = groups[0];
  const days = listCycleDays('module-shared', first.cycleId);
  assert.equal(days.length, first.dayCount);
  assert.equal(days[0].recordDate <= days[days.length - 1].recordDate, true);
});

test('markCycleStart creates a new record for the selected day', () => {
  const created = markCycleStart('module-private-active', '2026-03-16', 'user-owner');

  assert.equal(created.recordDate, '2026-03-16');
  assert.equal(created.moduleInstanceId, 'module-private-active');

  const records = listCycleRecordsByModule('module-private-active');
  assert.equal(records.some((item) => item.recordDate === '2026-03-16'), true);
});

test('markCycleEnd fills the active cycle through the selected end day', () => {
  markCycleStart('module-private-active', '2026-03-14', 'user-owner');

  const result = markCycleEnd('module-private-active', '2026-03-18', 'user-owner', {
    today: '2026-03-18',
    defaultMenstrualDays: 7,
  });

  assert.equal(result.cycleStartDate, '2026-03-14');
  assert.equal(result.cycleEndDate, '2026-03-18');

  const cycleDates = listCycleRecordsByModule('module-private-active')
    .filter((item) => item.recordDate >= '2026-03-14' && item.recordDate <= '2026-03-18')
    .map((item) => item.recordDate)
    .sort();

  assert.deepEqual(cycleDates, [
    '2026-03-14',
    '2026-03-15',
    '2026-03-16',
    '2026-03-17',
    '2026-03-18',
  ]);
});

test('createCycleRangeRecord backfills a continuous range without duplicates', () => {
  const created = createCycleRangeRecord('module-private-inactive', '2026-03-01', '2026-03-03', 'user-owner');

  assert.equal(created.createdDates.length, 3);

  const secondPass = createCycleRangeRecord('module-private-inactive', '2026-03-02', '2026-03-04', 'user-owner');
  assert.equal(secondPass.createdDates.includes('2026-03-04'), true);
  assert.equal(secondPass.createdDates.includes('2026-03-02'), false);
});

test('markCycleStart rejects future dates', () => {
  assert.throws(
    () => {
      markCycleStart('module-private-active', '2026-03-20', 'user-owner', {
        today: '2026-03-16',
      });
    },
    (error) => error instanceof ValidationError && error.message.includes('未来日期')
  );
});

test('createCycleRangeRecord rejects future dates', () => {
  assert.throws(
    () => {
      createCycleRangeRecord('module-private-active', '2026-03-15', '2026-03-18', 'user-owner', {
        today: '2026-03-16',
      });
    },
    (error) => error instanceof ValidationError && error.message.includes('未来日期')
  );
});

const test = require('node:test');
const assert = require('node:assert/strict');

const { STORAGE_KEYS, remove } = require('../../services/storage');
const {
  getCycleGroupsByModule,
  listCycleRecordsByModule,
  listCycleDays,
  updateCycleRecord,
  ValidationError,
} = require('../../services/cycle-record-service');

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
  remove(STORAGE_KEYS.CYCLE_RECORDS);
  remove(STORAGE_KEYS.MODULE_INSTANCES);

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

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createDayRecord,
  deriveCycleGroups,
  resolveBleedingState,
} = require('../../models/day-record');

function createRecord(recordDate, bleedingState) {
  return createDayRecord({
    id: `module-a-${recordDate}`,
    moduleInstanceId: 'module-a',
    recordDate,
    bleedingState,
    createdByUserId: 'user-owner',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });
}

test('resolveBleedingState treats missing day as implicit none', () => {
  assert.equal(resolveBleedingState(null), 'none');
});

test('deriveCycleGroups merges consecutive period days into one cycle', () => {
  const groups = deriveCycleGroups('module-a', [
    createRecord('2026-03-14', 'period'),
    createRecord('2026-03-15', 'period'),
    createRecord('2026-03-16', 'period'),
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].cycleStartDate, '2026-03-14');
  assert.equal(groups[0].cycleEndDate, '2026-03-16');
  assert.equal(groups[0].dayCount, 3);
});

test('deriveCycleGroups splits a cycle when the middle day is removed', () => {
  const groups = deriveCycleGroups('module-a', [
    createRecord('2026-03-14', 'period'),
    createRecord('2026-03-16', 'period'),
  ]);

  assert.equal(groups.length, 2);
  assert.deepEqual(
    groups.map((group) => [group.cycleStartDate, group.cycleEndDate]),
    [
      ['2026-03-14', '2026-03-14'],
      ['2026-03-16', '2026-03-16'],
    ]
  );
});

test('deriveCycleGroups keeps special records adjacent to period outside the cycle boundary', () => {
  const groups = deriveCycleGroups('module-a', [
    createRecord('2026-03-13', 'special'),
    createRecord('2026-03-14', 'period'),
    createRecord('2026-03-15', 'period'),
    createRecord('2026-03-16', 'special'),
  ]);

  assert.equal(groups.length, 1);
  assert.equal(groups[0].cycleStartDate, '2026-03-14');
  assert.equal(groups[0].cycleEndDate, '2026-03-15');
});

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  diffDays,
  getAverageCycleLength,
  getCurrentCycleState,
  getPredictedNextWindow,
} = require('../../utils/date');

test('active cycle sample reports active state and cycle day 3 on 2026-03-16', () => {
  const records = [
    {
      id: 'record-active-001',
      startDate: '2026-03-14',
      endDate: null,
    },
  ];

  const result = getCurrentCycleState(records, '2026-03-16');

  assert.equal(result.isActive, true);
  assert.equal(result.cycleDay, 3);
  assert.equal(result.daysSinceLastStart, 2);
});

test('inactive cycle sample reports 24 days since last start on 2026-03-16', () => {
  const records = [
    {
      id: 'record-inactive-001',
      startDate: '2026-02-20',
      endDate: '2026-02-25',
    },
  ];

  const result = getCurrentCycleState(records, '2026-03-16');

  assert.equal(result.isActive, false);
  assert.equal(result.cycleDay, null);
  assert.equal(result.daysSinceLastStart, 24);
});

test('prediction sample uses a deterministic 30 day cycle and 5 day window', () => {
  const records = [
    { id: 'record-1', startDate: '2026-01-21', endDate: '2026-01-26' },
    { id: 'record-2', startDate: '2026-02-20', endDate: '2026-02-24' },
    { id: 'record-3', startDate: '2026-03-22', endDate: '2026-03-27' },
  ];

  assert.equal(getAverageCycleLength(records), 30);

  const result = getPredictedNextWindow(records, {
    today: '2026-03-16',
    windowLength: 5,
  });

  assert.deepEqual(result, {
    referenceDate: '2026-03-16',
    averageCycleLength: 30,
    predictedStart: '2026-04-21',
    predictedEnd: '2026-04-25',
    windowLength: 5,
  });
});

test('diffDays returns whole-day deltas for normalized date strings', () => {
  assert.equal(diffDays('2026-03-14', '2026-03-16'), 2);
});

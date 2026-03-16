const test = require('node:test');
const assert = require('node:assert/strict');

const {
  buildModuleHomeViewModel,
  getModuleHomeViewModel,
} = require('../../services/module-home-service');
const { createModuleInstance, MODULE_INSTANCE_STATES } = require('../../models/module-instance');
const { createCycleRecord } = require('../../models/cycle-record');
const { resetModuleDataForTest } = require('../../services/module-instance-service');

function createRecord(moduleInstanceId, recordDate) {
  return createCycleRecord({
    id: `${moduleInstanceId}-${recordDate}`,
    moduleInstanceId,
    recordDate,
    flowLevel: 'medium',
    createdByUserId: 'user-owner',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });
}

test.beforeEach(() => {
  resetModuleDataForTest();
});

test('buildModuleHomeViewModel reports active cycle headline and timeline markers', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-active',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '我的月经记录',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });
  const cycleRecords = [
    createRecord('module-active', '2026-01-14'),
    createRecord('module-active', '2026-01-15'),
    createRecord('module-active', '2026-02-12'),
    createRecord('module-active', '2026-02-13'),
    createRecord('module-active', '2026-03-14'),
  ];

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords,
    today: '2026-03-16',
    timelineDays: 7,
    entry: 'modules',
  });

  assert.equal(viewModel.primaryStatusText, '经期中第 3 天');
  assert.match(viewModel.secondaryStatusText, /预计下次/);
  assert.equal(viewModel.timelineDays.length, 7);
  assert.equal(viewModel.timelineDays.some((item) => item.isToday), true);
  assert.equal(viewModel.timelineDays.some((item) => item.isRecorded), true);
  assert.equal(viewModel.timelineDays.some((item) => item.isPredicted), false);
});

test('buildModuleHomeViewModel reports inactive cycle countdown and predicted window', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-inactive',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '历史样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });
  const cycleRecords = [
    createRecord('module-inactive', '2026-01-20'),
    createRecord('module-inactive', '2026-01-21'),
    createRecord('module-inactive', '2026-02-18'),
    createRecord('module-inactive', '2026-02-19'),
  ];

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords,
    today: '2026-03-16',
    timelineDays: 35,
    entry: 'modules',
  });

  assert.equal(viewModel.primaryStatusText, '距离上次开始第 27 天');
  assert.equal(viewModel.secondaryStatusText, '预计下次 03.19 - 03.23');
  assert.equal(viewModel.timelineDays.filter((item) => item.isPredicted).length, 5);
});

test('buildModuleHomeViewModel handles empty history without crashing', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-empty',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.SHARED,
    sharedSpaceId: 'shared-space-001',
    name: '我们的月经记录',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [],
    today: '2026-03-16',
    timelineDays: 5,
    entry: 'shared-space',
  });

  assert.equal(viewModel.primaryStatusText, '还没有记录');
  assert.equal(viewModel.secondaryStatusText, '先记录一次开始时间，之后这里会显示状态预测。');
  assert.equal(viewModel.stateLabel, '已共享');
  assert.equal(viewModel.entryLabel, '共享空间');
  assert.equal(viewModel.timelineDays.every((item) => !item.isRecorded), true);
});

test('getModuleHomeViewModel loads seeded data for an existing module', () => {
  const viewModel = getModuleHomeViewModel({
    moduleInstanceId: 'module-private-active',
    today: '2026-03-16',
    timelineDays: 14,
    entry: 'modules',
  });

  assert.equal(viewModel.moduleInstanceId, 'module-private-active');
  assert.equal(viewModel.entryLabel, '我的模块');
  assert.equal(viewModel.timelineDays.length, 14);
});

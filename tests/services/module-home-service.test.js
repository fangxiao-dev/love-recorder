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

test('buildModuleHomeViewModel centers cycle window around the active cycle and preserves record identity', () => {
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
    createRecord('module-active', '2026-03-15'),
    createRecord('module-active', '2026-03-16'),
  ];

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords,
    today: '2026-03-16',
    entry: 'modules',
  });

  assert.equal(viewModel.primaryStatusText, '经期中第 3 天');
  assert.match(viewModel.secondaryStatusText, /预计下次/);
  assert.equal(viewModel.calendarMode, 'cycle-window');
  assert.equal(viewModel.cycleWindow.anchor, 'current-period');
  assert.equal(viewModel.cycleWindow.startDate, '2026-03-05');
  assert.equal(viewModel.cycleWindow.endDate, '2026-03-25');
  assert.equal(viewModel.cycleWindow.weeks.length, 3);
  assert.equal(viewModel.cycleWindow.weeks.every((week) => week.days.length === 7), true);

  const todayCell = viewModel.cycleWindow.weeks
    .flatMap((week) => week.days)
    .find((item) => item.date === '2026-03-16');

  assert.equal(todayCell.isToday, true);
  assert.equal(todayCell.hasRecord, true);
  assert.equal(todayCell.isPeriod, true);
  assert.equal(todayCell.recordId, 'module-active-2026-03-16');
  assert.equal(todayCell.cycleId, 'module-active:2026-03-14');
  assert.equal(Array.isArray(viewModel.quickActions), true);
  assert.equal(viewModel.quickActions.length, 0);
});

test('buildModuleHomeViewModel centers cycle window around prediction and exposes month view metadata', () => {
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
    entry: 'modules',
  });

  assert.equal(viewModel.primaryStatusText, '距离上次开始第 27 天');
  assert.equal(viewModel.secondaryStatusText, '预计下次 03.19 - 03.23');
  assert.equal(viewModel.cycleWindow.anchor, 'prediction');
  assert.equal(viewModel.cycleWindow.startDate, '2026-03-11');
  assert.equal(viewModel.cycleWindow.endDate, '2026-03-31');
  assert.deepEqual(viewModel.cycleWindow.jumpTargets, {
    today: '2026-03-16',
    lastCycle: '2026-02-18',
    nextPrediction: '2026-03-19',
  });

  const predictedDates = viewModel.cycleWindow.weeks
    .flatMap((week) => week.days)
    .filter((item) => item.isPredicted)
    .map((item) => item.date);

  assert.deepEqual(predictedDates, [
    '2026-03-19',
    '2026-03-20',
    '2026-03-21',
    '2026-03-22',
    '2026-03-23',
  ]);

  assert.equal(viewModel.monthView.monthKey, '2026-03');
  assert.equal(viewModel.monthView.weeks.length, 5);
  assert.equal(viewModel.monthView.weeks.every((week) => week.days.length === 7), true);

  const monthRecordCell = viewModel.monthView.weeks
    .flatMap((week) => week.days)
    .find((item) => item.date === '2026-03-19');

  assert.equal(monthRecordCell.isCurrentMonth, true);
  assert.equal(monthRecordCell.hasRecord, false);
  assert.equal(monthRecordCell.isPredicted, true);
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
    entry: 'shared-space',
  });

  assert.equal(viewModel.primaryStatusText, '还没有记录');
  assert.equal(viewModel.secondaryStatusText, '先记录一次开始时间，之后这里会显示状态预测。');
  assert.equal(viewModel.stateLabel, '已共享');
  assert.equal(viewModel.entryLabel, '共享空间');
  assert.equal(viewModel.cycleWindow.anchor, 'today');
  assert.equal(viewModel.cycleWindow.weeks.length, 3);
  assert.equal(
    viewModel.cycleWindow.weeks.flatMap((week) => week.days).every((item) => !item.hasRecord),
    true
  );
});

test('getModuleHomeViewModel loads seeded data for an existing module', () => {
  const viewModel = getModuleHomeViewModel({
    moduleInstanceId: 'module-private-active',
    today: '2026-03-16',
    entry: 'modules',
  });

  assert.equal(viewModel.moduleInstanceId, 'module-private-active');
  assert.equal(viewModel.entryLabel, '我的模块');
  assert.equal(viewModel.cycleWindow.weeks.length, 3);
  assert.equal(viewModel.monthView.weeks.length >= 4, true);
});

test('getModuleHomeViewModel keeps month mode and month cursor when requested', () => {
  const viewModel = getModuleHomeViewModel({
    moduleInstanceId: 'module-private-active',
    today: '2026-03-16',
    entry: 'modules',
    calendarMode: 'month',
    monthCursor: '2026-04',
  });

  assert.equal(viewModel.calendarMode, 'month');
  assert.equal(viewModel.monthView.monthKey, '2026-04');
});

test('buildModuleHomeViewModel exposes property-first day editing for an empty selected day', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-panel-empty',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '面板空白样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [],
    today: '2026-03-16',
    selectedDate: '2026-03-16',
    entry: 'modules',
  });

  assert.equal(viewModel.selectedDatePanel.selectedDate, '2026-03-16');
  assert.equal(viewModel.selectedDatePanel.mode, 'day-state');
  assert.equal(viewModel.selectedDatePanel.bleedingState, 'none');
  assert.equal(viewModel.selectedDatePanel.primaryAction.key, 'mark-normal');
  assert.equal(viewModel.selectedDatePanel.secondaryAction, null);
  assert.equal(viewModel.selectedDatePanel.stateActions.length, 2);
  assert.equal(viewModel.selectedDatePanel.stateActions[1].label, '特殊');
  assert.equal(viewModel.selectedDatePanel.attributeFields.length >= 4, true);
  assert.equal(viewModel.selectedDatePanel.clearAction.key, 'clear-record');
});

test('buildModuleHomeViewModel shows marker only for special records', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-marker',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '标记样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const periodRecord = createCycleRecord({
    id: 'module-marker-2026-03-14',
    moduleInstanceId: 'module-marker',
    recordDate: '2026-03-14',
    bleedingState: 'period',
    createdByUserId: 'user-owner',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });
  const specialRecord = createCycleRecord({
    id: 'module-marker-2026-03-15',
    moduleInstanceId: 'module-marker',
    recordDate: '2026-03-15',
    bleedingState: 'special',
    createdByUserId: 'user-owner',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [periodRecord, specialRecord],
    today: '2026-03-16',
    entry: 'modules',
  });

  const days = viewModel.cycleWindow.weeks.flatMap((week) => week.days);
  const periodDay = days.find((day) => day.date === '2026-03-14');
  const specialDay = days.find((day) => day.date === '2026-03-15');

  assert.equal(periodDay.hasMarker, false);
  assert.equal(periodDay.isPeriod, true);
  assert.equal(specialDay.hasMarker, true);
  assert.equal(specialDay.isPeriod, false);
});

test('buildModuleHomeViewModel keeps cycle day context for selected period dates', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-panel-active',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '面板进行中样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [
      createRecord('module-panel-active', '2026-03-14'),
      createRecord('module-panel-active', '2026-03-15'),
      createRecord('module-panel-active', '2026-03-16'),
    ],
    today: '2026-03-16',
    selectedDate: '2026-03-16',
    entry: 'modules',
  });

  assert.equal(viewModel.selectedDatePanel.mode, 'day-state');
  assert.equal(viewModel.selectedDatePanel.bleedingState, 'period');
  assert.equal(viewModel.selectedDatePanel.primaryAction.key, 'mark-normal');
  assert.equal(viewModel.selectedDatePanel.cycleDay, 3);
});

test('buildModuleHomeViewModel marks drag-selected days from a selectedDates list', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-range-state',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '区间补录样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [],
    today: '2026-03-16',
    selectedDate: '2026-03-22',
    selectedDates: ['2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23'],
    entry: 'modules',
  });

  const rangeDays = viewModel.monthView.weeks
    .flatMap((week) => week.days)
    .filter((item) => item.isInSelectedRange)
    .map((item) => item.date);

  assert.deepEqual(rangeDays, [
    '2026-03-20',
    '2026-03-21',
    '2026-03-22',
    '2026-03-23',
  ]);
});

test('buildModuleHomeViewModel exposes selection mode metadata for drag editing', () => {
  const moduleInstance = createModuleInstance({
    id: 'module-selection-mode',
    ownerUserId: 'user-owner',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    name: '拖选样例',
    createdAt: '2026-03-16T09:00:00Z',
    updatedAt: '2026-03-16T09:00:00Z',
  });

  const viewModel = buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords: [
      createRecord('module-selection-mode', '2026-03-08'),
      createRecord('module-selection-mode', '2026-03-09'),
    ],
    today: '2026-03-16',
    selectedDate: '2026-03-08',
    isRangeSelectionMode: true,
    selectionDragMode: 'deselect',
    selectedDates: ['2026-03-08', '2026-03-09', '2026-03-10'],
    entry: 'modules',
  });

  assert.equal(viewModel.selectionMode.isActive, true);
  assert.equal(viewModel.selectionMode.dragMode, 'deselect');
  assert.deepEqual(viewModel.selectionMode.selectedDates, ['2026-03-08', '2026-03-09', '2026-03-10']);
});

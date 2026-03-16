const { getCycleGroupsByModule } = require('./cycle-record-service');
const {
  ensureSeededModuleData,
  getModuleInstanceById,
} = require('./module-instance-service');
const {
  DAY_IN_MS,
  diffDays,
  formatDate,
  getPredictedNextWindow,
  parseDateString,
} = require('../utils/date');

const DEFAULT_TIMELINE_DAYS = 35;
const DEFAULT_WINDOW_LENGTH = 5;
const DEFAULT_ACTIVE_WINDOW_DAYS = 5;

function addDays(dateString, offset) {
  return formatDate(new Date(parseDateString(dateString).getTime() + offset * DAY_IN_MS));
}

function toCycleRangeRecords(groups) {
  return groups.map((item) => ({
    id: item.cycleId,
    startDate: item.cycleStartDate,
    endDate: item.cycleEndDate,
  }));
}

function buildTimelineDays(options) {
  const today = options.today;
  const totalDays = options.timelineDays || DEFAULT_TIMELINE_DAYS;
  const recordedDates = new Set(options.recordedDates || []);
  const predictedDates = new Set(options.predictedDates || []);
  const predictedDateList = [...predictedDates].sort();
  const latestVisibleDate = predictedDateList.length
    ? predictedDateList[predictedDateList.length - 1]
    : today;
  const futureDays = latestVisibleDate > today ? diffDays(today, latestVisibleDate) : 0;
  const pastDays = Math.max(totalDays - futureDays - 1, 0);
  const startDate = addDays(today, -pastDays);
  const days = [];

  for (let index = 0; index < totalDays; index += 1) {
    const date = addDays(startDate, index);
    const monthLabel = date.slice(5, 7);
    const dayLabel = date.slice(8, 10);
    days.push({
      id: date,
      date,
      monthLabel,
      dayLabel,
      isToday: date === today,
      isRecorded: recordedDates.has(date),
      isPredicted: predictedDates.has(date),
    });
  }

  return days;
}

function getEntryLabel(entry) {
  return entry === 'shared-space' ? '共享空间' : '我的模块';
}

function getStateLabel(moduleInstance) {
  return moduleInstance && moduleInstance.state === 'shared' ? '已共享' : '私有';
}

function buildStatusTexts(groups, today) {
  if (!groups.length) {
    return {
      isActive: false,
      primaryStatusText: '还没有记录',
      secondaryStatusText: '先记录一次开始时间，之后这里会显示状态预测。',
      predictedWindow: null,
    };
  }

  const cycleRanges = toCycleRangeRecords(groups);
  const latest = cycleRanges[cycleRanges.length - 1];
  const predictedWindow = getPredictedNextWindow(cycleRanges, {
    today,
    windowLength: DEFAULT_WINDOW_LENGTH,
  });
  const assumedEndDate = addDays(latest.startDate, DEFAULT_ACTIVE_WINDOW_DAYS - 1);
  const isActive = today >= latest.startDate && today <= assumedEndDate;
  const primaryStatusText = isActive
    ? `经期中第 ${diffDays(latest.startDate, today) + 1} 天`
    : `距离上次开始第 ${diffDays(latest.startDate, today) + 1} 天`;
  const secondaryStatusText = predictedWindow
    ? `预计下次 ${predictedWindow.predictedStart.slice(5).replace('-', '.')} - ${predictedWindow.predictedEnd.slice(5).replace('-', '.')}`
    : '继续记录 2 个周期后，这里会显示预测窗口。';

  return {
    isActive,
    primaryStatusText,
    secondaryStatusText,
    predictedWindow,
  };
}

function buildModuleHomeViewModel(input) {
  const moduleInstance = input.moduleInstance;
  const today = input.today || formatDate(new Date());
  const timelineDays = input.timelineDays || DEFAULT_TIMELINE_DAYS;
  const entry = input.entry || 'modules';
  const relevantRecords = (input.cycleRecords || [])
    .filter((item) => item.recordDate && item.recordDate <= today)
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));
  const groups = [];

  relevantRecords.forEach((record) => {
    const current = groups[groups.length - 1];
    if (!current) {
      groups.push({
        cycleId: `${moduleInstance.id}:${record.recordDate}`,
        cycleStartDate: record.recordDate,
        cycleEndDate: record.recordDate,
        days: [record],
      });
      return;
    }

    if (diffDays(current.cycleEndDate, record.recordDate) <= 1) {
      current.cycleEndDate = record.recordDate;
      current.days.push(record);
      return;
    }

    groups.push({
      cycleId: `${moduleInstance.id}:${record.recordDate}`,
      cycleStartDate: record.recordDate,
      cycleEndDate: record.recordDate,
      days: [record],
    });
  });

  const { isActive, primaryStatusText, secondaryStatusText, predictedWindow } = buildStatusTexts(groups, today);
  const predictedDates = [];
  if (predictedWindow && !isActive) {
    for (let index = 0; index < predictedWindow.windowLength; index += 1) {
      predictedDates.push(addDays(predictedWindow.predictedStart, index));
    }
  }

  return {
    moduleInstanceId: moduleInstance.id,
    moduleName: moduleInstance.name,
    entryLabel: getEntryLabel(entry),
    stateLabel: getStateLabel(moduleInstance),
    primaryStatusText,
    secondaryStatusText,
    timelineDays: buildTimelineDays({
      today,
      timelineDays,
      recordedDates: relevantRecords.map((item) => item.recordDate),
      predictedDates,
    }),
    hasHistory: groups.length > 0,
    quickActions: [
      { key: 'start', label: '今天来了', type: 'primary' },
      { key: 'end', label: '今天结束了', type: 'secondary' },
      { key: 'range', label: '补录一段', type: 'secondary' },
      { key: 'exception', label: '记录异常', type: 'secondary' },
    ],
  };
}

function getModuleHomeViewModel(input) {
  ensureSeededModuleData();
  const moduleInstance = getModuleInstanceById(input.moduleInstanceId);
  if (!moduleInstance) {
    throw new Error('MODULE_INSTANCE_NOT_FOUND');
  }

  const groups = getCycleGroupsByModule(input.moduleInstanceId);
  const cycleRecords = groups.flatMap((item) => item.days);

  return buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords,
    today: input.today,
    timelineDays: input.timelineDays,
    entry: input.entry,
  });
}

module.exports = {
  DEFAULT_TIMELINE_DAYS,
  buildModuleHomeViewModel,
  getModuleHomeViewModel,
};

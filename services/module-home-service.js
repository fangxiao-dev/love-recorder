const {
  DEFAULT_MENSTRUAL_DAYS,
  getCycleGroupsByModule,
  listCycleRecordsByModule,
} = require('./cycle-record-service');
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
const DEFAULT_CYCLE_WINDOW_DAYS = 21;
const CYCLE_WINDOW_WEEKS = 3;
const DAYS_PER_WEEK = 7;
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

function buildCycleGroupsFromRecords(moduleInstanceId, records) {
  const groups = [];
  const periodRecords = records.filter((record) => (record.bleedingState || 'period') === 'period');

  periodRecords.forEach((record) => {
    const current = groups[groups.length - 1];
    if (!current) {
      groups.push({
        cycleId: `${moduleInstanceId}:${record.recordDate}`,
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
      cycleId: `${moduleInstanceId}:${record.recordDate}`,
      cycleStartDate: record.recordDate,
      cycleEndDate: record.recordDate,
      days: [record],
    });
  });

  return groups;
}

function buildDateMaps(groups, records) {
  const recordMap = new Map();
  const cycleIdMap = new Map();

  records.forEach((record) => {
    recordMap.set(record.recordDate, record);
  });

  groups.forEach((group) => {
    group.days.forEach((record) => {
      cycleIdMap.set(record.recordDate, group.cycleId);
    });
  });

  return {
    recordMap,
    cycleIdMap,
  };
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

function getRangeRole(date, dates) {
  if (!dates.has(date)) {
    return 'none';
  }

  const previousDate = addDays(date, -1);
  const nextDate = addDays(date, 1);
  const hasPrevious = dates.has(previousDate);
  const hasNext = dates.has(nextDate);

  if (hasPrevious && hasNext) {
    return 'middle';
  }

  if (hasPrevious) {
    return 'end';
  }

  if (hasNext) {
    return 'start';
  }

  return 'single';
}

function toDisplayDay(date, options) {
  const monthKey = options.monthKey || date.slice(0, 7);
  const record = options.recordMap.get(date) || null;
  const isInSelectedRange = options.selectedRangeDates.has(date);

  return {
    id: date,
    date,
    dayLabel: String(Number(date.slice(8, 10))),
    monthLabel: date.slice(5, 7),
    monthKey: date.slice(0, 7),
    isCurrentMonth: date.slice(0, 7) === monthKey,
    isToday: date === options.today,
    isSelected: date === options.selectedDate,
    isInSelectedRange,
    isSelectionAnchor: date === options.selectionAnchorDate,
    hasRecord: Boolean(record),
    hasMarker: Boolean(record) && (record.bleedingState === 'special' || record.bleedingState === 'spotting'),
    isPeriod: options.periodDates.has(date),
    isPredicted: options.predictedDates.has(date),
    periodRole: getRangeRole(date, options.periodDates),
    predictionRole: getRangeRole(date, options.predictedDates),
    recordId: record ? record.id : '',
    cycleId: options.cycleIdMap.get(date) || '',
  };
}

function getMiddleDate(startDate, endDate) {
  return addDays(startDate, Math.floor(diffDays(startDate, endDate) / 2));
}

function getCycleWindowAnchor(groups, predictedWindow, today, isActive) {
  const latestGroup = groups[groups.length - 1] || null;
  if (latestGroup && isActive) {
    const visiblePeriodEndDate = latestGroup.cycleEndDate > today ? latestGroup.cycleEndDate : today;
    return {
      anchor: 'current-period',
      anchorDate: getMiddleDate(latestGroup.cycleStartDate, visiblePeriodEndDate),
    };
  }

  if (predictedWindow) {
    return {
      anchor: 'prediction',
      anchorDate: getMiddleDate(predictedWindow.predictedStart, predictedWindow.predictedEnd),
    };
  }

  return {
    anchor: 'today',
    anchorDate: today,
  };
}

function buildCycleWindow(options) {
  const totalDays = DEFAULT_CYCLE_WINDOW_DAYS;
  const anchorConfig = options.windowStartDate
    ? {
        anchor: 'manual',
        anchorDate: addDays(options.windowStartDate, Math.floor((totalDays - 1) / 2)),
      }
    : getCycleWindowAnchor(options.groups, options.predictedWindow, options.today, options.isActive);
  const startDate = options.windowStartDate || addDays(anchorConfig.anchorDate, -Math.floor((totalDays - 1) / 2));
  const weeks = [];

  for (let weekIndex = 0; weekIndex < CYCLE_WINDOW_WEEKS; weekIndex += 1) {
    const weekStartDate = addDays(startDate, weekIndex * DAYS_PER_WEEK);
    const days = [];
    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
      const date = addDays(weekStartDate, dayIndex);
      days.push(toDisplayDay(date, options));
    }

    weeks.push({
      id: weekStartDate,
      startDate: weekStartDate,
      endDate: addDays(weekStartDate, DAYS_PER_WEEK - 1),
      days,
    });
  }

  return {
    anchor: anchorConfig.anchor,
    anchorDate: anchorConfig.anchorDate,
    startDate,
    endDate: addDays(startDate, totalDays - 1),
    previousStartDate: addDays(startDate, -DAYS_PER_WEEK),
    nextStartDate: addDays(startDate, DAYS_PER_WEEK),
    jumpTargets: {
      today: options.today,
      lastCycle: options.groups.length ? options.groups[options.groups.length - 1].cycleStartDate : '',
      nextPrediction: options.predictedWindow ? options.predictedWindow.predictedStart : '',
    },
    weeks,
  };
}

function getMonthBounds(monthKey) {
  const [yearString, monthString] = monthKey.split('-');
  const year = Number(yearString);
  const monthIndex = Number(monthString) - 1;
  const firstDate = formatDate(new Date(Date.UTC(year, monthIndex, 1)));
  const lastDate = formatDate(new Date(Date.UTC(year, monthIndex + 1, 0)));
  const firstDayOffset = new Date(`${firstDate}T00:00:00Z`).getUTCDay();
  const lastDayOffset = new Date(`${lastDate}T00:00:00Z`).getUTCDay();

  return {
    firstDate,
    lastDate,
    startDate: addDays(firstDate, -firstDayOffset),
    endDate: addDays(lastDate, 6 - lastDayOffset),
    previousMonthKey: formatDate(new Date(Date.UTC(year, monthIndex - 1, 1))).slice(0, 7),
    nextMonthKey: formatDate(new Date(Date.UTC(year, monthIndex + 1, 1))).slice(0, 7),
  };
}

function buildMonthView(options) {
  const monthKey = options.monthKey || options.today.slice(0, 7);
  const bounds = getMonthBounds(monthKey);
  const weeks = [];
  let cursor = bounds.startDate;

  while (cursor <= bounds.endDate) {
    const weekStartDate = cursor;
    const days = [];
    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex += 1) {
      const date = addDays(weekStartDate, dayIndex);
      days.push(toDisplayDay(date, {
        ...options,
        monthKey,
      }));
    }

    weeks.push({
      id: weekStartDate,
      startDate: weekStartDate,
      endDate: addDays(weekStartDate, DAYS_PER_WEEK - 1),
      days,
    });

    cursor = addDays(cursor, DAYS_PER_WEEK);
  }

  return {
    monthKey,
    monthLabel: `${Number(monthKey.slice(0, 4))}年${Number(monthKey.slice(5, 7))}月`,
    previousMonthKey: bounds.previousMonthKey,
    nextMonthKey: bounds.nextMonthKey,
    weeks,
  };
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

function getActivePeriodDates(groups, today, defaultMenstrualDays, blockedDates) {
  if (!groups.length) {
    return new Set();
  }

  const latest = groups[groups.length - 1];
  const inferredEndDate = addDays(latest.cycleStartDate, defaultMenstrualDays - 1);
  if (today < latest.cycleStartDate || today > inferredEndDate) {
    return new Set();
  }

  const activeDates = new Set();
  const visibleEndDate = today < latest.cycleEndDate ? today : today;
  const totalDays = diffDays(latest.cycleStartDate, visibleEndDate);
  for (let index = 0; index <= totalDays; index += 1) {
    const date = addDays(latest.cycleStartDate, index);
    if (!blockedDates || !blockedDates.has(date)) {
      activeDates.add(date);
    }
  }

  return activeDates;
}

function getRecordedPeriodDates(groups) {
  const periodDates = new Set();

  groups.forEach((group) => {
    group.days.forEach((record) => {
      periodDates.add(record.recordDate);
    });
  });

  return periodDates;
}

function buildSelectedDatePanel(options) {
  const selectedDate = options.selectedDate;
  const record = options.recordMap.get(selectedDate) || null;
  const bleedingState = record ? record.bleedingState : 'none';
  const stateLabels = {
    none: '未记录',
    period: '经期',
    special: '特殊',
  };

  return {
    selectedDate,
    mode: 'day-state',
    title: `当前状态：${stateLabels[bleedingState] || '未记录'}`,
    description: '轻点直接编辑当天状态和属性；连续的经期天数会自动派生为经期区块。',
    cycleDay: options.cycleIdMap.has(selectedDate)
      ? getCycleDay(options.groups, selectedDate)
      : null,
    bleedingState,
    primaryAction: {
      key: 'mark-normal',
      label: '月经正常',
    },
    secondaryAction: null,
    stateActions: [
      { key: 'set-period', label: '经期', active: bleedingState === 'period' },
      { key: 'set-special', label: '特殊', active: bleedingState === 'special' },
    ],
    clearAction: {
      key: 'clear-record',
      label: '清除记录',
    },
    attributeFields: [
      { key: 'flowLevel', label: '流量', value: record ? record.flowLevel || '未填写' : '未填写', rawValue: record ? record.flowLevel || '' : '' },
      { key: 'painLevel', label: '疼痛', value: record ? record.painLevel || '未填写' : '未填写', rawValue: record ? record.painLevel || '' : '' },
      { key: 'colorLevel', label: '颜色', value: record ? record.colorLevel || '未填写' : '未填写', rawValue: record ? record.colorLevel || '' : '' },
      { key: 'notes', label: '备注', value: record ? record.notes || '未填写' : '未填写', rawValue: record ? record.notes || '' : '' },
    ],
    hasRecord: Boolean(record),
  };
}

function getCycleDay(groups, selectedDate) {
  const group = groups.find(
    (item) => selectedDate >= item.cycleStartDate && selectedDate <= item.cycleEndDate
  );
  if (!group) {
    return null;
  }

  return diffDays(group.cycleStartDate, selectedDate) + 1;
}

function buildModuleHomeViewModel(input) {
  const moduleInstance = input.moduleInstance;
  const today = input.today || formatDate(new Date());
  const entry = input.entry || 'modules';
  const selectedDate = input.selectedDate || today;
  const defaultMenstrualDays = input.defaultMenstrualDays || DEFAULT_MENSTRUAL_DAYS;
  const relevantRecords = (input.cycleRecords || [])
    .filter((item) => item.recordDate && item.recordDate <= today)
    .sort((left, right) => left.recordDate.localeCompare(right.recordDate));
  const groups = buildCycleGroupsFromRecords(moduleInstance.id, relevantRecords);

  const { isActive, primaryStatusText, secondaryStatusText, predictedWindow } = buildStatusTexts(groups, today);
  const predictedDates = new Set();
  if (predictedWindow && !isActive) {
    for (let index = 0; index < predictedWindow.windowLength; index += 1) {
      predictedDates.add(addDays(predictedWindow.predictedStart, index));
    }
  }
  const recordedDates = new Set(relevantRecords.map((item) => item.recordDate));
  const blockedPeriodDates = new Set(
    relevantRecords
      .filter((item) => item.bleedingState && item.bleedingState !== 'period')
      .map((item) => item.recordDate)
  );
  const recordedPeriodDates = getRecordedPeriodDates(groups);
  const activePeriodDates = getActivePeriodDates(groups, today, defaultMenstrualDays, blockedPeriodDates);
  const periodDates = new Set([...recordedPeriodDates, ...activePeriodDates]);
  const { recordMap, cycleIdMap } = buildDateMaps(groups, relevantRecords);
  const selectedRangeDates = new Set(input.selectedDates || []);
  const calendarOptions = {
    today,
    monthKey: input.monthCursor,
    predictedDates,
    predictedWindow,
    groups,
    isActive,
    recordMap,
    cycleIdMap,
    periodDates,
    recordedDates,
    selectedDate,
    selectedRangeDates,
    selectionAnchorDate: input.selectionAnchorDate,
    windowStartDate: input.cycleWindowStartDate,
  };

  return {
    moduleInstanceId: moduleInstance.id,
    moduleName: moduleInstance.name,
    entryLabel: getEntryLabel(entry),
    stateLabel: getStateLabel(moduleInstance),
    primaryStatusText,
    secondaryStatusText,
    calendarMode: input.calendarMode || 'cycle-window',
    selectedDate,
    cycleWindow: buildCycleWindow(calendarOptions),
    monthView: buildMonthView(calendarOptions),
    selectedDatePanel: buildSelectedDatePanel({
      selectedDate,
      today,
      groups,
      recordMap,
      cycleIdMap,
    }),
    timelineDays: buildTimelineDays({
      today,
      timelineDays: input.timelineDays || DEFAULT_TIMELINE_DAYS,
      recordedDates: relevantRecords.map((item) => item.recordDate),
      predictedDates: [...predictedDates],
    }),
    hasHistory: groups.length > 0,
    quickActions: [],
    selectionMode: {
      isActive: Boolean(input.isRangeSelectionMode),
      dragMode: input.selectionDragMode || '',
      selectedDates: [...selectedRangeDates].sort(),
      anchorDate: input.selectionAnchorDate || '',
    },
  };
}

function getModuleHomeViewModel(input) {
  ensureSeededModuleData();
  const moduleInstance = getModuleInstanceById(input.moduleInstanceId);
  if (!moduleInstance) {
    throw new Error('MODULE_INSTANCE_NOT_FOUND');
  }

  const groups = getCycleGroupsByModule(input.moduleInstanceId);
  const cycleRecords = listCycleRecordsByModule(input.moduleInstanceId);

  return buildModuleHomeViewModel({
    moduleInstance,
    cycleRecords,
    today: input.today,
    timelineDays: input.timelineDays,
    selectedDate: input.selectedDate,
    isRangeSelectionMode: input.isRangeSelectionMode,
    selectionDragMode: input.selectionDragMode,
    selectionAnchorDate: input.selectionAnchorDate,
    selectedDates: input.selectedDates,
    calendarMode: input.calendarMode,
    cycleWindowStartDate: input.cycleWindowStartDate,
    monthCursor: input.monthCursor,
    defaultMenstrualDays: input.defaultMenstrualDays,
    entry: input.entry,
  });
}

module.exports = {
  DEFAULT_CYCLE_WINDOW_DAYS,
  DEFAULT_TIMELINE_DAYS,
  buildModuleHomeViewModel,
  getModuleHomeViewModel,
};

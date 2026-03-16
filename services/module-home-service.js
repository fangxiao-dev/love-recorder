const {
  DEFAULT_MENSTRUAL_DAYS,
  getCycleGroupsByModule,
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

  records.forEach((record) => {
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

function buildDateMaps(groups) {
  const recordMap = new Map();
  const cycleIdMap = new Map();

  groups.forEach((group) => {
    group.days.forEach((record) => {
      recordMap.set(record.recordDate, record);
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
    hasRecord: Boolean(record),
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

function getActivePeriodDates(groups, today, defaultMenstrualDays) {
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
    activeDates.add(addDays(latest.cycleStartDate, index));
  }

  return activeDates;
}

function buildSelectedDatePanel(options) {
  const selectedDate = options.selectedDate;
  const latestGroup = options.groups[options.groups.length - 1] || null;
  const hasRecord = options.recordMap.has(selectedDate);
  const isWithinActiveWindow = latestGroup
    && selectedDate >= latestGroup.cycleStartDate
    && selectedDate <= options.activeWindowEndDate
    && selectedDate <= options.today;

  if (isWithinActiveWindow) {
    return {
      selectedDate,
      mode: 'end-confirm',
      title: `已进入经期第 ${diffDays(latestGroup.cycleStartDate, selectedDate) + 1} 天`,
      description: '如果这一天是最后一天，直接点“是”完成闭环；否则保持“否”。',
      cycleDay: diffDays(latestGroup.cycleStartDate, selectedDate) + 1,
      primaryAction: {
        key: 'end-yes',
        label: '月经走了：是',
      },
      secondaryAction: {
        key: 'end-no',
        label: '月经走了：否',
      },
      exceptionAction: {
        key: 'exception',
        label: '记录异常',
      },
      hasRecord,
    };
  }

  return {
    selectedDate,
    mode: 'start',
    title: hasRecord ? '这一天已记录为经期日' : '这一天还没有月经状态',
    description: hasRecord ? '如果这一天状态不符合预期，可以补充异常。' : '如果这一天是本次开始日，可以直接记为“月经来了”。',
    cycleDay: null,
    primaryAction: {
      key: 'start',
      label: '月经来了',
    },
    secondaryAction: {
      key: 'range',
      label: '补录一段',
    },
    exceptionAction: {
      key: 'exception',
      label: '记录异常',
    },
    hasRecord,
  };
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
  const activePeriodDates = getActivePeriodDates(groups, today, defaultMenstrualDays);
  const periodDates = new Set([...recordedDates, ...activePeriodDates]);
  const { recordMap, cycleIdMap } = buildDateMaps(groups);
  const selectedRangeDates = new Set();
  if (input.rangeSelectionStart) {
    const rangeEnd = input.rangeSelectionEnd || input.rangeSelectionStart;
    const totalDays = diffDays(input.rangeSelectionStart, rangeEnd);
    for (let index = 0; index <= totalDays; index += 1) {
      selectedRangeDates.add(addDays(input.rangeSelectionStart, index));
    }
  }
  const latestGroup = groups[groups.length - 1] || null;
  const activeWindowEndDate = latestGroup
    ? addDays(latestGroup.cycleStartDate, defaultMenstrualDays - 1)
    : '';
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
      activeWindowEndDate,
    }),
    timelineDays: buildTimelineDays({
      today,
      timelineDays: input.timelineDays || DEFAULT_TIMELINE_DAYS,
      recordedDates: relevantRecords.map((item) => item.recordDate),
      predictedDates: [...predictedDates],
    }),
    hasHistory: groups.length > 0,
    quickActions: [
      { key: 'start', label: '今天来了', type: 'primary' },
      { key: 'end', label: '今天结束了', type: 'secondary' },
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
    selectedDate: input.selectedDate,
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function parseDateString(dateString) {
  return new Date(`${dateString}T00:00:00Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function diffDays(fromDateString, toDateString) {
  const from = parseDateString(fromDateString);
  const to = parseDateString(toDateString);
  return Math.round((to - from) / DAY_IN_MS);
}

function sortRecordsByStart(records) {
  return [...records].sort((left, right) => left.startDate.localeCompare(right.startDate));
}

function getLatestRecord(records) {
  const sorted = sortRecordsByStart(records);
  return sorted.length ? sorted[sorted.length - 1] : null;
}

function getCurrentCycleState(records, today) {
  const latest = getLatestRecord(records);
  if (!latest) {
    return {
      isActive: false,
      currentRecord: null,
      cycleDay: null,
      daysSinceLastStart: null,
    };
  }

  const daysSinceLastStart = diffDays(latest.startDate, today);
  const isActive = !latest.endDate || latest.endDate >= today;

  return {
    isActive,
    currentRecord: latest,
    cycleDay: isActive ? daysSinceLastStart + 1 : null,
    daysSinceLastStart,
  };
}

function getAverageCycleLength(records) {
  const sorted = sortRecordsByStart(records);
  if (sorted.length < 2) {
    return null;
  }

  const gaps = [];
  for (let index = 1; index < sorted.length; index += 1) {
    gaps.push(diffDays(sorted[index - 1].startDate, sorted[index].startDate));
  }

  const total = gaps.reduce((sum, gap) => sum + gap, 0);
  return Math.round(total / gaps.length);
}

function getPredictedNextWindow(records, options) {
  const today = options && options.today ? options.today : formatDate(new Date());
  const windowLength = options && options.windowLength ? options.windowLength : 5;
  const latest = getLatestRecord(records);
  const averageCycleLength = getAverageCycleLength(records);

  if (!latest || !averageCycleLength) {
    return null;
  }

  const predictedStart = formatDate(
    new Date(parseDateString(latest.startDate).getTime() + averageCycleLength * DAY_IN_MS)
  );
  const predictedEnd = formatDate(
    new Date(parseDateString(predictedStart).getTime() + (windowLength - 1) * DAY_IN_MS)
  );

  return {
    referenceDate: today,
    averageCycleLength,
    predictedStart,
    predictedEnd,
    windowLength,
  };
}

module.exports = {
  DAY_IN_MS,
  diffDays,
  formatDate,
  getAverageCycleLength,
  getCurrentCycleState,
  getLatestRecord,
  getPredictedNextWindow,
  parseDateString,
  sortRecordsByStart,
};

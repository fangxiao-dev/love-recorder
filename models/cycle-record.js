const { FLOW_LEVELS, PAIN_LEVELS, COLOR_LEVELS, createDayRecord } = require('./day-record');

function createCycleRecord(input) {
  return createDayRecord({
    ...input,
    bleedingState: input.bleedingState || 'period',
  });
}

module.exports = {
  FLOW_LEVELS,
  PAIN_LEVELS,
  COLOR_LEVELS,
  createCycleRecord,
};

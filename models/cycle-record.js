const FLOW_LEVELS = ['light', 'medium', 'heavy'];
const PAIN_LEVELS = ['mild', 'moderate', 'severe'];

function createCycleRecord(input) {
  return {
    id: input.id,
    moduleInstanceId: input.moduleInstanceId,
    startDate: input.startDate,
    endDate: input.endDate || null,
    flowLevel: input.flowLevel || null,
    painLevel: input.painLevel || null,
    notes: input.notes || '',
    source: input.source || 'owner',
    lastEditedByUserId: input.lastEditedByUserId || input.createdByUserId,
    createdByUserId: input.createdByUserId,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  };
}

module.exports = {
  FLOW_LEVELS,
  PAIN_LEVELS,
  createCycleRecord,
};

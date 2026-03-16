const MODULE_INSTANCE_STATES = {
  PRIVATE: 'private',
  SHARED: 'shared',
};

const MODULE_TYPES = {
  MENSTRUAL: 'menstrual',
};

function createModuleInstance(input) {
  return {
    id: input.id,
    ownerUserId: input.ownerUserId,
    moduleType: input.moduleType || MODULE_TYPES.MENSTRUAL,
    name: input.name || '月经记录',
    state: input.state || MODULE_INSTANCE_STATES.PRIVATE,
    sharedSpaceId: input.sharedSpaceId || null,
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
    archivedAt: input.archivedAt || null,
  };
}

module.exports = {
  MODULE_INSTANCE_STATES,
  MODULE_TYPES,
  createModuleInstance,
};

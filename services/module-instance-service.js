const { seedCollections, users } = require('../mock/seed-data');
const { MODULE_INSTANCE_STATES } = require('../models/module-instance');
const storage = require('./storage');

function ensureSeededModuleData() {
  const hasModules = storage.get(storage.STORAGE_KEYS.MODULE_INSTANCES);
  if (Array.isArray(hasModules) && hasModules.length > 0) {
    return;
  }

  storage.loadSeedData(seedCollections);
}

function getModuleInstances() {
  ensureSeededModuleData();
  return storage.get(storage.STORAGE_KEYS.MODULE_INSTANCES) || [];
}

function getCycleRecords() {
  ensureSeededModuleData();
  return storage.get(storage.STORAGE_KEYS.CYCLE_RECORDS) || [];
}

function getSharedSpaces() {
  ensureSeededModuleData();
  return storage.get(storage.STORAGE_KEYS.SHARED_SPACES) || [];
}

function getUsersById() {
  return Object.values(users).reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
}

function getStateLabel(moduleInstance, sharedSpaceMap) {
  if (moduleInstance.state === MODULE_INSTANCE_STATES.SHARED && moduleInstance.sharedSpaceId) {
    const sharedSpace = sharedSpaceMap[moduleInstance.sharedSpaceId];
    const spaceName = sharedSpace ? sharedSpace.name : '共享空间';
    return `已共享到${spaceName}`;
  }

  return '私有';
}

function getModuleHomeRoute(input) {
  const entry = input.entry || 'modules';
  return `/pages/module-home/index?moduleInstanceId=${input.moduleInstanceId}&entry=${entry}`;
}

function listModulesForOwner(input) {
  const ownerUserId = input.ownerUserId;
  const sharedSpaces = getSharedSpaces();
  const sharedSpaceMap = sharedSpaces.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  return getModuleInstances()
    .filter((item) => item.ownerUserId === ownerUserId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      state: item.state,
      stateLabel: getStateLabel(item, sharedSpaceMap),
      route: getModuleHomeRoute({ moduleInstanceId: item.id, entry: 'modules' }),
    }));
}

function getModuleInstanceById(moduleInstanceId) {
  return getModuleInstances().find((item) => item.id === moduleInstanceId) || null;
}

function findLastEditorName(moduleInstanceId, usersById) {
  const relatedRecords = getCycleRecords()
    .filter((item) => item.moduleInstanceId === moduleInstanceId)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  const latest = relatedRecords[0];
  if (!latest || !latest.lastEditedByUserId) {
    return '暂无';
  }

  const editor = usersById[latest.lastEditedByUserId];
  return editor ? editor.displayName : '未知成员';
}

function listSharedModules(input) {
  const sharedSpaceId = input.sharedSpaceId;
  const usersById = getUsersById();
  const sharedSpaces = getSharedSpaces();
  const sharedSpaceMap = sharedSpaces.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {});

  return getModuleInstances()
    .filter((item) => item.sharedSpaceId === sharedSpaceId)
    .map((item) => ({
      id: item.id,
      name: item.name,
      state: item.state,
      stateLabel: getStateLabel(item, sharedSpaceMap),
      sharedStatusLabel: '共享中（原型阶段）',
      lastEditorName: findLastEditorName(item.id, usersById),
      route: getModuleHomeRoute({ moduleInstanceId: item.id, entry: 'shared-space' }),
    }));
}

function resetModuleDataForTest() {
  storage.remove(storage.STORAGE_KEYS.MODULE_INSTANCES);
  storage.remove(storage.STORAGE_KEYS.CYCLE_RECORDS);
  storage.remove(storage.STORAGE_KEYS.SHARED_SPACES);
  storage.remove(storage.STORAGE_KEYS.MEMBERSHIPS);
}

module.exports = {
  ensureSeededModuleData,
  getModuleInstanceById,
  listModulesForOwner,
  listSharedModules,
  getModuleHomeRoute,
  resetModuleDataForTest,
};

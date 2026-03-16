const { createCycleRecord } = require('../models/cycle-record');
const { createModuleInstance, MODULE_INSTANCE_STATES } = require('../models/module-instance');
const { createMembership, createSharedSpace, MEMBERSHIP_ROLES } = require('../models/shared-space');
const { STORAGE_KEYS } = require('../services/storage');

const BASE_TIMESTAMP = '2026-03-16T09:00:00Z';

const users = {
  owner: {
    id: 'user-owner',
    displayName: '小满',
  },
  partner: {
    id: 'user-partner',
    displayName: '阿泽',
  },
};

const moduleInstances = [
  createModuleInstance({
    id: 'module-private-active',
    ownerUserId: users.owner.id,
    name: '我的月经记录',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createModuleInstance({
    id: 'module-private-inactive',
    ownerUserId: users.owner.id,
    name: '历史样例',
    state: MODULE_INSTANCE_STATES.PRIVATE,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createModuleInstance({
    id: 'module-shared',
    ownerUserId: users.owner.id,
    name: '我们的月经记录',
    state: MODULE_INSTANCE_STATES.SHARED,
    sharedSpaceId: 'shared-space-001',
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
];

const sharedSpaces = [
  createSharedSpace({
    id: 'shared-space-001',
    ownerUserId: users.owner.id,
    name: '我们的空间',
    inviteCode: 'LOVE-001',
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
];

const memberships = [
  createMembership({
    id: 'membership-owner',
    sharedSpaceId: 'shared-space-001',
    userId: users.owner.id,
    role: MEMBERSHIP_ROLES.OWNER,
    joinedAt: BASE_TIMESTAMP,
  }),
  createMembership({
    id: 'membership-partner',
    sharedSpaceId: 'shared-space-001',
    userId: users.partner.id,
    role: MEMBERSHIP_ROLES.PARTNER,
    joinedAt: BASE_TIMESTAMP,
  }),
];

const cycleRecords = [
  createCycleRecord({
    id: 'record-active-001',
    moduleInstanceId: 'module-private-active',
    recordDate: '2026-03-14',
    flowLevel: 'medium',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.owner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createCycleRecord({
    id: 'record-inactive-001-d1',
    moduleInstanceId: 'module-private-inactive',
    recordDate: '2026-02-20',
    flowLevel: 'light',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.owner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createCycleRecord({
    id: 'record-inactive-001-d2',
    moduleInstanceId: 'module-private-inactive',
    recordDate: '2026-02-21',
    flowLevel: 'medium',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.owner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createCycleRecord({
    id: 'record-shared-001-d1',
    moduleInstanceId: 'module-shared',
    recordDate: '2026-03-22',
    flowLevel: 'heavy',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.owner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createCycleRecord({
    id: 'record-shared-001-d2',
    moduleInstanceId: 'module-shared',
    recordDate: '2026-03-23',
    flowLevel: 'medium',
    painLevel: 'mild',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.partner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
  createCycleRecord({
    id: 'record-shared-001-d3',
    moduleInstanceId: 'module-shared',
    recordDate: '2026-03-24',
    flowLevel: 'light',
    painLevel: 'moderate',
    notes: '第三天状态平稳',
    createdByUserId: users.owner.id,
    lastEditedByUserId: users.partner.id,
    createdAt: BASE_TIMESTAMP,
    updatedAt: BASE_TIMESTAMP,
  }),
];

const seedCollections = {
  [STORAGE_KEYS.MODULE_INSTANCES]: moduleInstances,
  [STORAGE_KEYS.CYCLE_RECORDS]: cycleRecords,
  [STORAGE_KEYS.SHARED_SPACES]: sharedSpaces,
  [STORAGE_KEYS.MEMBERSHIPS]: memberships,
};

module.exports = {
  BASE_TIMESTAMP,
  seedCollections,
  seedScenarios: {
    privateActive: {
      moduleInstanceId: 'module-private-active',
      today: '2026-03-16',
    },
    privateInactive: {
      moduleInstanceId: 'module-private-inactive',
      today: '2026-03-16',
    },
    sharedWithPartnerEdits: {
      moduleInstanceId: 'module-shared',
      today: '2026-03-16',
      sharedSpaceId: 'shared-space-001',
      lastEditedByUserId: 'user-partner',
    },
  },
  users,
};

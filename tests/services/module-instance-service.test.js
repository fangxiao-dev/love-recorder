const test = require('node:test');
const assert = require('node:assert/strict');

const {
  ensureSeededModuleData,
  listModulesForOwner,
  listSharedModules,
  getModuleHomeRoute,
  resetModuleDataForTest,
} = require('../../services/module-instance-service');

function readModuleIdFromRoute(route) {
  const [, query = ''] = route.split('?');
  const params = new URLSearchParams(query);
  return params.get('moduleInstanceId');
}

test.beforeEach(() => {
  resetModuleDataForTest();
  ensureSeededModuleData();
});

test('lists owner modules with private and shared labels', () => {
  const cards = listModulesForOwner({ ownerUserId: 'user-owner' });

  assert.equal(cards.length, 3);
  assert.equal(cards[0].stateLabel, '私有');
  assert.equal(cards[2].stateLabel, '已共享到我们的空间');
});

test('shared-space list exposes collaboration placeholders and same-instance route', () => {
  const sharedCards = listSharedModules({ sharedSpaceId: 'shared-space-001' });

  assert.equal(sharedCards.length, 1);
  assert.equal(sharedCards[0].sharedStatusLabel, '共享中（原型阶段）');
  assert.equal(sharedCards[0].lastEditorName, '阿泽');

  const moduleRouteFromModules = getModuleHomeRoute({
    moduleInstanceId: 'module-shared',
    entry: 'modules',
  });
  const moduleRouteFromShared = getModuleHomeRoute({
    moduleInstanceId: sharedCards[0].id,
    entry: 'shared-space',
  });

  assert.equal(readModuleIdFromRoute(moduleRouteFromModules), readModuleIdFromRoute(moduleRouteFromShared));
});

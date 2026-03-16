const STORAGE_KEYS = {
  MODULE_INSTANCES: 'love-record/module-instances',
  CYCLE_RECORDS: 'love-record/cycle-records',
  SHARED_SPACES: 'love-record/shared-spaces',
  MEMBERSHIPS: 'love-record/memberships',
  REMINDERS: 'love-record/reminders',
};

function getStorageAdapter() {
  if (typeof wx !== 'undefined' && wx.getStorageSync) {
    return {
      get(key) {
        const value = wx.getStorageSync(key);
        return value === '' ? null : value;
      },
      set(key, value) {
        wx.setStorageSync(key, value);
        return value;
      },
      remove(key) {
        wx.removeStorageSync(key);
      },
    };
  }

  const memoryStore = getStorageAdapter.memoryStore || new Map();
  getStorageAdapter.memoryStore = memoryStore;

  return {
    get(key) {
      return memoryStore.has(key) ? memoryStore.get(key) : null;
    },
    set(key, value) {
      memoryStore.set(key, value);
      return value;
    },
    remove(key) {
      memoryStore.delete(key);
    },
  };
}

function get(key) {
  return getStorageAdapter().get(key);
}

function set(key, value) {
  return getStorageAdapter().set(key, value);
}

function remove(key) {
  return getStorageAdapter().remove(key);
}

function loadSeedData(seedData) {
  Object.keys(seedData).forEach((key) => {
    set(key, seedData[key]);
  });

  return seedData;
}

module.exports = {
  STORAGE_KEYS,
  get,
  set,
  remove,
  loadSeedData,
};

const { ensureSeededModuleData, listModulesForOwner } = require('../../services/module-instance-service');
const { users } = require('../../mock/seed-data');

Page({
  data: {
    pageTitle: '我的模块',
    pageNote: '私有与共享状态都指向同一份模块实例。',
    modules: [],
  },
  onShow() {
    ensureSeededModuleData();
    const modules = listModulesForOwner({ ownerUserId: users.owner.id });
    this.setData({ modules });
  },
  onTapModuleCard(event) {
    const route = event.currentTarget.dataset.route;
    wx.navigateTo({ url: route });
  },
});

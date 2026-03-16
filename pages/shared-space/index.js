const { ensureSeededModuleData, listSharedModules } = require('../../services/module-instance-service');

Page({
  data: {
    pageTitle: '共享空间',
    pageNote: '当前为原型壳，展示共享模块与协作占位信息。',
    inviteNote: '邀请/加入将在云同步阶段接入，当前仅展示流程入口。',
    sharedModules: [],
  },
  onShow() {
    ensureSeededModuleData();
    const sharedModules = listSharedModules({ sharedSpaceId: 'shared-space-001' });
    this.setData({ sharedModules });
  },
  onTapSharedModule(event) {
    const route = event.currentTarget.dataset.route;
    wx.navigateTo({ url: route });
  },
});

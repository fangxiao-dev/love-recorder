const { getModuleHomeViewModel } = require('../../services/module-home-service');

Page({
  data: {
    moduleInstanceId: '',
    entryLabel: '我的模块',
    stateLabel: '',
    moduleName: '月经记录',
    primaryStatusText: '',
    secondaryStatusText: '',
    timelineDays: [],
    quickActions: [],
  },
  onLoad(options) {
    this.options = options || {};
    this.loadPageData();
  },
  onShow() {
    this.loadPageData();
  },
  loadPageData() {
    try {
      const viewModel = getModuleHomeViewModel({
        moduleInstanceId: this.options.moduleInstanceId,
        entry: this.options.entry,
      });
      this.setData(viewModel);
    } catch (error) {
      wx.showToast({
        title: '模块加载失败',
        icon: 'none',
      });
    }
  },
  goToHistory() {
    if (!this.data.moduleInstanceId) {
      wx.showToast({
        title: '缺少模块实例',
        icon: 'none',
      });
      return;
    }

    wx.navigateTo({
      url: `/pages/history/index?moduleInstanceId=${this.data.moduleInstanceId}`,
    });
  },
  onQuickActionTap(event) {
    const action = event.currentTarget.dataset.action;
    const routes = {
      range: `/pages/record-range/index?moduleInstanceId=${this.data.moduleInstanceId}`,
      exception: `/pages/record-exception/index?moduleInstanceId=${this.data.moduleInstanceId}`,
    };

    if (routes[action]) {
      wx.navigateTo({ url: routes[action] });
      return;
    }

    wx.showToast({
      title: '该动作将在 LR-003 接入',
      icon: 'none',
    });
  },
});

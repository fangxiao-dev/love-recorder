Page({
  data: {
    pageTitle: '月经记录',
    pageNote: '当前页展示同实例路由信息，状态卡将在后续任务实现。',
    moduleInstanceId: '',
    entryLabel: '我的模块',
  },
  onLoad(options) {
    const entry = options.entry || 'modules';
    this.setData({
      moduleInstanceId: options.moduleInstanceId || '',
      entryLabel: entry === 'shared-space' ? '共享空间' : '我的模块',
    });
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
});

Page({
  data: {
    title: 'Love Record',
    subtitle: '请从下面入口进入功能页做 UI 验收。',
  },

  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/index',
    });
  },

  goToModuleHome() {
    wx.navigateTo({
      url: '/pages/module-home/index',
    });
  },
});

Page({
  data: {
    title: 'Love Record',
    subtitle: '月经记录 MVP：从我的模块或共享空间进入同一实例。',
  },
  goToModules() {
    wx.navigateTo({ url: '/pages/modules/index' });
  },
  goToSharedSpace() {
    wx.navigateTo({ url: '/pages/shared-space/index' });
  },
});

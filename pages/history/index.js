const { getCycleGroupsByModule } = require('../../services/cycle-record-service');

Page({
  data: {
    pageTitle: '历史记录',
    moduleInstanceId: '',
    cycles: [],
    isEmpty: false,
  },

  onLoad(query) {
    this.setData({
      moduleInstanceId: query.moduleInstanceId || '',
    });
  },

  onShow() {
    if (!this.data.moduleInstanceId) {
      this.setData({
        cycles: [],
        isEmpty: true,
      });
      return;
    }
    this.loadRecords();
  },

  loadRecords() {
    try {
      const cycles = getCycleGroupsByModule(this.data.moduleInstanceId);
      this.setData({
        cycles,
        isEmpty: cycles.length === 0,
      });
    } catch (error) {
      this.setData({
        cycles: [],
        isEmpty: true,
      });
      wx.showToast({
        title: '记录加载失败',
        icon: 'none',
      });
    }
  },

  handleCycleTap(event) {
    const { cycleId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/cycle-detail/index?cycleId=${cycleId}&moduleInstanceId=${this.data.moduleInstanceId}`,
    });
  },
});

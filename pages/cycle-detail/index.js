const { listCycleDays, getCycleGroupsByModule } = require('../../services/cycle-record-service');

Page({
  data: {
    cycleId: '',
    moduleInstanceId: '',
    cycle: null,
    days: [],
    isEmpty: false,
  },

  onLoad(query) {
    this.setData({
      cycleId: query.cycleId || '',
      moduleInstanceId: query.moduleInstanceId || '',
    });
  },

  onShow() {
    this.loadCycleDetail();
  },

  loadCycleDetail() {
    const groups = getCycleGroupsByModule(this.data.moduleInstanceId);
    const cycle = groups.find((item) => item.cycleId === this.data.cycleId) || null;
    const days = cycle ? listCycleDays(this.data.moduleInstanceId, this.data.cycleId) : [];
    this.setData({
      cycle,
      days,
      isEmpty: !cycle || days.length === 0,
    });
  },

  handleDayTap(event) {
    const { recordId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/record-editor/index?recordId=${recordId}&moduleInstanceId=${this.data.moduleInstanceId}&cycleId=${this.data.cycleId}`,
    });
  },
});

const { getModuleHomeViewModel } = require('../../services/module-home-service');
const {
  ValidationError,
  recordCycleEnd,
  recordCycleStart,
} = require('../../services/cycle-record-service');

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

    if (!this.data.moduleInstanceId) {
      wx.showToast({
        title: '缺少模块实例',
        icon: 'none',
      });
      return;
    }

    try {
      if (action === 'start') {
        recordCycleStart(this.data.moduleInstanceId, {
          editorUserId: 'user-owner',
        });
      } else if (action === 'end') {
        recordCycleEnd(this.data.moduleInstanceId, {
          editorUserId: 'user-owner',
        });
      } else {
        wx.showToast({
          title: '暂不支持该动作',
          icon: 'none',
        });
        return;
      }

      this.loadPageData();
      wx.showToast({
        title: action === 'start' ? '已记录开始' : '已记录结束',
        icon: 'success',
      });
    } catch (error) {
      const title = error instanceof ValidationError ? error.message : '保存失败，请重试';
      wx.showToast({
        title,
        icon: 'none',
      });
    }
  },
});

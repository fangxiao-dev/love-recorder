const { getModuleHomeViewModel } = require('../../services/module-home-service');
const {
  createCycleRangeRecord,
  markCycleEnd,
  markCycleStart,
} = require('../../services/cycle-record-service');
const { DAY_IN_MS, formatDate, parseDateString } = require('../../utils/date');

function addDays(dateString, offset) {
  return formatDate(new Date(parseDateString(dateString).getTime() + offset * DAY_IN_MS));
}

function getCycleWindowStartDate(anchorDate) {
  return addDays(anchorDate, -10);
}

function getTodayDate() {
  return formatDate(new Date());
}

Page({
  data: {
    moduleInstanceId: '',
    entryLabel: '我的模块',
    stateLabel: '',
    moduleName: '月经记录',
    primaryStatusText: '',
    secondaryStatusText: '',
    weekdayLabels: ['日', '一', '二', '三', '四', '五', '六'],
    calendarMode: 'cycle-window',
    cycleWindow: null,
    monthView: null,
    cycleWindowStartDate: '',
    monthCursor: '',
    selectedDate: '',
    selectedDatePanel: null,
    isRangeSelectionMode: false,
    rangeSelectionStart: '',
    rangeSelectionEnd: '',
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
        calendarMode: this.data.calendarMode,
        cycleWindowStartDate: this.data.cycleWindowStartDate || undefined,
        monthCursor: this.data.monthCursor || undefined,
        selectedDate: this.data.selectedDate || undefined,
        rangeSelectionStart: this.data.rangeSelectionStart || undefined,
        rangeSelectionEnd: this.data.rangeSelectionEnd || undefined,
      });
      this.setData({
        ...viewModel,
        cycleWindowStartDate: viewModel.cycleWindow ? viewModel.cycleWindow.startDate : '',
        monthCursor: viewModel.monthView ? viewModel.monthView.monthKey : '',
        selectedDate: viewModel.selectedDate || '',
      });
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
  onCalendarModeTap(event) {
    const mode = event.currentTarget.dataset.mode;
    if (!mode || mode === this.data.calendarMode) {
      return;
    }

    this.setData({ calendarMode: mode }, () => {
      this.loadPageData();
    });
  },
  onCycleWindowStep(event) {
    const startDate = event.currentTarget.dataset.startDate;
    if (!startDate) {
      return;
    }

    this.setData(
      {
        calendarMode: 'cycle-window',
        cycleWindowStartDate: startDate,
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onCycleJumpTap(event) {
    const target = event.currentTarget.dataset.target;
    const anchorDate = this.data.cycleWindow && this.data.cycleWindow.jumpTargets
      ? this.data.cycleWindow.jumpTargets[target]
      : '';

    if (!anchorDate) {
      wx.showToast({
        title: '暂无可跳转日期',
        icon: 'none',
      });
      return;
    }

    this.setData(
      {
        calendarMode: 'cycle-window',
        cycleWindowStartDate: getCycleWindowStartDate(anchorDate),
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onMonthStep(event) {
    const monthKey = event.currentTarget.dataset.monthKey;
    if (!monthKey) {
      return;
    }

    this.setData(
      {
        calendarMode: 'month',
        monthCursor: monthKey,
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onCalendarDayTap(event) {
    const date = event.currentTarget.dataset.date;
    if (!date) {
      return;
    }

    if (this.data.isRangeSelectionMode) {
      this.handleRangeDateTap(date);
      return;
    }

    this.setData({ selectedDate: date }, () => {
      this.loadPageData();
    });
  },
  handleRangeDateTap(date) {
    const { rangeSelectionStart, rangeSelectionEnd } = this.data;

    if (!rangeSelectionStart || (rangeSelectionStart && rangeSelectionEnd)) {
      this.setData(
        {
          selectedDate: date,
          rangeSelectionStart: date,
          rangeSelectionEnd: '',
        },
        () => {
          this.loadPageData();
        }
      );
      return;
    }

    if (date < rangeSelectionStart) {
      this.setData(
        {
          selectedDate: date,
          rangeSelectionStart: date,
          rangeSelectionEnd: rangeSelectionStart,
        },
        () => {
          this.loadPageData();
        }
      );
      return;
    }

    this.setData(
      {
        selectedDate: date,
        rangeSelectionEnd: date,
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onSelectedPanelAction(event) {
    const action = event.currentTarget.dataset.action;
    const selectedDate = this.data.selectedDate || formatDate(new Date());

    try {
      if (action === 'start') {
        markCycleStart(this.data.moduleInstanceId, selectedDate, 'user-owner', {
          today: getTodayDate(),
        });
        this.afterMutation('已记录月经开始');
        return;
      }

      if (action === 'end-yes') {
        markCycleEnd(this.data.moduleInstanceId, selectedDate, 'user-owner', {
          today: getTodayDate(),
        });
        this.afterMutation('已记录月经结束');
        return;
      }

      if (action === 'end-no') {
        wx.showToast({
          title: '保持进行中',
          icon: 'none',
        });
        return;
      }

      if (action === 'exception') {
        wx.navigateTo({
          url: `/pages/record-exception/index?moduleInstanceId=${this.data.moduleInstanceId}&recordDate=${selectedDate}`,
        });
      }
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '保存失败',
        icon: 'none',
      });
    }
  },
  onRangeCancel() {
    this.setData(
      {
        isRangeSelectionMode: false,
        rangeSelectionStart: '',
        rangeSelectionEnd: '',
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onRangeSave() {
    const { rangeSelectionStart, rangeSelectionEnd } = this.data;
    if (!rangeSelectionStart || !rangeSelectionEnd) {
      wx.showToast({
        title: '请选择开始和结束日期',
        icon: 'none',
      });
      return;
    }

    try {
      createCycleRangeRecord(
        this.data.moduleInstanceId,
        rangeSelectionStart,
        rangeSelectionEnd,
        'user-owner',
        {
          today: getTodayDate(),
        }
      );
      this.setData({
        isRangeSelectionMode: false,
        selectedDate: rangeSelectionEnd,
        rangeSelectionStart: '',
        rangeSelectionEnd: '',
      });
      this.afterMutation('补录完成');
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '补录失败',
        icon: 'none',
      });
    }
  },
  afterMutation(title) {
    wx.showToast({
      title,
      icon: 'success',
    });
    this.loadPageData();
  },
  onQuickActionTap(event) {
    const action = event.currentTarget.dataset.action;

    if (action === 'start') {
      this.setData({ selectedDate: formatDate(new Date()) }, () => {
        this.onSelectedPanelAction({
          currentTarget: {
            dataset: {
              action: 'start',
            },
          },
        });
      });
      return;
    }

    if (action === 'end') {
      this.setData({ selectedDate: formatDate(new Date()) }, () => {
        this.onSelectedPanelAction({
          currentTarget: {
            dataset: {
              action: 'end-yes',
            },
          },
        });
      });
      return;
    }

    if (action === 'range') {
      this.setData({
        isRangeSelectionMode: true,
        rangeSelectionStart: '',
        rangeSelectionEnd: '',
      });
      return;
    }

    if (action === 'exception') {
      this.onSelectedPanelAction({
        currentTarget: {
          dataset: {
            action: 'exception',
          },
        },
      });
      return;
    }
  },
  onEnterRangeMode() {
    const selectedDate = this.data.selectedDate || formatDate(new Date());
    this.setData(
      {
        isRangeSelectionMode: true,
        selectedDate,
        rangeSelectionStart: selectedDate,
        rangeSelectionEnd: '',
      },
      () => {
        this.loadPageData();
      }
    );
  },
});

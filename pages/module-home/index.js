const { getModuleHomeViewModel } = require('../../services/module-home-service');
const {
  clearDayRecord,
  saveDayRecord,
  saveNormalDayRecord,
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

function isFutureDate(date) {
  return date > getTodayDate();
}

function toggleDateInList(list, date, shouldSelect) {
  const set = new Set(list || []);
  if (shouldSelect) {
    set.add(date);
  } else {
    set.delete(date);
  }
  return [...set].sort();
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
    selectionDragMode: '',
    selectionAnchorDate: '',
    selectedDates: [],
    touchedDates: [],
    flowOptions: ['', 'light', 'medium', 'heavy'],
    painOptions: ['', 'none', 'mild', 'moderate', 'severe'],
    colorOptions: ['', 'normal', 'dark', 'bright'],
    panelFlowIndex: 0,
    panelPainIndex: 0,
    panelColorIndex: 0,
    panelNotes: '',
    timelineDays: [],
    cycleWindowDayRects: [],
    lastFutureToastAt: 0,
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
        isRangeSelectionMode: this.data.isRangeSelectionMode,
        selectionDragMode: this.data.selectionDragMode || undefined,
        selectionAnchorDate: this.data.selectionAnchorDate || undefined,
        selectedDates: this.data.selectedDates,
      });
      const panelState = this.buildPanelFormState(viewModel.selectedDatePanel);
      this.setData({
        ...viewModel,
        cycleWindowStartDate: viewModel.cycleWindow ? viewModel.cycleWindow.startDate : '',
        monthCursor: viewModel.monthView ? viewModel.monthView.monthKey : '',
        selectedDate: viewModel.selectedDate || '',
        ...panelState,
      }, () => {
        this.captureCycleWindowDayRects();
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

    if (isFutureDate(date)) {
      this.showFutureDateToast();
      return;
    }

    if (this.data.isRangeSelectionMode) {
      this.toggleSingleSelectedDate(date);
      return;
    }

    this.setData({ selectedDate: date }, () => {
      this.loadPageData();
    });
  },
  onCalendarDayLongPress(event) {
    const date = event.currentTarget.dataset.date;
    if (!date || this.data.calendarMode !== 'cycle-window') {
      return;
    }
    if (isFutureDate(date)) {
      this.showFutureDateToast();
      return;
    }

    const initialSelectedDates = this.data.isRangeSelectionMode
      ? this.data.selectedDates
      : this.getVisiblePeriodDates();
    const isCurrentlySelected = initialSelectedDates.includes(date);
    const dragMode = isCurrentlySelected ? 'deselect' : 'select';

    this.setData(
      {
        isRangeSelectionMode: true,
        selectedDate: date,
        selectionAnchorDate: date,
        selectionDragMode: dragMode,
        selectedDates: toggleDateInList(initialSelectedDates, date, dragMode === 'select'),
        touchedDates: toggleDateInList(this.data.touchedDates, date, true),
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onCalendarTouchMove(event) {
    if (!this.data.isRangeSelectionMode) {
      return;
    }
    const touch = event.touches && event.touches[0];
    if (!touch || !this.data.selectionDragMode) {
      return;
    }
    const date = this.findDateByTouchPoint(touch.clientX, touch.clientY);
    if (!date) {
      return;
    }
    if (isFutureDate(date)) {
      this.showFutureDateToast();
      return;
    }
    this.applyDragSelection(date);
  },
  applyDragSelection(date) {
    const shouldSelect = this.data.selectionDragMode === 'select';
    this.setData(
      {
        selectedDate: date,
        selectedDates: toggleDateInList(this.data.selectedDates, date, shouldSelect),
        touchedDates: toggleDateInList(this.data.touchedDates, date, true),
      },
      () => {
        this.loadPageData();
      }
    );
  },
  toggleSingleSelectedDate(date) {
    const shouldSelect = !this.data.selectedDates.includes(date);
    this.setData(
      {
        selectedDate: date,
        selectedDates: toggleDateInList(this.data.selectedDates, date, shouldSelect),
        touchedDates: toggleDateInList(this.data.touchedDates, date, true),
      },
      () => {
        this.loadPageData();
      }
    );
  },
  getVisiblePeriodDates() {
    const weeks = this.data.cycleWindow && this.data.cycleWindow.weeks ? this.data.cycleWindow.weeks : [];
    return weeks
      .flatMap((week) => week.days)
      .filter((day) => day.isPeriod)
      .map((day) => day.date)
      .sort();
  },
  captureCycleWindowDayRects() {
    if (typeof wx === 'undefined' || !wx.createSelectorQuery || this.data.calendarMode !== 'cycle-window') {
      return;
    }
    const dates = ((this.data.cycleWindow && this.data.cycleWindow.weeks) || [])
      .flatMap((week) => week.days)
      .map((day) => day.date);
    if (!dates.length) {
      return;
    }
    wx.createSelectorQuery()
      .in(this)
      .selectAll('.cycle-window-day')
      .boundingClientRect((rects) => {
        if (!rects || !rects.length) {
          return;
        }
        const cycleWindowDayRects = rects.map((rect, index) => ({
          date: dates[index],
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        }));
        this.setData({ cycleWindowDayRects });
      })
      .exec();
  },
  findDateByTouchPoint(x, y) {
    const match = (this.data.cycleWindowDayRects || []).find(
      (rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
    return match ? match.date : '';
  },
  findOptionIndex(options, value) {
    const index = options.findIndex((item) => item === value);
    return index >= 0 ? index : 0;
  },
  buildPanelFormState(selectedDatePanel) {
    if (!selectedDatePanel) {
      return {};
    }

    const fieldMap = Object.fromEntries(
      (selectedDatePanel.attributeFields || []).map((field) => [field.key, field.rawValue || ''])
    );

    return {
      panelFlowIndex: this.findOptionIndex(this.data.flowOptions, fieldMap.flowLevel || ''),
      panelPainIndex: this.findOptionIndex(this.data.painOptions, fieldMap.painLevel || ''),
      panelColorIndex: this.findOptionIndex(this.data.colorOptions, fieldMap.colorLevel || ''),
      panelNotes: fieldMap.notes || '',
    };
  },
  onSelectedPanelAction(event) {
    const action = event.currentTarget.dataset.action;
    const selectedDate = this.data.selectedDate || formatDate(new Date());

    try {
      if (action === 'mark-normal') {
        saveNormalDayRecord(this.data.moduleInstanceId, {
          recordDate: selectedDate,
          editorUserId: 'user-owner',
        });
        this.afterMutation('已记录月经正常');
        return;
      }

      if (action === 'set-period') {
        if (this.data.selectedDatePanel && this.data.selectedDatePanel.bleedingState === 'period') {
          clearDayRecord(this.data.moduleInstanceId, selectedDate);
          this.afterMutation('已清除记录');
          return;
        }
        saveDayRecord(this.data.moduleInstanceId, {
          recordDate: selectedDate,
          bleedingState: 'period',
          flowLevel: this.data.flowOptions[this.data.panelFlowIndex] || null,
          painLevel: this.data.painOptions[this.data.panelPainIndex] || null,
          colorLevel: this.data.colorOptions[this.data.panelColorIndex] || null,
          notes: this.data.panelNotes || '',
          editorUserId: 'user-owner',
        });
        this.afterMutation('已设为经期');
        return;
      }

      if (action === 'set-special') {
        if (this.data.selectedDatePanel && this.data.selectedDatePanel.bleedingState === 'special') {
          clearDayRecord(this.data.moduleInstanceId, selectedDate);
          this.afterMutation('已清除记录');
          return;
        }
        saveDayRecord(this.data.moduleInstanceId, {
          recordDate: selectedDate,
          bleedingState: 'special',
          flowLevel: this.data.flowOptions[this.data.panelFlowIndex] || null,
          painLevel: this.data.painOptions[this.data.panelPainIndex] || null,
          colorLevel: this.data.colorOptions[this.data.panelColorIndex] || null,
          notes: this.data.panelNotes || '',
          editorUserId: 'user-owner',
        });
        this.afterMutation('已设为特殊');
        return;
      }

      if (action === 'clear-record') {
        clearDayRecord(this.data.moduleInstanceId, selectedDate);
        this.afterMutation('已清除记录');
        return;
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
        selectionDragMode: '',
        selectionAnchorDate: '',
        selectedDates: [],
        touchedDates: [],
      },
      () => {
        this.loadPageData();
      }
    );
  },
  onRangeSave() {
    if (!this.data.touchedDates.length) {
      wx.showToast({
        title: '请先滑动或点选日期',
        icon: 'none',
      });
      return;
    }

    try {
      this.data.touchedDates.forEach((date) => {
        if (this.data.selectedDates.includes(date)) {
          saveNormalDayRecord(this.data.moduleInstanceId, {
            recordDate: date,
            editorUserId: 'user-owner',
          });
          return;
        }
        clearDayRecord(this.data.moduleInstanceId, date);
      });
      this.setData({
        isRangeSelectionMode: false,
        selectionDragMode: '',
        selectionAnchorDate: '',
        selectedDates: [],
        touchedDates: [],
      });
      this.afterMutation('批量编辑完成');
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '批量编辑失败',
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
  onPanelPickerChange(event) {
    const field = event.currentTarget.dataset.field;
    const index = Number(event.detail.value);
    const next = {};
    if (field === 'flow') {
      next.panelFlowIndex = index;
    } else if (field === 'pain') {
      next.panelPainIndex = index;
    } else if (field === 'color') {
      next.panelColorIndex = index;
    }
    this.setData(next, () => {
      this.persistPanelAttributes();
    });
  },
  onPanelNotesInput(event) {
    this.setData({
      panelNotes: event.detail.value,
    });
  },
  onPanelNotesBlur() {
    this.persistPanelAttributes();
  },
  showFutureDateToast() {
    const now = Date.now();
    if (now - this.data.lastFutureToastAt < 600) {
      return;
    }
    this.setData({ lastFutureToastAt: now });
    wx.showToast({
      title: '未来日期暂不支持记录',
      icon: 'none',
    });
  },
  persistPanelAttributes() {
    const selectedDate = this.data.selectedDate;
    const panel = this.data.selectedDatePanel;
    if (!selectedDate || !panel || panel.bleedingState === 'none') {
      return;
    }

    try {
      saveDayRecord(this.data.moduleInstanceId, {
        recordDate: selectedDate,
        bleedingState: panel.bleedingState,
        flowLevel: this.data.flowOptions[this.data.panelFlowIndex] || null,
        painLevel: this.data.painOptions[this.data.panelPainIndex] || null,
        colorLevel: this.data.colorOptions[this.data.panelColorIndex] || null,
        notes: this.data.panelNotes || '',
        editorUserId: 'user-owner',
      });
      this.loadPageData();
    } catch (error) {
      wx.showToast({
        title: error && error.message ? error.message : '属性保存失败',
        icon: 'none',
      });
    }
  },
  onCalendarTouchEnd() {
    if (!this.data.isRangeSelectionMode) {
      return;
    }
    this.setData({
      selectionAnchorDate: '',
    });
  },
});

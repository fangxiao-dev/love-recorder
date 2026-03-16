Page({
  data: {
    pageTitle: '补录一段',
    pageNote: '按连续日期补录一段历史记录。',
    moduleInstanceId: '',
    startDate: '',
    endDate: '',
    errorMessage: '',
  },

  onLoad(query) {
    this.setData({
      moduleInstanceId: query.moduleInstanceId || '',
    });
  },

  handleDateChange(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [field]: event.detail.value,
      errorMessage: '',
    });
  },

  handleSave() {
    const { ValidationError, createCycleRange } = require('../../services/cycle-record-service');

    try {
      createCycleRange(this.data.moduleInstanceId, {
        startDate: this.data.startDate,
        endDate: this.data.endDate,
        editorUserId: 'user-owner',
      });

      wx.showToast({
        title: '补录成功',
        icon: 'success',
      });
      wx.navigateBack();
    } catch (error) {
      const errorMessage = error instanceof ValidationError ? error.message : '补录失败，请重试';
      this.setData({ errorMessage });
    }
  },
});

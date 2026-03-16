const { formatDate } = require('../../utils/date');
const {
  ValidationError,
  getCycleRecordByDate,
  saveCycleException,
} = require('../../services/cycle-record-service');

Page({
  data: {
    pageTitle: '记录异常',
    pageNote: '只补充需要说明的异常信息，其他字段都可留空。',
    moduleInstanceId: '',
    recordDate: '',
    flowLevel: '',
    painLevel: '',
    notes: '',
    errorMessage: '',
    flowOptions: ['', 'light', 'medium', 'heavy'],
    painOptions: ['', 'mild', 'moderate', 'severe'],
    flowIndex: 0,
    painIndex: 0,
  },

  onLoad(query) {
    const moduleInstanceId = query.moduleInstanceId || '';
    const recordDate = formatDate(new Date());
    const existing = getCycleRecordByDate(moduleInstanceId, recordDate);

    this.setData({
      moduleInstanceId,
      recordDate,
      flowLevel: existing ? existing.flowLevel || '' : '',
      painLevel: existing ? existing.painLevel || '' : '',
      notes: existing ? existing.notes || '' : '',
      flowIndex: this.findOptionIndex(this.data.flowOptions, existing ? existing.flowLevel || '' : ''),
      painIndex: this.findOptionIndex(this.data.painOptions, existing ? existing.painLevel || '' : ''),
    });
  },

  findOptionIndex(options, value) {
    const index = options.findIndex((item) => item === value);
    return index >= 0 ? index : 0;
  },

  handleDateChange(event) {
    const recordDate = event.detail.value;
    const existing = getCycleRecordByDate(this.data.moduleInstanceId, recordDate);
    this.setData({
      recordDate,
      flowLevel: existing ? existing.flowLevel || '' : '',
      painLevel: existing ? existing.painLevel || '' : '',
      notes: existing ? existing.notes || '' : '',
      flowIndex: this.findOptionIndex(this.data.flowOptions, existing ? existing.flowLevel || '' : ''),
      painIndex: this.findOptionIndex(this.data.painOptions, existing ? existing.painLevel || '' : ''),
      errorMessage: '',
    });
  },

  handleFlowChange(event) {
    const flowIndex = Number(event.detail.value);
    this.setData({
      flowIndex,
      flowLevel: this.data.flowOptions[flowIndex] || '',
      errorMessage: '',
    });
  },

  handlePainChange(event) {
    const painIndex = Number(event.detail.value);
    this.setData({
      painIndex,
      painLevel: this.data.painOptions[painIndex] || '',
      errorMessage: '',
    });
  },

  handleInputChange(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [field]: event.detail.value,
      errorMessage: '',
    });
  },

  handleSave() {
    try {
      saveCycleException(this.data.moduleInstanceId, {
        recordDate: this.data.recordDate,
        flowLevel: this.data.flowLevel || null,
        painLevel: this.data.painLevel || null,
        notes: this.data.notes || '',
        editorUserId: 'user-owner',
      });

      wx.showToast({
        title: '保存成功',
        icon: 'success',
      });
      wx.navigateBack();
    } catch (error) {
      const errorMessage = error instanceof ValidationError ? error.message : '保存失败，请重试';
      this.setData({ errorMessage });
    }
  },
});

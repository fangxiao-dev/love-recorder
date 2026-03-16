const {
  ValidationError,
  getCycleRecordById,
  updateCycleRecord,
} = require('../../services/cycle-record-service');

Page({
  data: {
    recordId: '',
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
    const recordId = query.recordId || '';
    const moduleInstanceId = query.moduleInstanceId || '';
    const record = getCycleRecordById(recordId);

    if (!record) {
      this.setData({ errorMessage: '记录不存在' });
      return;
    }

    this.setData({
      recordId,
      moduleInstanceId,
      recordDate: record.recordDate,
      flowLevel: record.flowLevel || '',
      painLevel: record.painLevel || '',
      notes: record.notes || '',
      flowIndex: this.findOptionIndex(this.data.flowOptions, record.flowLevel || ''),
      painIndex: this.findOptionIndex(this.data.painOptions, record.painLevel || ''),
    });
  },

  findOptionIndex(options, value) {
    const index = options.findIndex((item) => item === value);
    return index >= 0 ? index : 0;
  },

  handleDateChange(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [field]: event.detail.value,
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
      updateCycleRecord(
        this.data.recordId,
        {
          recordDate: this.data.recordDate,
          flowLevel: this.data.flowLevel || null,
          painLevel: this.data.painLevel || null,
          notes: this.data.notes || '',
        },
        'user-owner'
      );

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

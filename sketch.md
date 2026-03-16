以下为 **微信小程序「月经记录」PRD v1.0（精简可执行版）**

---

# 1. 项目概述

## 1.1 目标

构建一个轻量级微信小程序，用于：

- 记录月经相关数据
- 支持双人共享
- 默认共享视图
- 无广告、无内容社区
- 仅数据记录与预测

## 1.2 使用范围

- 初期仅限两人使用
- 不对外公开运营
- 不考虑商业化

---

# 2. 用户角色模型

## 2.1 用户（User）

- 使用微信登录（openid）
- 可创建或加入情侣组
- 可拥有或不拥有自己的记录卡片（profile）

## 2.2 情侣组（Couple）

- 一个 couple_id
- 可包含 1–2 个成员
- 可包含 0–2 个活跃卡片（profiles）

---

# 3. 核心概念

| 概念 | 说明 |
| --- | --- |
| Membership | 是否属于某个情侣组 |
| Profile（卡片） | 被记录的对象 |
| Cycle Record | 单次月经周期数据 |
| Shared Dashboard | 情侣组首页 |

---

# 4. 功能需求

---

## 4.1 登录

### FR-1 微信登录

- 用户进入小程序自动获取 openid
- 自动创建 users 记录（若不存在）

---

## 4.2 情侣组管理

### FR-2 创建情侣组

- 任意用户可创建情侣组
- 生成 couple_id
- 自动成为该组成员

### FR-3 邀请绑定

- 生成邀请码或二维码
- 另一方输入/扫码后加入
- 加入后进入共享模式

### FR-4 退出情侣组

- 删除当前用户的 membership
- 退出后：
    - 不再进入共享
    - 不显示共享卡片
    - 不影响已有数据

---

## 4.3 卡片（Profile）管理

### FR-5 初始化自己的卡片

- 用户可选择创建自己的 profile
- 记录性别、昵称（可选）

### FR-6 删除我的卡片

- 将自己的 profile 设为 inactive
- 不影响 membership
- 仍可查看/编辑对方卡片

---

## 4.4 共享仪表盘

### FR-7 默认进入共享视图

- 条件：存在 membership
- 页面显示：
    - 所有 active profiles
    - 最多两张卡片并排展示

### 卡片内容包含：

- 最近一次开始日期
- 本次持续天数
- 下次预测日期
- 简要疼痛/流量指标
- 进入按钮

---

## 4.5 Profile 页面

### FR-8 编辑目标规则

- 打开哪个 profile
- 所有写入都作用于该 profile_id

### FR-9 只读/编辑开关

- 进入 TA Profile 默认只读
- 用户可手动切换为编辑模式
- 切换前需显式点击

### FR-10 记录内容

每次周期记录包含：

- start_date
- end_date
- duration_days（自动计算）
- flow_level（1–5）
- color（枚举）
- pain_level（0–10）
- notes（可选）

---

# 5. 数据结构

## 5.1 couples

```
{
  couple_id,
  created_at
}
```

## 5.2 couple_members

```
{
  couple_id,
  openid,
  role: "editor",
  status: "active" | "inactive",
  created_at
}
```

## 5.3 profiles

```
{
  profile_id,
  couple_id,
  owner_openid,
  display_name,
  sex,
  is_active,
  created_at
}
```

## 5.4 cycle_records

```
{
  record_id,
  couple_id,
  profile_id,
  start_date,
  end_date,
  duration_days,
  flow_level,
  color,
  pain_level,
  notes,
  created_at,
  updated_at
}
```

---

# 6. 权限规则

## 读权限

- 若用户在 couple_members 中属于该 couple_id
- 可读取该情侣组下所有 profiles 与 records

## 写权限

- 用户可编辑该情侣组下任意 profile 数据
- 但前端默认进入 TA 时为只读

## 删除权限

- 用户只能删除自己的 profile
- 用户只能退出自己的 membership

---

# 7. 预测逻辑（v1）

- 取最近 3–6 次周期长度
- 使用平均值
- 预测 = 上次开始日 + 平均周期
- 展示 ±2 天浮动范围

---

# 8. 页面结构

1. 登录页（自动）
2. 情侣组页（创建 / 加入）
3. Shared Dashboard（默认）
4. Profile 页面
5. 记录编辑页
6. 设置页（退出情侣组）

---

# 9. 非功能性要求

- 界面极简
- 无社区内容
- 无广告
- 数据结构可扩展
- 可后续增加怀孕模式/统计分析模式

---

# 10. 状态流总结

用户进入 →

有 membership → Shared Dashboard →

点某个卡片 → Profile →

切编辑 → 写入该 profile →

可删除自己的卡片 →

可退出情侣组

---
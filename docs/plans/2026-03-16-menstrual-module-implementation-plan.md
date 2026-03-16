# WeChat Mini Program Shared Menstrual Module Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a WeChat Mini Program MVP for a menstrual tracking module that works for a single user and can later be shared into a collaborative space.

**Architecture:** Start with a native WeChat Mini Program scaffold and model the product around a user-owned module instance that can optionally be mounted into a shared space. Keep the first release focused on fast record entry, a status-first homepage, and a lightweight collaboration layer that exposes shared visibility and last editor metadata.

**Tech Stack:** Native WeChat Mini Program, JavaScript/TypeScript as chosen during scaffold, WeChat storage/cloud capability to be selected during project bootstrap

---

### Task 1: Bootstrap the mini program project

**Files:**
- Create: `app.js`
- Create: `app.json`
- Create: `app.wxss`
- Create: `project.config.json`
- Create: `sitemap.json`
- Create: `pages/index/index.js`
- Create: `pages/index/index.wxml`
- Create: `pages/index/index.wxss`

**Step 1: Decide the scaffold mode**

Choose one:
- Native JavaScript mini program
- Native TypeScript mini program

**Step 2: Create the minimal app shell**

Create the base app files and a single landing page that can render in WeChat DevTools.

**Step 3: Run in WeChat DevTools**

Run: Open the project in WeChat DevTools
Expected: App boots and renders the landing page without runtime errors

**Step 4: Commit**

```bash
git add app.js app.json app.wxss project.config.json sitemap.json pages/index/index.js pages/index/index.wxml pages/index/index.wxss
git commit -m "chore: bootstrap WeChat mini program shell"
```

### Task 2: Define the domain model for module instances and shared spaces

**Files:**
- Create: `models/module-instance.js`
- Create: `models/shared-space.js`
- Create: `models/cycle-record.js`
- Create: `utils/date.js`
- Test: `tests/models/module-instance.spec.md`

**Step 1: Write the expected data shapes**

Document exact fields for:
- user-owned module instance
- shared space
- membership/access
- cycle record

**Step 2: Implement the model helpers**

Add helpers for:
- computing current cycle day
- computing days since last start
- computing predicted next window from recent cycles

**Step 3: Verify helper behavior manually**

Run: exercise helper functions in DevTools or node-compatible test harness
Expected: known sample inputs produce correct cycle-day and prediction outputs

**Step 4: Commit**

```bash
git add models/module-instance.js models/shared-space.js models/cycle-record.js utils/date.js tests/models/module-instance.spec.md
git commit -m "feat: define menstrual module domain model"
```

### Task 3: Build the status-first module homepage

**Files:**
- Create: `pages/module-home/index.js`
- Create: `pages/module-home/index.wxml`
- Create: `pages/module-home/index.wxss`
- Modify: `app.json`

**Step 1: Render the state card**

Show:
- "经期中第 X 天"
- or "距离上次开始第 X 天"
- predicted next window as secondary text

**Step 2: Render the rolling 30-45 day timeline**

Display:
- recorded cycle segments
- today marker
- predicted window marker

**Step 3: Add quick actions**

Include buttons for:
- 今天来了
- 今天结束了
- 补录一段
- 记录异常

**Step 4: Verify in DevTools**

Run: preview the page with seeded mock data
Expected: status and timeline update correctly for active-cycle and non-active-cycle examples

**Step 5: Commit**

```bash
git add pages/module-home/index.js pages/module-home/index.wxml pages/module-home/index.wxss app.json
git commit -m "feat: add status-first menstrual module homepage"
```

### Task 4: Implement one-tap record actions

**Files:**
- Modify: `pages/module-home/index.js`
- Create: `services/cycle-record-service.js`
- Create: `pages/record-range/index.js`
- Create: `pages/record-range/index.wxml`
- Create: `pages/record-range/index.wxss`

**Step 1: Implement "今天来了"**

When tapped, create a record whose start date is today, then refresh homepage state immediately.

**Step 2: Implement "今天结束了"**

When tapped, patch the active record with today's end date, then refresh homepage state immediately.

**Step 3: Implement "补录一段"**

Create a range-selection page that lets the user select a continuous historical segment in one action.

**Step 4: Verify in DevTools**

Run: test each quick action against mock data
Expected:
- start action creates an active cycle
- end action closes the active cycle
- backfill creates a historical range

**Step 5: Commit**

```bash
git add pages/module-home/index.js services/cycle-record-service.js pages/record-range/index.js pages/record-range/index.wxml pages/record-range/index.wxss
git commit -m "feat: add quick menstrual recording flows"
```

### Task 5: Add optional abnormal detail capture

**Files:**
- Create: `pages/record-exception/index.js`
- Create: `pages/record-exception/index.wxml`
- Create: `pages/record-exception/index.wxss`
- Modify: `services/cycle-record-service.js`

**Step 1: Build the lightweight abnormal-entry form**

Support optional fields for:
- flow level
- pain level
- notes

**Step 2: Keep defaults minimal**

Do not require optional fields to save.

**Step 3: Verify save/update behavior**

Run: save entries with empty and filled optional fields
Expected: both flows succeed and preserve record integrity

**Step 4: Commit**

```bash
git add pages/record-exception/index.js pages/record-exception/index.wxml pages/record-exception/index.wxss services/cycle-record-service.js
git commit -m "feat: add lightweight abnormal detail capture"
```

### Task 6: Build "My Modules" and shared-state labeling

**Files:**
- Create: `pages/modules/index.js`
- Create: `pages/modules/index.wxml`
- Create: `pages/modules/index.wxss`
- Create: `services/module-instance-service.js`

**Step 1: Render the module list**

Show the menstrual module card with one of these states:
- 私有
- 已共享到我们的空间

**Step 2: Route card clicks to the same module instance**

Ensure the module card always navigates into the same underlying module detail page.

**Step 3: Verify state changes**

Run: toggle seeded module data between private and shared
Expected: the label updates without changing the module identity

**Step 4: Commit**

```bash
git add pages/modules/index.js pages/modules/index.wxml pages/modules/index.wxss services/module-instance-service.js
git commit -m "feat: add modules page with shared-state labeling"
```

### Task 7: Add shared space entry and collaboration metadata

**Files:**
- Create: `pages/shared-space/index.js`
- Create: `pages/shared-space/index.wxml`
- Create: `pages/shared-space/index.wxss`
- Modify: `pages/module-home/index.wxml`
- Modify: `services/module-instance-service.js`

**Step 1: Build the shared-space entry page**

Display:
- shared modules in the space
- simple invitation/join placeholder

**Step 2: Add collaboration metadata**

Show:
- shared status
- last editor identity

**Step 3: Verify same-instance behavior**

Run: open the same module from "我的模块" and from "共享空间"
Expected: both routes display the same record data and metadata

**Step 4: Commit**

```bash
git add pages/shared-space/index.js pages/shared-space/index.wxml pages/shared-space/index.wxss pages/module-home/index.wxml services/module-instance-service.js
git commit -m "feat: add shared-space entry and collaboration metadata"
```

### Task 8: Add persistence and seedable local data

**Files:**
- Create: `services/storage.js`
- Modify: `services/cycle-record-service.js`
- Modify: `services/module-instance-service.js`
- Create: `mock/seed-data.js`

**Step 1: Implement local persistence**

Use mini program storage to persist:
- module instances
- cycle records
- shared state metadata

**Step 2: Add seed data support**

Support deterministic sample data to test:
- private mode
- shared mode
- active cycle
- inactive cycle

**Step 3: Verify persistence**

Run: add/update records, reload app
Expected: saved state survives reload and seed mode remains optional

**Step 4: Commit**

```bash
git add services/storage.js services/cycle-record-service.js services/module-instance-service.js mock/seed-data.js
git commit -m "feat: persist menstrual module state locally"
```

### Task 9: Add lightweight reminder settings placeholder

**Files:**
- Create: `pages/reminders/index.js`
- Create: `pages/reminders/index.wxml`
- Create: `pages/reminders/index.wxss`
- Modify: `pages/module-home/index.wxml`

**Step 1: Build reminder settings UI**

Support placeholders for:
- predicted-start reminder
- care reminder after start

**Step 2: Keep backend requirements out of MVP**

Store settings only; do not implement complex notification orchestration yet.

**Step 3: Verify settings flow**

Run: save and reload reminder settings
Expected: choices persist and render correctly

**Step 4: Commit**

```bash
git add pages/reminders/index.js pages/reminders/index.wxml pages/reminders/index.wxss pages/module-home/index.wxml
git commit -m "feat: add reminder settings placeholder"
```

### Task 10: Validate UX against MVP boundaries

**Files:**
- Modify: `docs/plans/2026-03-16-menstrual-module-design.md`
- Create: `docs/checklists/mvp-acceptance.md`

**Step 1: Write acceptance checks**

Include checks for:
- single-user flow
- share-state labeling
- one-tap start/end actions
- backfill range entry
- same-instance behavior across personal and shared views

**Step 2: Execute manual verification**

Run: manual walkthrough in WeChat DevTools
Expected: all acceptance items pass without dead-end navigation

**Step 3: Commit**

```bash
git add docs/plans/2026-03-16-menstrual-module-design.md docs/checklists/mvp-acceptance.md
git commit -m "docs: add MVP acceptance checklist"
```

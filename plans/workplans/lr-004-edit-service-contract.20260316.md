# LR-004 Edit Service Contract

## Scope
Contract for history list + record editor in prototype phase. Keep storage local-first and preserve record identity.

## Service Surface
`services/cycle-record-service.js`

### `listRecordsByModule(moduleInstanceId)`
- Input:
  - `moduleInstanceId: string`
- Output:
  - `CycleRecord[]` sorted by `startDate` desc, then `createdAt` desc.
- Rules:
  - return `[]` if module has no records.

### `getRecordById(recordId)`
- Input:
  - `recordId: string`
- Output:
  - `CycleRecord | null`

### `updateRecord(recordId, patch, actorUserId)`
- Input:
  - `recordId: string`
  - `patch: { startDate?, endDate?, flowLevel?, painLevel?, notes? }`
  - `actorUserId: string`
- Output:
  - `{ ok: true, record } | { ok: false, code, message }`
- Validation:
  - reject if `recordId` not found (`NOT_FOUND`).
  - reject if `startDate` becomes empty (`INVALID_START_DATE`).
  - reject if `endDate < startDate` (`INVALID_DATE_RANGE`).
  - reject if `flowLevel` or `painLevel` outside enum (`INVALID_ENUM`).
- Side effects:
  - preserve original `id`, `createdByUserId`, `createdAt`.
  - set `lastEditedByUserId = actorUserId`.
  - set `updatedAt = now`.
  - persist to storage key `STORAGE_KEYS.CYCLE_RECORDS`.

## UI Integration Expectations
- History page:
  - read via `listRecordsByModule`.
  - navigate with `recordId` only.
- Editor page:
  - load via `getRecordById`.
  - save via `updateRecord`.
  - show blocking validation error for invalid range.

## Compatibility Notes
- Must remain compatible with existing `models/cycle-record.js`.
- No new required fields are introduced in LR-004.

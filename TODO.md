# TODO - Project Health Check

## Issues Found
1. [ ] `src/utils/timezone.ts:60-66` - `compareTimeStrings` returns milliseconds instead of -1/0/1
2. [ ] `src/validators/schedule.schemas.ts:167-170` - Missing `.default()` values for priority and is_featured

## Fixes Applied
- [ ] Fix `compareTimeStrings` to return proper comparison values
- [ ] Add `.default()` values to `addScheduleItemsSchema` fields

## Verification
- [ ] Run `npm test` to confirm all tests pass


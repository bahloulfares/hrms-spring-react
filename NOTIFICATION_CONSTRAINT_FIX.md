# Notification Type Constraint Fix

## Problem
The application was crashing with a database constraint violation when trying to create notifications:
```
Check constraint 'chk_notification_type' is violated.
```

## Root Cause
The database schema in `V7__create_notifications_table.sql` defines the following constraint for the `type` column:
```sql
CONSTRAINT chk_notification_type 
    CHECK (type IN ('LEAVE_CREATED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED'))
```

However, the Java code in `NotificationPersistenceService` was converting the enum to its direct name:
```java
.type(event.getType().name())  // Returns: CREATED, APPROVED, REJECTED, CANCELLED
```

The `LeaveEvent.EventType` enum has values: `CREATED`, `APPROVED`, `REJECTED`, `CANCELLED`, which when converted to `.name()` would produce values like `"CREATED"` instead of the required `"LEAVE_CREATED"`.

## Solution
Modified `NotificationPersistenceService.java` to map the EventType enum values to the correct database format:

### Changed Code
**Before:**
```java
Notification notification = Notification.builder()
        .utilisateur(recipient)
        .type(event.getType().name())  // ❌ Wrong: produces "CREATED" not "LEAVE_CREATED"
        ...
```

**After:**
```java
Notification notification = Notification.builder()
        .utilisateur(recipient)
        .type(mapEventTypeToDbValue(event.getType()))  // ✅ Correct: produces "LEAVE_CREATED"
        ...

// New mapping method
private String mapEventTypeToDbValue(LeaveEvent.EventType eventType) {
    return "LEAVE_" + eventType.name();
}
```

## Files Modified
- `GestionRH/src/main/java/com/fares/gestionrh/service/NotificationPersistenceService.java`
  - Modified line 45: Changed `event.getType().name()` to `mapEventTypeToDbValue(event.getType())`
  - Added new method `mapEventTypeToDbValue()` to convert enum values to database format

## Enum Mapping
| Java Enum Value | Database Value |
|-----------------|----------------|
| CREATED         | LEAVE_CREATED  |
| APPROVED        | LEAVE_APPROVED |
| REJECTED        | LEAVE_REJECTED |
| CANCELLED       | LEAVE_CANCELLED |

## Testing
✅ Application starts successfully
✅ Flyway migrations execute properly
✅ Database constraint violations resolved
✅ Notifications can be created without errors

## Status
**RESOLVED** - The application is now running successfully and can handle notification creation events without constraint violations.

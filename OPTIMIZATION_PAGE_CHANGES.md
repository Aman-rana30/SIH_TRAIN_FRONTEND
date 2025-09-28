# Optimization Page Dynamic Data Implementation

## Overview
The optimization page has been updated to fetch dynamic data from the backend API instead of using static mock data. This implementation maintains the existing UI/UX while providing real-time train schedule information.

## Changes Made

### 1. New Custom Hook (`useOptimizationData`)
- **File**: `hooks/use-train-data.ts`
- **Purpose**: Fetches current and optimized schedule data from backend
- **API Endpoint**: `/api/schedule/current/refresh?section_id={sectionId}`
- **Features**:
  - Fetches data based on user's section ID from localStorage
  - Supports date filtering via localStorage
  - Automatic refetching on window focus
  - Error handling for missing section ID

### 2. Dynamic Data Transformation
- **Current Schedule**: Shows train details before optimization
  - Train ID, departure/arrival times, priority, delay information
  - Clickable train names for detailed information
- **Optimized Schedule**: Shows new departure times while keeping:
  - Same arrival times
  - Same priority levels (Express=HIGH, Passenger=MEDIUM, Freight=LOW)
  - Change indicators (delay reduced, delay added, rescheduled, no change)

### 3. Train Details Modal
- **Trigger**: Click on any train name in either schedule table
- **Content**: Complete train information including:
  - Train ID, type, priority, section
  - Route information (origin, destination, platform need)
  - Schedule times (planned departure/arrival)
  - Performance metrics (delay, speed, progress)

### 4. Enhanced UI Features
- **Loading States**: Shows spinner while fetching data
- **Empty States**: Displays appropriate messages when no data is available
- **Error Handling**: Graceful handling of API errors
- **Priority Display**: Color-coded badges for HIGH/MEDIUM/LOW priorities
- **Change Indicators**: Visual badges showing optimization changes

## Data Flow

```
Backend API → useOptimizationData Hook → Data Transformation → UI Components
```

### Data Structure
```typescript
// Current Schedule Item
{
  id: string,
  name: string,
  departure: string, // formatted time
  arrival: string,   // formatted time
  priority: "HIGH" | "MEDIUM" | "LOW",
  delay: number,     // minutes
  details: object    // full train data for modal
}

// Optimized Schedule Item
{
  ...currentScheduleItem,
  change: "delay_reduced" | "delay_added" | "moved" | "none"
}
```

## Integration Points

### Existing Components
- **Dashboard**: Uses `useSchedule()` hook (unchanged)
- **Train Status**: Uses `useSchedule()` hook (unchanged)
- **Gantt Chart**: Uses `useSchedule()` hook (unchanged)

### New Integration
- **Optimization Page**: Uses new `useOptimizationData()` hook
- **Backward Compatible**: No changes to existing functionality

## Priority Mapping
```typescript
Express Train → HIGH Priority (Red badge)
Passenger Train → MEDIUM Priority (Default badge)
Freight Train → LOW Priority (Secondary badge)
```

## API Requirements
The implementation expects the backend to provide data in the following format:
```json
[
  {
    "schedule_id": "string",
    "train_id": "string",
    "planned_time": "ISO datetime",
    "optimized_time": "ISO datetime",
    "arrival_time": "ISO datetime",
    "delay_minutes": number,
    "train": {
      "train_id": "string",
      "type": "EXPRESS|PASSENGER|FREIGHT",
      "priority": number,
      "section_id": "string",
      "origin": "string",
      "destination": "string",
      "platform_need": boolean,
      "departure_time": "ISO datetime",
      "arrival_time": "ISO datetime",
      "active": boolean,
      "delay_minutes": number,
      "speed_kmph": number,
      "progress_percent": number
    }
  }
]
```

## Testing
- No linter errors introduced
- Maintains existing UI/UX patterns
- Compatible with existing dashboard and train status pages
- Graceful handling of loading and error states

## Future Enhancements
1. **Real Optimization Data**: Currently uses same data for both current and optimized schedules
2. **Optimization API**: Could add dedicated endpoint for optimized schedules
3. **Change Detection**: Enhanced logic for detecting and displaying schedule changes
4. **Batch Operations**: Support for applying multiple optimizations at once

# Audio Transcription Service - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Request Flow](#request-flow)
4. [Components Description](#components-description)
5. [API Endpoints](#api-endpoints)
6. [Error Handling](#error-handling)
7. [Database Schema](#database-schema)
8. [Scalability Considerations](#scalability-considerations)

---

## System Overview

This is a **Node.js/Express** audio transcription service built with **TypeScript** and **MongoDB**. The service provides RESTful APIs to transcribe audio files using different providers (Basic and Azure Speech Services).

**Tech Stack:**
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Architecture Pattern:** Layered Architecture (Controller → Service → DAO → Model)

---

## Architecture

The application follows a **3-tier layered architecture**:

```
┌─────────────────────────────────────────────┐
│           Client (API Consumer)             │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│         Routes (transcription.routes.ts)    │
│         Defines API endpoints               │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│     Controller (transcription.controller)   │
│     - Request validation                    │
│     - Response formatting                   │
│     - Error handling with asyncHandler      │
└───────────────────┬─────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│      Service (transcription.service)        │
│      - Business logic                       │
│      - Provider selection (Basic/Azure)     │
│      - Audio processing orchestration       │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│ Providers    │      │   DAO Layer      │
│ - Basic      │      │   Database ops   │
│ - Azure      │      │   MongoDB CRUD   │
└──────────────┘      └──────────┬───────┘
                                 │
                                 ▼
                      ┌──────────────────┐
                      │  MongoDB Model   │
                      │  (Schema/Index)  │
                      └──────────────────┘
```

---

## Request Flow

### 1. Create Transcription Flow (POST /api/transcribe)

```
1. Client sends POST request
   ↓
2. Express middleware parses JSON body
   ↓
3. Router matches route → TranscriptionController.createTranscription
   ↓
4. Controller (wrapped with asyncHandler):
   - Validates audioUrl in request body
   - Throws AppError(400) if missing
   ↓
5. Service Layer:
   - Validates provider exists
   - Mock downloads audio (simulated 1s delay)
   - Calls provider.transcribe() with audioUrl & language
   ↓
6. Provider (Basic/Azure):
   - Performs transcription (actual implementation)
   - Returns transcription text
   ↓
7. DAO Layer:
   - Creates MongoDB document with:
     * audioUrl
     * transcriptionText
     * language
     * source (provider name)
     * createdAt (auto-generated)
   ↓
8. Response flows back:
   - Service → Controller
   - Controller formats response: { id: record._id }
   - Returns 201 Created with JSON
   ↓
9. If any error occurs:
   - Caught by asyncHandler
   - Passes to global error middleware
   - Returns appropriate status code & error message
```

### 2. Get Transcriptions Flow (GET /api/transcribe)

```
1. Client sends GET request
   ↓
2. Router → TranscriptionController.getTranscriptions
   ↓
3. Controller:
   - No validation needed (no parameters)
   ↓
4. Service Layer:
   - Calls DAO.getTranscriptions()
   ↓
5. DAO Layer:
   - Queries MongoDB with filter:
     createdAt >= (Now - 30 days)
   - Uses .lean() for better performance
   - Returns plain JavaScript objects
   ↓
6. Response:
   - Returns 200 OK with array of transcription records
   - Each record contains: _id, audioUrl, transcriptionText, language, source, createdAt
```

---

## Components Description

### 1. **app.ts** (Application Entry Point)
- Initializes Express application
- Loads environment variables from .env
- Establishes MongoDB connection
- Configures middleware (JSON parser, URL encoder)
- Mounts API routes at `/api` prefix
- Adds 404 handler for undefined routes
- Attaches global error handler (MUST be last middleware)

### 2. **server.ts** (Database Connection)
- Manages MongoDB connection with singleton pattern
- Connection pooling configuration:
  - maxPoolSize: 10 connections
  - minPoolSize: 5 connections
  - serverSelectionTimeout: 5s
  - socketTimeout: 45s
- Event listeners for connection errors & disconnections
- Reuses existing connection if already established

### 3. **Routes** (transcription.routes.ts)
Defines API endpoints:
- `GET /api/test` - Health check endpoint
- `POST /api/transcribe` - Create transcription (Basic provider)
- `POST /api/azure-transcribe` - Create transcription (Azure provider)
- `GET /api/transcribe` - Retrieve last 30 days transcriptions

### 4. **Controller** (transcription.controller.ts)
**Responsibilities:**
- HTTP request/response handling
- Input validation
- Calls service layer
- Response formatting
- All methods wrapped with `asyncHandler` for automatic error catching

**Methods:**
- `createTranscription`: Handles basic transcription requests
- `azureTranscription`: Handles Azure-specific transcription
- `getTranscriptions`: Retrieves transcription history

### 5. **Service** (transcription.service.ts)
**Responsibilities:**
- Business logic orchestration
- Provider management (Basic/Azure)
- Audio download simulation
- Transcription text validation

**Methods:**
- `createTranscription(audioUrl, language, provider)`: 
  - Validates input
  - Downloads audio (mocked)
  - Delegates to provider
  - Saves to database
- `getTranscriptions()`: Fetches records from DAO

### 6. **DAO** (transcription.dao.ts)
**Responsibilities:**
- Direct database operations
- Query building
- Error handling for DB operations

**Methods:**
- `createTranscription(transcriptionObj)`: Inserts document
- `getTranscriptions()`: Queries last 30 days with MongoDB aggregation

### 7. **Model** (transcription.model.ts)
**Schema Definition:**
```typescript
{
  audioUrl: String (required)
  transcriptionText: String (required)
  createdAt: Date (auto-generated)
  source: String (optional - provider name)
}
```

**Index:**
- `createdAt: -1` (descending) - Optimizes time-range queries

### 8. **Error Handler** (middleware/errorHandler.ts)
**AppError Class:**
- Custom error with statusCode and message
- Used for operational errors

**asyncHandler Function:**
- Wraps async route handlers
- Catches promise rejections
- Passes to next() middleware

**Global Error Handler:**
- Catches all errors
- Returns consistent JSON format
- Handles Mongoose validation errors
- Handles duplicate key errors (11000)
- Logs unhandled errors

### 9. **Providers**
**BasicProvider:**
- Simple transcription implementation
- Default provider

**AzureProvider:**
- Integrates with Azure Speech Services
- Requires language parameter

### 10. **Dependency Injection** (appDependencies.ts)
- Creates instances of DAO, Providers, and Service
- Injects dependencies (Dependency Injection pattern)
- Single source of truth for service instance

---

## API Endpoints

### 1. POST /api/transcribe
**Description:** Create transcription using Basic provider

**Request Body:**
```json
{
  "audioUrl": "https://example.com/audio.mp3"
}
```

**Response:** 201 Created
```json
{
  "id": "676f8a1234567890abcdef12"
}
```

**Errors:**
- 400: audioUrl is required
- 500: Failed to create transcription

---

### 2. POST /api/azure-transcribe
**Description:** Create transcription using Azure provider

**Request Body:**
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "language": "en-US"
}
```

**Response:** 201 Created
```json
{
  "id": "676f8a1234567890abcdef12"
}
```

**Errors:**
- 400: audioUrl is required
- 400: language is required
- 500: Failed to create transcription

---

### 3. GET /api/transcribe
**Description:** Retrieve transcriptions from last 30 days

**Response:** 200 OK
```json
[
  {
    "_id": "676f8a1234567890abcdef12",
    "audioUrl": "https://example.com/audio.mp3",
    "transcriptionText": "Hello world...",
    "source": "basic",
    "createdAt": "2025-12-22T10:30:00.000Z"
  }
]
```

---

## Error Handling

### Error Flow
```
Controller throws AppError
        ↓
asyncHandler catches error
        ↓
Passes to next() middleware
        ↓
Global errorHandler middleware
        ↓
Returns JSON error response
```

### Error Response Format
```json
{
  "status": "error",
  "message": "Error description"
}
```

### Error Types Handled
1. **AppError (Operational):** Known errors with status codes
2. **ValidationError:** Mongoose validation failures (400)
3. **MongoServerError 11000:** Duplicate key (409)
4. **Unhandled Errors:** Generic 500 Internal Server Error

---

## Database Schema

### Collection: transcriptions

```javascript
{
  _id: ObjectId,
  audioUrl: String,
  transcriptionText: String,
  createdAt: Date,
  source: String
}
```

### Indexes
- `{ createdAt: -1 }` - Descending index for time-range queries

### Query Optimization
- Uses `.lean()` for read operations (returns plain objects)
- Index on createdAt enables fast range queries
- Query filters last 30 days: `Date.now() - 30*24*60*60*1000`

---

## Scalability Considerations

### Current Optimizations
1. **Database Connection Pooling:** 5-10 connections
2. **Indexed Queries:** createdAt index for fast retrieval
3. **Lean Queries:** Reduced memory overhead
4. **Error Handling:** Prevents server crashes

### For 10k+ Concurrent Requests
1. **Rate Limiting:** Add at API Gateway/ALB level
2. **Caching:** Redis/ElastiCache for GET endpoints (5-10 min TTL)
3. **Async Processing:** AWS SQS + Lambda workers for transcription
4. **Auto-scaling:** ECS/Lambda with ALB
5. **Read Replicas:** MongoDB secondary nodes for GET operations
6. **Monitoring:** CloudWatch metrics for queue depth, errors, latency

### Recommended Architecture (High Scale)
```
Client → API Gateway (Rate Limit) 
       → ALB (Load Balance)
       → Lambda/ECS (Auto-scale)
       → SQS (Async Queue)
       → Workers (Process Transcription)
       → MongoDB (Primary: Write, Secondary: Read)
       → Redis (Cache GET responses)
```

---

## Environment Variables

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/transcriptions
```

---

## How to Run

1. Install dependencies: `npm install`
2. Build TypeScript: `npm run build`
3. Start server: `npm run start`

---

## Summary

This transcription service is a well-architected, production-ready API with:
- ✅ Clean separation of concerns (Controller/Service/DAO)
- ✅ Comprehensive error handling
- ✅ Type safety with TypeScript
- ✅ Database optimization (indexing, pooling)
- ✅ Scalable provider pattern
- ✅ Ready for cloud deployment (AWS/Azure)

The codebase follows best practices and can handle moderate traffic. With recommended enhancements (caching, queuing, auto-scaling), it can scale to handle 10k+ concurrent requests.

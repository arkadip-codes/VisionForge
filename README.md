# VisionForge AR --- Miner Safety Trainer

VisionForge AR is an **offline-first, AR-based gamified safety training
platform for mine workers**. It allows workers to practice
hazard-response scenarios in an immersive environment, make decisions,
receive scores, and earn certification based on their performance.

The platform is designed for mining environments where **internet
connectivity may be unreliable or unavailable**.

## Architecture

``` text
WORKER MOBILE APP
Flutter
  ↓
Google ARCore
  ↓
Scenario / Game
  ↓
Result Screen
  ↓
SQLite Local Database
Attempts + Sync Status
  ↓
Internet Available
  ↓
FastAPI REST API
  ↓
PostgreSQL
  ↓
SUPERVISOR PANEL

Training Assets:
Training Assets → AWS S3 → Worker App → Local Storage → ARCore
```

## Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Mobile App              Flutter                 Application UI and
                                                  worker experience

  AR                      Google ARCore           Augmented-reality
                                                  training scenarios

  Local Database          SQLite                  Offline storage of
                                                  attempts and local data

  Authentication          Firebase Authentication Worker and supervisor
                                                  authentication

  Backend                 FastAPI                 REST API,
                                                  synchronization,
                                                  validation and business
                                                  logic

  Database                PostgreSQL              Central persistent
                                                  storage

  Asset Storage           Amazon S3               Storage of 3D models
                                                  and training assets
  -----------------------------------------------------------------------

## Offline-First Workflow

The worker does not need continuous internet connectivity during
training.

### 1. Training Asset Preparation

Training assets such as:

-   3D models
-   Textures
-   Animations
-   Scenario resources
-   Other required training media

are uploaded to **Amazon S3**.

The mobile application downloads the required assets and stores them
locally.

### 2. Offline Training

``` text
Select Scenario
      ↓
Load Local AR Assets
      ↓
Start Training
      ↓
Interact with Hazards
      ↓
Make Decisions
      ↓
Calculate Result
```

Training can continue without an internet connection.

### 3. Local Attempt Storage

After a scenario is completed, the result is saved to SQLite.

A typical attempt can contain:

``` text
attempt_id
worker_id
scenario_id
score
decisions
timestamp
sync_status
```

Example synchronization states:

``` text
PENDING → SYNCING → SYNCED
```

If synchronization fails, the attempt remains locally stored and can be
retried later.

### 4. Synchronization

When connectivity returns:

``` text
SQLite
  ↓
Pending Attempts
  ↓
FastAPI REST API
  ↓
PostgreSQL
```

After successful synchronization, the local attempt is marked as
`SYNCED`.

Each attempt should have a **unique `attempt_id`** so that retrying a
request does not create duplicate records.

## FastAPI REST Backend

FastAPI is the Python framework used to build the REST API.

It acts as the middle layer between the mobile/supervisor applications
and PostgreSQL.

Responsibilities include:

-   REST API endpoints
-   Authentication-token verification
-   Request validation
-   Offline synchronization
-   Attempt processing
-   Score calculation
-   Training/business rules
-   Certification eligibility
-   Worker progress retrieval
-   Supervisor data retrieval

Example operations:

``` text
POST /sync
GET  /workers/{id}/progress
GET  /workers/{id}/attempts
GET  /workers/{id}/certificate
```

## PostgreSQL

PostgreSQL is the **central source of truth** for online application
data.

Logical entities may include:

``` text
Workers
Scenarios
Attempts
Certificates
```

SQLite is used for local/offline storage, while PostgreSQL stores the
centralized online records.

## Authentication

Firebase Authentication handles user authentication.

``` text
Worker / Supervisor
        ↓
Firebase Authentication
        ↓
Authentication Token
        ↓
FastAPI
        ↓
PostgreSQL
```

FastAPI verifies the authentication token before processing protected
requests.

## Certification

Certification is implemented as backend business logic rather than as a
separate service.

Example:

``` text
Training Attempt
      ↓
Score Calculation
      ↓
Score ≥ 60% ?
   ↙          ↘
 YES           NO
  ↓             ↓
Eligible     Not Eligible
  ↓
Certificate Record
  ↓
PostgreSQL
```

The certification threshold and rules can be changed according to
project requirements.

## Supervisor Panel

The supervisor panel provides centralized visibility into worker
performance.

Features can include:

-   Worker progress
-   Completed scenarios
-   Attempt history
-   Scores
-   Mistakes / incorrect decisions
-   Certification eligibility
-   Certificate status

The supervisor panel communicates with FastAPI and does not access
PostgreSQL directly.

``` text
Supervisor Panel
      ↓
FastAPI REST API
      ↓
PostgreSQL
```

## Amazon S3

Amazon S3 is used specifically for **training asset storage**.

Examples include:

``` text
3D models
Textures
Animations
Scenario assets
Training media
```

The important data separation is:

``` text
TRAINING ASSETS

AWS S3
  ↓
Worker App
  ↓
Local Asset Storage
  ↓
ARCore


WORKER TRAINING DATA

Worker App
  ↓
SQLite
  ↓
FastAPI
  ↓
PostgreSQL
  ↓
Supervisor Panel
```

## Why Offline-First?

Mining environments can have:

-   Poor network coverage
-   Intermittent connectivity
-   Network outages
-   Restricted connectivity in operational areas

Therefore, continuous server connectivity should not be required for the
actual training experience.

Workers can complete training offline, and their results synchronize
when connectivity becomes available.

## Core Design Principles

### Offline Capability

Training continues even without internet connectivity.

### Reliable Synchronization

Pending attempts are retried until they are successfully synchronized.

### Idempotent Synchronization

Unique attempt IDs help prevent duplicate records when requests are
retried.

### Centralized Source of Truth

PostgreSQL stores the authoritative online records used by supervisors.

### Separation of Responsibilities

-   **Flutter** → Mobile application and UI
-   **ARCore** → AR functionality
-   **SQLite** → Local/offline data
-   **FastAPI** → REST API and business logic
-   **PostgreSQL** → Central database
-   **Firebase Authentication** → Authentication
-   **Amazon S3** → Training assets

## End-to-End Flow

``` text
Training Assets
      ↓
    AWS S3
      ↓
Worker Mobile App
      ↓
Google ARCore
      ↓
Offline Training
      ↓
SQLite
      ↓
Internet Reconnection
      ↓
FastAPI REST API
      ↓
PostgreSQL
      ↓
Supervisor Panel
      ↓
Progress / Attempts / Certification
```

## Future Improvements

Potential future additions include:

-   CDN delivery for large-scale asset distribution
-   More advanced synchronization conflict handling
-   Detailed training analytics
-   Additional safety scenarios
-   Multi-language support
-   Improved certificate generation
-   Infrastructure monitoring and logging
-   More granular role-based access control

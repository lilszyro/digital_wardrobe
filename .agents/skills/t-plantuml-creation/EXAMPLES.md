# PlantUML Diagram Examples

This guide provides concrete, copy-pasteable templates for the most common diagram types.

## 1. C4 Container Diagram (Architecture)

Use this to show how different applications (e.g. Next.js, Expo, FastAPI) and databases interact.

```plantuml
@startuml c4_containers
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

LAYOUT_WITH_LEGEND()

title System Architecture Container Diagram

Person(member, "Gym Member", "Views timetable, books classes, and tracks attendance.")
Person(instructor, "Instructor", "Checks in students and manages attendance.")

System_Boundary(prodanx, "ProDanX Platform") {
    Container(mobile, "Expo Mobile App", "React Native", "Provides member timetable, RSVP actions, and notifications.")
    Container(web, "Next.js Web Portal", "React / Tailwind", "Admin panels, instructor rosters, and public timetable.")
    Container(api, "FastAPI Backend", "Python / FastAPI", "Core API, tenant routing, and business logic plugins.")
    ContainerDb(db, "PostgreSQL Database", "PostgreSQL", "Stores core auth, tenant data, booking events, and RSVPs.")
}

Rel(member, mobile, "Uses")
Rel(instructor, web, "Uses")
Rel(mobile, api, "API Requests (JSON/HTTPS)")
Rel(web, api, "API Requests (JSON/HTTPS)")
Rel(api, db, "Reads/Writes (SQL/SQLAlchemy)")
@enduml
```

## 2. Sequence Diagram (Complex Workflows)

Use this to detail the step-by-step communication pattern, especially asynchronous operations like enqueuing background tasks.

```plantuml
@startuml booking_flow
skinparam ParticipantPadding 10
skinparam BoxPadding 10
skinparam MaxMessageSize 150

box "Client" #LightBlue
participant "Expo App / Web" as Client
end box

box "Backend Plugin" #LightYellow
participant "API Router" as API
participant "Booking Service" as Service
database "Postgres DB" as DB
end box

box "Core Background Jobs" #LightPink
participant "Job Dispatcher" as Jobs
participant "ARQ Worker" as Worker
end box

Client -> API : POST /events/{id}/rsvp {"status": "yes"}
activate API
API -> Service : submit_rsvp(event_id, user_id, status)
activate Service

Service -> DB : get_event_by_id()
activate DB
DB --> Service : Event data (capacity check)
deactivate DB

Service -> DB : upsert_rsvp()
activate DB
DB --> Service : RSVP saved
deactivate DB

Service -> Jobs : enqueue(dispatch_push_for_message)
activate Jobs
Jobs --> Service : Job ID enqueued (Redis)
deactivate Jobs

Service --> API : RSVPSummary
deactivate Service
API --> Client : RSVPSummaryResponse
deactivate API

... Async Background execution ...

Worker -> Jobs : Poll for enqueued jobs
activate Worker
Worker -> Worker : Execute dispatch_push_for_message
deactivate Worker
@enduml
```

## 3. State Diagram (Object Lifecycles)

Use this to document state changes of models (e.g. RSVPs, payment transactions, booking slots).

```plantuml
@startuml rsvp_state_machine
title RSVP State Transitions

[*] --> NO_RSVP : Event Published

state NO_RSVP {
    [*] --> Idle
}

NO_RSVP --> YES : Click "Going" / spots_remaining > 0
NO_RSVP --> MAYBE : Click "Maybe"
NO_RSVP --> NO : Click "Not Going"

YES --> NO : Cancel booking / Click "Not Going"
YES --> MAYBE : Change to "Maybe"

MAYBE --> YES : Click "Going" / spots_remaining > 0
MAYBE --> NO : Click "Not Going"

NO --> YES : Click "Going" / spots_remaining > 0
NO --> MAYBE : Click "Maybe"

state YES {
    [*] --> Booked
}
@enduml
```

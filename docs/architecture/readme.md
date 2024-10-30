# MTC Architecture

## Table of Contents
- [Messaging](./messaging/messaging.md)
- [Message Schemas](./messaging/message-schemas.md)
- [Check Submission](./messaging/check-submission/readme.md)
- [PS-Report](./ps-report/psychometric-report-data-sourcing.md)


## Ubiquitous Language

| Term                | Definition                                                                  |
|---------------------|-----------------------------------------------------------------------------|
| Check Form          | A set of 25 questions from the 1-12 times tables, stored in CSV format. |
| Check Window        | A timeframe to define when the pupil check can be taken by schools. |
| Check / Pupil Check | The process where a pupil is shown a check form, question by question, with 6 seconds to answer each question, with a 2 second interval. |
| Try-it-Out Check    | A practice version of the Pupil Check.  No answers are submitted, and all telemetry and events are disposed upon completion |
| Live Check          | The formal version of the Pupil Check.  All answers and events are recorded and submitted on completion |
| Test Developer      | A business role that creates check forms and assigns them to check windows.             |
| Service Manager      | A business role that runs the MTC service and typically performs administrative tasks related to the service.    |
| Service Manager      | A business role that runs the MTC service and has the most senior priveliges within the system.    |
| STA Admin      | A business role that performs a small set of priveliged tasks within the system, typically for Pupils and Schools.    |
| Psychometrician     | A business role that specialises in the creation of Check Forms and the interpretation of the resulting data from a Pupil Check.  |
| PS-Report           | A data source that is used by Psychometricians to analyse user behaviours when taking the pupil check.  |
| Restart      | When a Live Check is spoiled and the Pupil needs to retake it.    |
| Check Submission      | When a Pupil has completed the Live Check and the payload is submitted to the back-end for processing.    |

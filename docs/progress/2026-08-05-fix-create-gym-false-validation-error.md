# 2026-08-05 — Fix create-gym false VALIDATION_ERROR

- POST `/gym-orgs` 201 body has no `isOwner`; adapter required it → Zod fail → calm “check details” after a successful create.
- Split create vs list schemas; default `isOwner: true` for creator; only send optional contact fields when set.

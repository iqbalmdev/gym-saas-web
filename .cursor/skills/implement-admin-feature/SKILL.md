---
name: implement-admin-feature
description: Alias for Admin slices. Prefer implement-feature.
---

# Implement Admin feature

Follow `.cursor/skills/implement-feature/SKILL.md` with **persona = Admin**.

Place UI under `(admin)` / `components/admin`. Keep `lib/*` persona-agnostic.

Honor `state-management.mdc`: server owns roster/renewals/CRM rows; Zustand only for shared Admin UI chrome when needed.

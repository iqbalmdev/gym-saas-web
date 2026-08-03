---
name: implement-admin-feature
description: Alias for Admin slices. Prefer implement-feature. Use when building Admin-only web features (renewals, CRM, roster, desk, plans).
---

# Implement Admin feature

This skill delegates to the multi-persona workflow.

1. Follow `.cursor/skills/implement-feature/SKILL.md` with **persona = Admin**.
2. Place UI under `(admin)` / `components/admin` per `docs/architecture-plan.md` §5–§6.
3. Keep shared `lib/*` persona-agnostic for future Trainer/Client web.

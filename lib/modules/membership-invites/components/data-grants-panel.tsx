"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { updateMyDataGrantsAction } from "@/lib/modules/membership-invites/membership-invites-actions";
import type {
  MyDataGrants,
  OptionalClassGrant,
  OptionalProfileAttribute,
} from "@/lib/modules/membership-invites/membership-invites-ports";

type DataGrantsPanelProps = {
  gymOrgId: string;
  gymName?: string;
  dataGrants: MyDataGrants;
};

const REQUIRED_PROFILE = ["DOB", "HEIGHT", "WEIGHT"] as const;

const PROFILE_OPTIONS: { value: OptionalProfileAttribute; label: string }[] = [
  { value: "GENDER", label: "Gender" },
  { value: "MEDICAL_NOTES", label: "Medical notes" },
];

const GRANT_OPTIONS: { value: OptionalClassGrant; label: string }[] = [
  { value: "PROGRESS", label: "Progress" },
  { value: "CALORIES", label: "Calories" },
  { value: "WEARABLES", label: "Wearables" },
  { value: "DIET_PLANS", label: "Diet plans" },
  { value: "WORKOUT_PLANS", label: "Workout plans" },
];

export function DataGrantsPanel({
  gymOrgId,
  gymName,
  dataGrants,
}: DataGrantsPanelProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileAttrs, setProfileAttrs] = useState<OptionalProfileAttribute[]>(
    () =>
      PROFILE_OPTIONS.map((option) => option.value).filter((value) =>
        dataGrants.profileAttributes.includes(value),
      ),
  );
  const [classGrants, setClassGrants] = useState<OptionalClassGrant[]>(() =>
    GRANT_OPTIONS.map((option) => option.value).filter((value) =>
      dataGrants.classGrants.includes(value),
    ),
  );
  const [isPending, startTransition] = useTransition();

  function toggleProfile(value: OptionalProfileAttribute) {
    setProfileAttrs((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function toggleGrant(value: OptionalClassGrant) {
    setClassGrants((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function handleSave() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await updateMyDataGrantsAction({
        gymOrgId,
        optionalProfileAttributes: profileAttrs,
        optionalClassGrants: classGrants,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Sharing preferences saved.");
      router.refresh();
    });
  }

  return (
    <section
      className="space-y-4 rounded-[var(--radius-panel)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-panel)]"
      aria-labelledby="data-grants-heading"
    >
      <div>
        <h2
          id="data-grants-heading"
          className="text-lg font-semibold tracking-tight text-[var(--color-fg)]"
        >
          Data sharing
        </h2>
        <p className="mt-1 text-sm text-[var(--color-fg-muted)]">
          {gymName ? `${gymName} — ` : ""}
          Date of birth, height, and weight stay shared. Toggle optional
          profile fields and class grants.
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
      {success ? (
        <p role="status" className="text-sm text-[var(--color-fg)]">
          {success}
        </p>
      ) : null}

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          Always shared
        </p>
        <p className="text-sm text-[var(--color-fg)]">
          {REQUIRED_PROFILE.join(" · ")}
        </p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          Optional profile
        </legend>
        <div className="flex flex-wrap gap-3">
          {PROFILE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-[var(--color-fg)]"
            >
              <input
                type="checkbox"
                checked={profileAttrs.includes(option.value)}
                onChange={() => toggleProfile(option.value)}
                disabled={isPending}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-[var(--color-fg-muted)]">
          Class grants
        </legend>
        <div className="flex flex-wrap gap-3">
          {GRANT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm text-[var(--color-fg)]"
            >
              <input
                type="checkbox"
                checked={classGrants.includes(option.value)}
                onChange={() => toggleGrant(option.value)}
                disabled={isPending}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <Button type="button" disabled={isPending} onClick={handleSave}>
        {isPending ? "Saving…" : "Save sharing"}
      </Button>
    </section>
  );
}

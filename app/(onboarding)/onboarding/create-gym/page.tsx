import { CreateGymForm } from "@/components/onboarding/create-gym-form";

export default function CreateGymPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-fg)]">
          Create your gym
        </h1>
        <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
          Admin tools unlock after your GymOrg exists. You can update details
          later in Settings.
        </p>
      </div>
      <CreateGymForm />
    </div>
  );
}

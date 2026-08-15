'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createGymOrgAction } from '@/modules/auth/auth-actions';

export function CreateGymForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [timezone, setTimezone] = useState('Asia/Kolkata');
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await createGymOrgAction({
                name,
                contactEmail: contactEmail || undefined,
                timezone,
            });
            if (result && !result.ok) {
                setError(result.message);
                return;
            }
            router.refresh();
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-6 shadow-(--shadow-panel)">
                <div>
                    <label htmlFor="gym-name" className="block text-sm font-medium text-(--color-fg)">
                        Gym name
                    </label>
                    <Input
                        id="gym-name"
                        name="name"
                        required
                        minLength={2}
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-2"
                        placeholder="North Star Fitness"
                    />
                </div>
                <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-(--color-fg)">
                        Contact email <span className="font-normal text-(--color-fg-muted)">(optional)</span>
                    </label>
                    <Input
                        id="contact-email"
                        name="contactEmail"
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="mt-2"
                        placeholder="hello@gym.com"
                    />
                </div>
                <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-(--color-fg)">
                        Timezone
                    </label>
                    <Input
                        id="timezone"
                        name="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="mt-2"
                    />
                    <p className="mt-1 text-xs text-(--color-fg-muted)">Default Asia/Kolkata for India desks.</p>
                </div>
                {error ? (
                    <p className="text-sm text-(--color-danger)" role="alert">
                        {error}
                    </p>
                ) : null}
                <Button type="submit" disabled={isPending || name.trim().length < 2} className="w-full">
                    {isPending ? 'Creating…' : 'Create gym'}
                </Button>
            </div>
        </form>
    );
}

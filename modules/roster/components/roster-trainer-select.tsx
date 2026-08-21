'use client';

import type { ReactElement } from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGymTrainers } from '@/modules/gym-orgs/gym-orgs-hooks';
import type { GymTrainer } from '@/modules/gym-orgs/gym-orgs-ports';

type RosterTrainerSelectProps = {
    memberName: string;
    assignedTrainerId: string | null;
    disabled: boolean;
    onAssign: (trainerProfileId: string) => void;
};

function trainerLabel(trainers: GymTrainer[], trainerProfileId: string): string {
    const trainer = trainers.find((item) => item.trainerProfileId === trainerProfileId);
    return trainer?.name ?? trainerProfileId;
}

export function RosterTrainerSelect({
    memberName,
    assignedTrainerId,
    disabled,
    onAssign,
}: RosterTrainerSelectProps): ReactElement {
    const { data: trainers = [], isPending: isTrainersPending } = useGymTrainers();
    const isDisabled = disabled || isTrainersPending || trainers.length === 0;

    if (!isTrainersPending && trainers.length === 0) {
        return <p className="text-xs text-(--color-fg-muted)">No trainers at this gym yet.</p>;
    }

    return (
        <Select
            value={assignedTrainerId ?? ''}
            onValueChange={(value) => {
                if (!value || value === assignedTrainerId) {
                    return;
                }
                onAssign(value);
            }}
            disabled={isDisabled}
        >
            <SelectTrigger className="w-[11.5rem]" aria-label={`Assign trainer for ${memberName}`}>
                <SelectValue>
                    {(value: string) => {
                        if (!value) {
                            return 'Assign trainer';
                        }
                        return trainerLabel(trainers, value);
                    }}
                </SelectValue>
            </SelectTrigger>
            <SelectContent>
                {trainers.map((trainer) => (
                    <SelectItem key={trainer.trainerProfileId} value={trainer.trainerProfileId}>
                        {trainer.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

import type { ReactElement } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { foodNameFor, type FoodNameMap } from '@/modules/nutrition/nutrition-food-names';
import { formatCalories, formatMacroGrams, formatQuantity, mealSlotLabel } from '@/modules/nutrition/nutrition-labels';
import type { CalorieLog, CalorieLogItem, CalorieLogSlot } from '@/modules/nutrition/nutrition-ports';

type CalorieLogDayProps = {
    calorieLog: CalorieLog;
    foodNames: FoodNameMap;
    /** Omitted for the staff view, which is read-only by design. */
    onRemoveItem?: (itemId: string) => void;
    isRemoving?: boolean;
};

/** Shared by the member's own diary and the CALORIES-gated staff view. */
export function CalorieLogDay({
    calorieLog,
    foodNames,
    onRemoveItem,
    isRemoving = false,
}: CalorieLogDayProps): ReactElement {
    return (
        <div className="space-y-4">
            <DayTotals calorieLog={calorieLog} />
            <div className="space-y-3">
                {calorieLog.slots.map((slot) => (
                    <SlotSection
                        key={slot.mealSlot}
                        slot={slot}
                        foodNames={foodNames}
                        onRemoveItem={onRemoveItem}
                        isRemoving={isRemoving}
                    />
                ))}
            </div>
        </div>
    );
}

function DayTotals({ calorieLog }: { calorieLog: CalorieLog }): ReactElement {
    const macros = [
        { label: 'Calories', value: formatCalories(calorieLog.totalCalories) },
        { label: 'Protein', value: formatMacroGrams(calorieLog.totalProteinG) },
        { label: 'Carbs', value: formatMacroGrams(calorieLog.totalCarbsG) },
        { label: 'Fat', value: formatMacroGrams(calorieLog.totalFatG) },
    ];

    return (
        <dl className="grid grid-cols-2 gap-3 rounded-(--radius-panel) border border-(--color-border) p-4 sm:grid-cols-4">
            {macros.map((macro) => (
                <div key={macro.label}>
                    <dt className="text-xs tracking-wide text-(--color-fg-muted) uppercase">{macro.label}</dt>
                    <dd className="mt-1 text-lg font-semibold tracking-tight text-(--color-fg)">{macro.value}</dd>
                </div>
            ))}
        </dl>
    );
}

type SlotSectionProps = {
    slot: CalorieLogSlot;
    foodNames: FoodNameMap;
    onRemoveItem?: (itemId: string) => void;
    isRemoving: boolean;
};

function SlotSection({ slot, foodNames, onRemoveItem, isRemoving }: SlotSectionProps): ReactElement {
    return (
        <section className="rounded-(--radius-panel) border border-(--color-border)">
            <div className="flex items-center justify-between gap-3 border-b border-(--color-border) px-4 py-2.5">
                <h3 className="text-sm font-medium text-(--color-fg)">{mealSlotLabel(slot.mealSlot)}</h3>
                <span className="text-xs text-(--color-fg-muted)">{formatCalories(slot.totalCalories)}</span>
            </div>
            {slot.items.length === 0 ? (
                <p className="px-4 py-3 text-sm text-(--color-fg-muted)">Nothing logged.</p>
            ) : (
                <ul className="divide-y divide-(--color-border)">
                    {slot.items.map((item) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            foodNames={foodNames}
                            onRemoveItem={onRemoveItem}
                            isRemoving={isRemoving}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

type ItemRowProps = {
    item: CalorieLogItem;
    foodNames: FoodNameMap;
    onRemoveItem?: (itemId: string) => void;
    isRemoving: boolean;
};

function ItemRow({ item, foodNames, onRemoveItem, isRemoving }: ItemRowProps): ReactElement {
    const name = foodNameFor(foodNames, item.foodItemId);

    return (
        <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
                <p className="flex items-center gap-2 text-sm text-(--color-fg)">
                    {name} × {formatQuantity(item.quantity)}
                    {item.isExtra ? null : <Badge variant="outline">From plan</Badge>}
                </p>
                <p className="mt-1 text-xs text-(--color-fg-muted)">
                    {formatCalories(item.calories)} · P {formatMacroGrams(item.proteinG)} · C{' '}
                    {formatMacroGrams(item.carbsG)} · F {formatMacroGrams(item.fatG)}
                </p>
            </div>
            {/* Plan-linked lines are removed on the diet plan; the API answers 422 here. */}
            {onRemoveItem && item.isExtra ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-label={`Remove ${name} from ${mealSlotLabel(item.mealSlot)}`}
                    disabled={isRemoving}
                    onClick={() => onRemoveItem(item.id)}
                >
                    Remove
                </Button>
            ) : null}
        </li>
    );
}

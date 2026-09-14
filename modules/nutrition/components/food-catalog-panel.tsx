'use client';

import { useState, type ReactElement } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFoodSearch, useLogExtraFood } from '@/modules/nutrition/nutrition-hooks';
import { formatCalories, formatMacroGrams, mealSlotLabel } from '@/modules/nutrition/nutrition-labels';
import { MEAL_SLOTS } from '@/modules/nutrition/nutrition-meal-slots';
import type { FoodSearchResult, MealSlot } from '@/modules/nutrition/nutrition-ports';
import { useDebouncedValue } from '@/modules/nutrition/use-debounced-value';

type FoodCatalogPanelProps = {
    /** RSC prefetch of the unfiltered seed catalog. */
    initial?: FoodSearchResult[];
};

export function FoodCatalogPanel({ initial }: FoodCatalogPanelProps): ReactElement {
    const [query, setQuery] = useState('');
    const [mealSlot, setMealSlot] = useState<MealSlot>('BREAKFAST');
    const { data: foods, error, isPending } = useFoodSearch(useDebouncedValue(query), initial);
    const logExtra = useLogExtraFood();

    const logError = logExtra.error?.message ?? null;

    return (
        <section
            className="space-y-4 rounded-(--radius-panel) border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-panel)"
            aria-labelledby="food-catalog-heading"
        >
            <div>
                <h2 id="food-catalog-heading" className="text-lg font-semibold tracking-tight text-(--color-fg)">
                    Food catalog
                </h2>
                <p className="mt-1 text-sm text-(--color-fg-muted)">
                    Search foods and log extras to your diary by meal.
                </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <label className="block max-w-sm flex-1 text-sm">
                    <span className="font-medium text-(--color-fg)">Search foods</span>
                    <Input
                        className="mt-1 w-full"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="idli, chapati…"
                        maxLength={120}
                    />
                </label>
                <label className="block w-44 text-sm">
                    <span className="font-medium text-(--color-fg)">Meal</span>
                    <Select value={mealSlot} onValueChange={(value) => setMealSlot(value as MealSlot)}>
                        <SelectTrigger className="mt-1 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {MEAL_SLOTS.map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                    {mealSlotLabel(slot)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>
            </div>

            {error || logError ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error?.message ?? logError}
                </p>
            ) : null}

            {isPending && !foods ? (
                <p className="text-sm text-(--color-fg-muted)">Searching…</p>
            ) : !(foods && foods.length > 0) ? (
                <p className="text-sm text-(--color-fg-muted)">No catalog food matches that name.</p>
            ) : (
                <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border)">
                    {foods.map((food) => (
                        <FoodRow
                            key={food.id}
                            food={food}
                            mealSlot={mealSlot}
                            isLogging={logExtra.isPending}
                            onLog={(input) => logExtra.mutate(input)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}

type FoodRowProps = {
    food: FoodSearchResult;
    mealSlot: MealSlot;
    isLogging: boolean;
    onLog: (input: { foodItemId: string; servingId: string; quantity: number; mealSlot: MealSlot }) => void;
};

function FoodRow({ food, mealSlot, isLogging, onLog }: FoodRowProps): ReactElement {
    const [quantity, setQuantity] = useState('1');
    const defaultServing = food.units.find((unit) => unit.isDefault) ?? food.units[0];

    function handleLog(): void {
        if (!defaultServing) {
            return;
        }
        const parsedQuantity = Number(quantity);
        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0 || parsedQuantity > 100) {
            return;
        }
        onLog({
            foodItemId: food.id,
            servingId: defaultServing.id,
            quantity: parsedQuantity,
            mealSlot,
        });
    }

    return (
        <li className="px-4 py-3">
            <p className="text-sm font-medium text-(--color-fg)">{food.name}</p>
            <p className="mt-1 text-xs text-(--color-fg-muted)">
                {formatCalories(food.caloriesPer100g)} per 100 g · P {formatMacroGrams(food.proteinGPer100g)} · C{' '}
                {formatMacroGrams(food.carbsGPer100g)} · F {formatMacroGrams(food.fatGPer100g)}
            </p>
            {defaultServing ? (
                <p className="mt-1 text-xs text-(--color-fg-muted)">
                    1 {defaultServing.label} ({defaultServing.grams} g) · {formatCalories(defaultServing.calories)}
                </p>
            ) : null}
            {defaultServing ? (
                <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="block w-20 text-xs">
                        <span className="font-medium text-(--color-fg)">Qty</span>
                        <Input
                            className="mt-1 w-full"
                            type="number"
                            min={0.25}
                            max={100}
                            step={0.25}
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                        />
                    </label>
                    <Button
                        type="button"
                        size="sm"
                        disabled={isLogging}
                        aria-label={`Log ${food.name} to ${mealSlotLabel(mealSlot)}`}
                        onClick={handleLog}
                    >
                        Log
                    </Button>
                </div>
            ) : null}
        </li>
    );
}

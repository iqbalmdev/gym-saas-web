'use client';

import { useState, type ReactElement } from 'react';

import { Input } from '@/components/ui/input';
import { useFoodSearch } from '@/modules/nutrition/nutrition-hooks';
import { formatCalories, formatMacroGrams } from '@/modules/nutrition/nutrition-labels';
import type { FoodSearchResult } from '@/modules/nutrition/nutrition-ports';
import { useDebouncedValue } from '@/modules/nutrition/use-debounced-value';

type FoodCatalogPanelProps = {
    /** RSC prefetch of the unfiltered seed catalog. */
    initial?: FoodSearchResult[];
};

export function FoodCatalogPanel({ initial }: FoodCatalogPanelProps): ReactElement {
    const [query, setQuery] = useState('');
    const { data: foods, error, isPending } = useFoodSearch(useDebouncedValue(query), initial);

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
                    Look up calories and macros per serving. Logging a food to your diary happens in the mobile app.
                </p>
            </div>

            <label className="block max-w-sm text-sm">
                <span className="font-medium text-(--color-fg)">Search foods</span>
                <Input
                    className="mt-1 w-full"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="idli, chapati…"
                    maxLength={120}
                />
            </label>

            {error ? (
                <p role="alert" className="text-sm text-(--color-danger)">
                    {error.message}
                </p>
            ) : null}

            {isPending && !foods ? (
                <p className="text-sm text-(--color-fg-muted)">Searching…</p>
            ) : !(foods && foods.length > 0) ? (
                <p className="text-sm text-(--color-fg-muted)">No catalog food matches that name.</p>
            ) : (
                <ul className="divide-y divide-(--color-border) rounded-(--radius-panel) border border-(--color-border)">
                    {foods.map((food) => (
                        <FoodRow key={food.id} food={food} />
                    ))}
                </ul>
            )}
        </section>
    );
}

function FoodRow({ food }: { food: FoodSearchResult }): ReactElement {
    const defaultServing = food.units.find((unit) => unit.isDefault) ?? food.units[0];

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
        </li>
    );
}

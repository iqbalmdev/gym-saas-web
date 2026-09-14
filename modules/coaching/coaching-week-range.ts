/** Monday–Sunday range for the local calendar week (workout schedule default). */
export function isoWeekRangeLocal(reference = new Date()): { from: string; to: string } {
    const day = reference.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(reference);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(reference.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: formatIsoDate(monday), to: formatIsoDate(sunday) };
}

function formatIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
}

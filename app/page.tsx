import { redirect } from 'next/navigation';

/** Root entry — send humans to auth until session guard exists (M1). */
export default function HomePage() {
    redirect('/login');
}

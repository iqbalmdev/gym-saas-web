import { redirect } from 'next/navigation';

/** @deprecated First-run Staff use /admin/settings. */
export default function CreateGymPage() {
    redirect('/admin/settings');
}

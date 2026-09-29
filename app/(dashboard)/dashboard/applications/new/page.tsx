import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/features/data-entry/components/ApplicationForm';

export const metadata = {
    title: 'Input Permohonan Baru — SIPETRA Architax',
    description: 'Formulir pendaftaran permohonan pajak daerah baru.',
};

export default async function NewApplicationPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return <ApplicationForm mode="create" />;
}

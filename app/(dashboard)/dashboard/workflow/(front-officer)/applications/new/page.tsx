import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/features/front-officer/components/ApplicationForm';

export const metadata = {
    title: 'Input Permohonan Baru Front Officer — SIPETRA Architax',
    description: 'Formulir pendaftaran permohonan pajak daerah baru.',
};

export default async function NewFrontOfficerApplicationPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    return <ApplicationForm mode="create" />;
}

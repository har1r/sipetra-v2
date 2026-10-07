import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ApplicationForm } from '@/features/front-officer/components/ApplicationForm';
import { UnauthorizedView } from '@/components/shared/states/UnauthorizedView';
import { hasStageAccess } from '@/lib/rbac';

export const metadata = {
    title: 'Pengajuan Permohonan PBB-P2',
    description: 'Formulir pengajuan permohonan layanan PBB-P2 di UPTD Pajak Wilayah IV.',
};

export default async function NewSubmissionPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect('/login');
    }

    if (!hasStageAccess(session.user.role, 'submission')) {
        return <UnauthorizedView stage="submission" userRole={session.user.role} />;
    }

    return <ApplicationForm mode="create" userRole={session.user.role} />;
}


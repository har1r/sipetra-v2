import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getApplicationById } from '@/features/front-officer/actions/application.actions';
import { ApplicationForm } from '@/features/front-officer/components/ApplicationForm';
import { AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { formatNopInput } from '@/lib/utils';

export const metadata = {
    title: 'Edit Permohonan — SIPETRA Architax',
    description: 'Ubah detail permohonan data entry.',
};

interface EditApplicationPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditFrontOfficerApplicationPage({ params }: EditApplicationPageProps) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/login');
    }

    const { id } = await params;
    const res = await getApplicationById(id);

    if (!res.success || !res.data) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 pb-16">
                <BackButton />
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-800 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-sm">Gagal Memuat Permohonan</h3>
                        <p className="text-xs text-rose-700 mt-1">
                            {res.message || 'Permohonan tidak ditemukan atau Anda tidak memiliki hak akses.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const appData = res.data;

    const initialData = {
        id: appData.id,
        applicationType: appData.applicationType,
        applicationId: appData.applicationId,
        smartgovId: appData.smartgovId,
        smartgovCreatedAt: appData.smartgovCreatedAt ? new Date(appData.smartgovCreatedAt) : null,
        smartgovCompletedAt: appData.smartgovCompletedAt ? new Date(appData.smartgovCompletedAt) : null,
        requestedNop: formatNopInput(appData.requestedNop || ''),
        complementary: (appData.complementary || []).map((item: any) => ({
            ...item,
            taxObjectData: {
                ...(item?.taxObjectData || {}),
                nop: formatNopInput(item?.taxObjectData?.nop || ''),
            },
        })) as any,
        taxSubject: (appData.taxSubject || {}) as any,
        taxObject: {
            ...(appData.taxObject || {}),
            nop: formatNopInput(appData.taxObject?.nop || ''),
        } as any,
        files: appData.files || [],
        note: appData.note || '',
    };

    return <ApplicationForm mode="edit" initialData={initialData} />;
}

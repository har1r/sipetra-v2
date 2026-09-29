import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getApplicationById } from '@/features/data-entry/actions/application.actions';
import { ApplicationForm } from '@/features/data-entry/components/ApplicationForm';
import { AlertCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export const metadata = {
    title: 'Edit Permohonan — SIPETRA Architax',
    description: 'Ubah detail permohonan data entry.',
};

interface EditApplicationPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditApplicationPage({ params }: EditApplicationPageProps) {
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

    // Converted database model to form input structure
    const initialData = {
        id: appData.id,
        applicationType: appData.applicationType,
        applicationNumber: appData.applicationNumber,
        serviceNumberDate: new Date(appData.serviceNumberDate),
        completionDate: new Date(appData.completionDate),
        complementaryData: appData.complementaryData as any,
        requestedData: appData.requestedData as any,
    };

    return <ApplicationForm mode="edit" initialData={initialData} />;
}

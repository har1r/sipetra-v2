import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';

export default function NotFound() {
    return (
        <div className='min-h-screen bg-slate-50 flex items-center justify-center p-6'>
            <div className='max-w-md w-full text-center bg-white p-8 rounded-sm shadow-xs border border-slate-100 animate-fadeIn'>
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-sm flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <FileQuestion className='w-8 h-8' />
                </div>

                <span className='text-xs font-bold tracking-wider text-rose-600 uppercase bg-rose-50 px-3 py-1 rounded-full'>
                    404 Not Found
                </span>

                <h1 className='text-2xl font-bold text-slate-800 mt-4 mb-2'>
                    Halaman Tidak Ditemukan
                </h1>

                <p className='text-sm text-slate-500 mb-8 leading-relaxed'>
                    Maaf, halaman yang anda cari tidak tersedia, telah dipindahkan, atau tautan yang Anda tuju salah.
                </p>

                <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                    <Link
                        href="/dashboard/home"
                        className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white text-sm font-semibold rounded-xl transition-all shadow-sm shadow-[#00a389]/20'
                    >
                        <Home className='w-4 h-4' />
                        Ke Beranda
                    </Link>
                    <BackButton />
                </div>
            </div>
        </div>
    );
}


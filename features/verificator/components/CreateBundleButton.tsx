'use client';

import React, { useState } from 'react';
import { Layers } from 'lucide-react';
import { CreateBundleModal } from './CreateBundleModal';

export function CreateBundleButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#00a389] hover:bg-[#008670] text-white font-semibold text-sm rounded-sm shadow-xs transition-all cursor-pointer shrink-0"
            >
                <Layers className="w-4 h-4" />
                Buat Bundle Baru
            </button>

            {isOpen && <CreateBundleModal onClose={() => setIsOpen(false)} />}
        </>
    );
}

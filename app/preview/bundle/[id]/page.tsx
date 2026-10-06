import React from 'react';
import { notFound } from 'next/navigation';
import { getBundleRecommendationData } from '@/features/verificator/actions/bundle.actions';
import { BundlePrintView } from '@/components/shared/views/BundlePrintView';

interface BundlePreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function BundlePreviewPage({ params }: BundlePreviewPageProps) {
  const { id } = await params;
  const result = await getBundleRecommendationData(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <BundlePrintView bundle={result.data} />;
}

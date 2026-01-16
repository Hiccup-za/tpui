"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProcessingView } from "@/components/processing/ProcessingView";

export default function ProcessPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <DashboardLayout>
      <div className="h-full p-8">
        <ProcessingView documentId={params.id} />
      </div>
    </DashboardLayout>
  );
}

"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PDFUpload } from "@/components/upload/PDFUpload";

export default function UploadPage() {
  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="max-w-4xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
          <PDFUpload />
        </div>
      </div>
    </DashboardLayout>
  );
}

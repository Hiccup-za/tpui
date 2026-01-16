"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DocumentCard } from "@/components/cards/DocumentCard";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Document } from "@/types";

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents/upload");
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
              <p className="text-muted-foreground mt-2 text-base">
                View and manage your processed PRD documents
              </p>
            </div>
            <Button onClick={() => router.push("/upload")} size="lg">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-muted-foreground text-base">Loading documents...</p>
            </div>
          ) : documents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground text-lg font-medium">
                No documents uploaded yet
              </p>
              <p className="text-muted-foreground text-sm mt-3">
                Upload your first PRD document to get started
              </p>
              <Button
                onClick={() => router.push("/upload")}
                className="mt-6"
                size="lg"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { Document, Requirement } from "@/types";
import { format } from "date-fns";

export default function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) {
          throw new Error("Document not found");
        }
        const data = await response.json();
        setDocument(data.document);
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <p className="text-muted-foreground text-base">Loading document...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!document) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <p className="text-muted-foreground text-base">Document not found</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{document.fileName}</h1>
                <p className="text-muted-foreground mt-2 text-base">
                  Uploaded: {format(document.uploadedAt, "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push("/")}
                  size="lg"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </div>
            </div>

            {document.requirements && document.requirements.length > 0 ? (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold tracking-tight">Requirements & Test Cases</h2>
                <div className="space-y-4">
                  {document.requirements.map((requirement) => (
                    <RequirementCard key={requirement.id} requirement={requirement} />
                  ))}
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="p-16 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-base">
                    Requirements and test cases will appear here once processing is complete
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function RequirementCard({ requirement }: { requirement: Requirement }) {
  const requirementNumber = requirement.number || (requirement.type === "functional" ? "FR-XXX" : "NFR-XXX");
  const requirementTypeLabel = requirement.type === "functional" ? "Functional" : "Non-Functional";
  
  return (
    <Card>
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-lg font-semibold">
          {requirementNumber} | {requirementTypeLabel} Requirement
        </CardTitle>
        <CardDescription className="mt-3 text-base">{requirement.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-3">
          {requirement.testCases.map((testCase, index) => {
            return (
              <div
                key={testCase.id}
                className="text-sm py-2 leading-relaxed flex items-start gap-2"
              >
                <span className="font-medium">{index + 1}.</span>
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  {testCase.testTypes && testCase.testTypes.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {testCase.testTypes.map((testType, typeIndex) => (
                        <span
                          key={typeIndex}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-black dark:bg-white text-white dark:text-black border border-border"
                        >
                          {testType}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white dark:bg-black text-black dark:text-white border border-border">
                      testing type
                    </span>
                  )}
                  <span>{testCase.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

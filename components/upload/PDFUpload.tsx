"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PDFUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    }
  }, []);

  const handleRemove = useCallback(() => {
    setFile(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      router.push(`/documents/${data.documentId}/process`);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload PDF. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [file, router]);

  const handleSimulate = useCallback(async () => {
    setIsSimulating(true);
    
    try {
      // Create a simulated PDF file
      const simulatedFile = new File(
        ["Simulated PRD Document"],
        "simulated-prd.pdf",
        { type: "application/pdf" }
      );
      
      const formData = new FormData();
      formData.append("file", simulatedFile);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Simulation failed");
      }

      const data = await response.json();
      router.push(`/documents/${data.documentId}/process`);
    } catch (error) {
      console.error("Simulation error:", error);
      alert("Failed to start simulation. Please try again.");
    } finally {
      setIsSimulating(false);
    }
  }, [router]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload PRD Document</CardTitle>
        <CardDescription>
          Upload a PDF document to begin the automated test case generation process
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            file && "border-primary bg-primary/5"
          )}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-12 w-12 text-primary" />
                <div className="text-left">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemove}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">
                  Drag and drop your PDF here
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  or click to browse
                </p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("pdf-upload")?.click()}
                >
                  Select PDF File
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleSimulate}
                  disabled={isSimulating}
                >
                  {isSimulating ? "Starting..." : "Simulate"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {file && (
          <Button
            onClick={handleSubmit}
            disabled={isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? "Uploading..." : "Start Processing"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

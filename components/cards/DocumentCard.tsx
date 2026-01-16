"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Document } from "@/types";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
}

export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      });

      if (response.ok && onDelete) {
        onDelete(document.id);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 flex flex-col relative group aspect-[2/3]">
      <Link href={`/documents/${document.id}`} className="flex flex-col h-full">
        <CardHeader className="p-5 pb-4 flex-shrink-0">
          <CardTitle className="text-base font-semibold leading-snug break-words line-clamp-3">
            {document.fileName}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-end">
          <p className="text-sm text-muted-foreground">
            {format(document.uploadedAt, "MMM d, yyyy")}
          </p>
        </CardContent>
      </Link>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 absolute bottom-3 right-3"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Card>
  );
}

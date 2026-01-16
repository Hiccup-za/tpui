"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestPlan } from "@/types";
import { format } from "date-fns";

interface TestPlanCardProps {
  testPlan: TestPlan;
}

export function TestPlanCard({ testPlan }: TestPlanCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 flex flex-col relative aspect-[2/3] h-full">
      <CardHeader className="p-5 pb-4 flex-shrink-0">
        <CardTitle className="text-base font-semibold leading-snug break-words line-clamp-3">
          {testPlan.featureName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 pt-0 flex-1 flex flex-col justify-end">
        <p className="text-sm text-muted-foreground">
          Created: {format(testPlan.createdAt, "MMM d, yyyy")}
        </p>
      </CardContent>
    </Card>
  );
}

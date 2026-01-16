"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestPlanCard } from "@/components/cards/TestPlanCard";
import { Button } from "@/components/ui/button";
import { Product, TestPlan } from "@/types";

interface ProductDashboardProps {
  product: Product;
  testPlans: TestPlan[];
}

export function ProductDashboard({ product, testPlans }: ProductDashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
          {product.description && (
            <p className="text-muted-foreground mt-2 text-base">
              {product.description}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 tracking-tight">Test Plans</h2>
        {testPlans.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {testPlans.map((testPlan) => (
              <TestPlanCard key={testPlan.id} testPlan={testPlan} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-lg font-medium">
              No test plans created yet
            </p>
            <p className="text-muted-foreground text-sm mt-3">
              Create your first test plan to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

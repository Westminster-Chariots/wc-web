"use client";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Construction className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2 capitalize">{title}</h2>
          <p className="text-muted-foreground">This page is under construction.</p>
        </div>
      </div>
    </div>
  );
}

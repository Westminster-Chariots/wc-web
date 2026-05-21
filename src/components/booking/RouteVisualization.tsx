import React from "react";
import { MapPin, ArrowRight } from "lucide-react";

interface RouteVisualizationProps {
  pickup: string;
  dropoff: string;
  index?: number;
}

const RouteVisualization: React.FC<RouteVisualizationProps> = ({ pickup, dropoff, index }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col items-center">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="w-px bg-border h-6 mx-auto" />
        <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center border border-border">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex-1 text-sm">
        <p className="text-foreground font-medium">{pickup}</p>
        <p className="text-muted-foreground text-xs mt-0.5">→ {dropoff}</p>
      </div>
      {typeof index === "number" && (
        <div className="ml-2 text-xs text-muted-foreground">#{index + 1}</div>
      )}
    </div>
  );
};

export default RouteVisualization;

import { Card, CardContent } from "@/components/ui/card";
import { HealthFacility } from "@/types/facility";
import { Siren, HeartPulse, Bed, Ambulance } from 'lucide-react';
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  facilities: HealthFacility[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export const StatsOverview = ({ facilities, activeFilter, onFilterChange }: StatsOverviewProps) => {
  const stats = facilities.reduce(
    (acc, f) => {
      acc.emergency += f.emergency?.available || 0;
      acc.icu += f.icu?.available || 0;
      acc.morgue += f.morgue?.available || 0;
      acc.ambulances += f.ambulances?.available || 0;
      return acc;
    },
    { emergency: 0, icu: 0, morgue: 0, ambulances: 0 }
  );

  const cards = [
    { 
      id: 'Emergency', 
      label: 'Emergency Beds', 
      value: stats.emergency, 
      icon: Siren, 
      color: 'red',
      bg: 'bg-red-50/50',
      border: 'border-red-100',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    },
    { 
      id: 'ICU', 
      label: 'ICU Spaces', 
      value: stats.icu, 
      icon: HeartPulse, 
      color: 'blue',
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    { 
      id: 'Morgue', 
      label: 'Morgue Spaces', 
      value: stats.morgue, 
      icon: Bed, 
      color: 'slate',
      bg: 'bg-slate-50/50',
      border: 'border-slate-100',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
      textColor: 'text-slate-900'
    },
    { 
      id: 'Ambulance', 
      label: 'Ambulances', 
      value: stats.ambulances, 
      icon: Ambulance, 
      color: 'emerald',
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      textColor: 'text-emerald-900'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;
        
        return (
          <Card 
            key={card.id}
            className={cn(
              "cursor-pointer transition-all hover:scale-105 active:scale-95",
              card.bg,
              card.border,
              isActive ? "ring-2 ring-primary border-transparent shadow-md" : "hover:shadow-sm"
            )}
            onClick={() => onFilterChange(isActive ? 'All' : card.id)}
          >
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={cn("p-3 rounded-full", card.iconBg)}>
                <Icon className={cn("h-6 w-6", card.iconColor)} />
              </div>
              <div>
                <p className={cn("text-sm font-medium", card.iconColor)}>{card.label}</p>
                <p className={cn("text-2xl font-bold", card.textColor)}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

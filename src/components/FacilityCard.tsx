import { HealthFacility, ResourceAvailability } from "@/types/facility";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Siren, HeartPulse, Bed, Ambulance, CircleParking } from 'lucide-react';
import { translations } from "@/lib/i18n";
import { motion } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getStatusColor = (resource?: ResourceAvailability) => {
  if (!resource || resource.available === 0) {
    return "bg-red-500";
  }
  if (resource.total === 0 || (resource.available / resource.total) < 0.25) {
    return "bg-yellow-500";
  }
   return "bg-green-500";
};

const ResourceStatus = ({ name, icon, resource }: { name: string; icon: React.ReactNode; resource?: ResourceAvailability }) => {
    const res = resource || { total: 0, available: 0 };
    return (
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 xs:gap-2 py-1.5">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <motion.div
                                className="p-1.5 sm:p-2 bg-muted/50 rounded-lg cursor-help hover:bg-muted transition-colors shrink-0"
                                whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <div className="min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] flex items-center justify-center">
                                    {icon}
                                </div>
                            </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                            <p>{name}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span className="text-xs sm:text-sm font-medium truncate">{name}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm bg-muted/30 px-2.5 sm:px-3 py-1 sm:py-1 rounded-full shrink-0 min-h-[28px] sm:min-h-[32px]">
                <motion.span
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 ${getStatusColor(res)}`}
                    animate={res.available > 0 ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <span className="tabular-nums">{res.available} / {res.total}</span>
            </div>
        </div>
    )
};


export const FacilityCard = ({ facility, t }: { facility: HealthFacility; t: typeof translations['en'] }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 10px 40px -10px rgba(8, 145, 178, 0.15)" }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
        <Card className="h-full border-2 hover:border-primary/50 transition-all shadow-sm hover:shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
            <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg leading-tight break-words">{facility.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">{facility.location}</p>
                </div>
                <Badge variant={facility.type === 'Public' ? 'default' : 'secondary'} className="shrink-0 text-xs min-h-[24px]">{facility.type === 'Public' ? t.public : t.private}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 pt-2 sm:pt-3 space-y-1 sm:space-y-2">
            <ResourceStatus name={t.emergency} icon={<Siren className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />} resource={facility.emergency} />
            <ResourceStatus name={t.icu} icon={<HeartPulse className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />} resource={facility.icu} />
            <ResourceStatus name={t.morgue} icon={<Bed className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />} resource={facility.morgue} />
            <ResourceStatus name={t.ambulance} icon={<Ambulance className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />} resource={facility.ambulances} />
            {facility.parkedAmbulances > 0 && (
              <div className="flex items-center justify-between gap-2 py-1.5">
                <div className="flex items-center gap-2 sm:gap-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          className="p-1.5 sm:p-2 bg-emerald-500/10 rounded-lg cursor-help hover:bg-emerald-500/20 transition-colors shrink-0"
                          whileHover={{ scale: 1.15, rotate: [0, -8, 8, 0] }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <div className="min-w-[20px] min-h-[20px] sm:min-w-[24px] sm:min-h-[24px] flex items-center justify-center">
                            <CircleParking className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />
                          </div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">
                        <p>{t.parkedAmbulance}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="text-xs sm:text-sm font-medium">{t.parkedAmbulance}</span>
                </div>
                <div className="flex items-center gap-2 font-semibold text-xs sm:text-sm bg-emerald-500/10 px-2.5 sm:px-3 py-1 sm:py-1 rounded-full shrink-0 min-h-[28px] sm:min-h-[32px]">
                  <motion.span
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0 bg-emerald-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">{facility.parkedAmbulances}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </motion.div>
  );
};
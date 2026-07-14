import { useState, useMemo } from 'react';
import { useHealthFacilities } from '@/hooks/useHealthFacilities';
import { FacilityCard } from '@/components/FacilityCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HealthFacility } from '@/types/facility';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { getTranslation, Language } from '@/lib/i18n';
import { StatsOverview } from '@/components/StatsOverview';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Plus, Building2, X, Home, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from '@/components/ui/breadcrumb';

interface FacilityTrackerPageProps {
  language: Language;
  userRole: 'Super Admin' | 'Facility Admin' | null;
  managedFacilityId: string | null;
  setLoginModalOpen: (open: boolean) => void;
}

export const FacilityTrackerPage = ({
  language,
  userRole,
  managedFacilityId,
  setLoginModalOpen,
}: FacilityTrackerPageProps) => {
  const { facilities, loading, updateFacility, addFacility } = useHealthFacilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterService, setFilterService] = useState('All');
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [emergencyAvailable, setEmergencyAvailable] = useState(0);
  const [icuAvailable, setIcuAvailable] = useState(0);
  const [morgueAvailable, setMorgueAvailable] = useState(0);
  const [ambulanceAvailable, setAmbulanceAvailable] = useState(0);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newFacilityData, setNewFacilityData] = useState({
    name: '',
    type: 'Public' as 'Public' | 'Private',
    location: '',
    state: 'Gombe',
    lga: '',
    emergency: { total: 0, available: 0 },
    icu: { total: 0, available: 0 },
    morgue: { total: 0, available: 0 },
    ambulances: { total: 0, available: 0 },
  });

  const t = getTranslation(language);

  const filteredFacilities = useMemo(() => facilities
    .filter(facility => facility.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(facility => filterType === 'All' || facility.type === filterType)
    .filter(facility => {
      if (filterService === 'All') return true;
      if (filterService === 'Emergency') return (facility.emergency?.available || 0) > 0;
      if (filterService === 'ICU') return (facility.icu?.available || 0) > 0;
      if (filterService === 'Morgue') return (facility.morgue?.available || 0) > 0;
      if (filterService === 'Ambulance') return (facility.ambulances?.available || 0) > 0;
      return true;
    })
    .filter(facility => {
        if(userRole === 'Facility Admin') return facility.id === managedFacilityId;
        return true;
    }), [facilities, searchTerm, filterType, filterService, userRole, managedFacilityId]);

  const handleUpdateClick = (facility: HealthFacility) => {
    if (userRole === 'Super Admin' || (userRole === 'Facility Admin' && facility.id === managedFacilityId)) {
      setSelectedFacility(facility);
      setEmergencyAvailable(facility.emergency?.available || 0);
      setIcuAvailable(facility.icu?.available || 0);
      setMorgueAvailable(facility.morgue?.available || 0);
      setAmbulanceAvailable(facility.ambulances?.available || 0);
      setUpdateModalOpen(true);
    }
  };

  const handleSaveChanges = () => {
    if (selectedFacility) {
      updateFacility({
        ...selectedFacility,
        emergency: { total: selectedFacility.emergency?.total || 0, available: emergencyAvailable },
        icu: {  total: selectedFacility.icu?.total || 0, available: icuAvailable },
        morgue: { total: selectedFacility.morgue?.total || 0, available: morgueAvailable },
        ambulances: { total: selectedFacility.ambulances?.total || 0, available: ambulanceAvailable },
      });
      setUpdateModalOpen(false);
    }
  };

  const handleAddFacility = () => {
    addFacility({
        ...newFacilityData,
        emergency: { total: newFacilityData.emergency.total, available: newFacilityData.emergency.total },
        icu: { total: newFacilityData.icu.total, available: newFacilityData.icu.total },
        morgue: { total: newFacilityData.morgue.total, available: newFacilityData.morgue.total },
        ambulances: { total: newFacilityData.ambulances.total, available: newFacilityData.ambulances.total },
    });
    setAddModalOpen(false);
    setNewFacilityData({
        name: '',
        type: 'Public',
        location: '',
        state: 'Gombe',
        lga: '',
        emergency: { total: 0, available: 0 },
        icu: { total: 0, available: 0 },
        morgue: { total: 0, available: 0 },
        ambulances: { total: 0, available: 0 },
    });
  };

  return (
    <div className="w-full">
      <div className="container mx-auto p-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                {t.facilities}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <StatsOverview 
          facilities={facilities} 
          activeFilter={filterService}
          onFilterChange={setFilterService}
        />
        
        <motion.div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.searchPlaceholder}
              className="pl-10 min-h-[44px] rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[160px] min-h-[44px] rounded-xl">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 shrink-0" />
                <SelectValue placeholder={t.filterByType} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t.allTypes}</SelectItem>
              <SelectItem value="Public">{t.public}</SelectItem>
              <SelectItem value="Private">{t.private}</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterService} onValueChange={setFilterService}>
            <SelectTrigger className="w-full sm:w-[180px] min-h-[44px] rounded-xl">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 shrink-0" />
                <SelectValue placeholder={t.filterByService} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t.allServices}</SelectItem>
              <SelectItem value="Emergency">{t.emergency}</SelectItem>
              <SelectItem value="ICU">{t.icu}</SelectItem>
              <SelectItem value="Morgue">{t.morgue}</SelectItem>
              <SelectItem value="Ambulance">{t.ambulance}</SelectItem>
            </SelectContent>
          </Select>
          {userRole === 'Super Admin' && (
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Button
                onClick={() => setAddModalOpen(true)}
                className="w-full sm:w-auto min-h-[44px] rounded-xl gap-2"
              >
                <Plus className="h-4 w-4" />
                {t.addNewFacility}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">{t.loading}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
          >
            {filteredFacilities.map((facility, i) => (
              <motion.div
                key={facility.id}
                onClick={() => handleUpdateClick(facility)}
                className={userRole ? 'cursor-pointer' : ''}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 18 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <FacilityCard facility={facility} t={t} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedFacility && (
          <Dialog open={isUpdateModalOpen} onOpenChange={setUpdateModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.updateAvailability} {selectedFacility.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>{t.emergencyBeds} ({emergencyAvailable} / {selectedFacility.emergency?.total || 0})</Label>
                  <Slider
                    max={selectedFacility.emergency?.total || 0}
                    step={1}
                    value={[emergencyAvailable]}
                    onValueChange={(value) => setEmergencyAvailable(value[0])}
                  />
                </div>
                <div className="space-y-2">
                    <Label>{t.icuBeds} ({icuAvailable} / {selectedFacility.icu?.total || 0})</Label>
                    <Slider
                        max={selectedFacility.icu?.total || 0}
                        step={1}
                        value={[icuAvailable]}
                        onValueChange={(value) => setIcuAvailable(value[0])}
                    />
                </div>
                <div className="space-y-2">
                    <Label>{t.morgueSpaces} ({morgueAvailable} / {selectedFacility.morgue?.total || 0})</Label>
                    <Slider
                        max={selectedFacility.morgue?.total || 0}
                        step={1}
                        value={[morgueAvailable]}
                    onValueChange={(value) => setMorgueAvailable(value[0])}
                  />
                </div>
                <div className="space-y-2">
                    <Label>{t.ambulance} ({ambulanceAvailable} / {selectedFacility.ambulances?.total || 0})</Label>
                    <Slider
                        max={selectedFacility.ambulances?.total || 0}
                        step={1}
                        value={[ambulanceAvailable]}
                        onValueChange={(value) => setAmbulanceAvailable(value[0])}
                    />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateModalOpen(false)}>{t.cancel}</Button>
                <Button onClick={handleSaveChanges}>{t.save}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
            <DialogContent className="sm:max-w-[425px] max-h-[90dvh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {t.addFacilityTitle}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4 px-1">
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="name" className="text-sm font-medium sm:text-right min-w-0">{t.facilityName}</Label>
                        <Input id="name" value={newFacilityData.name} onChange={(e) => setNewFacilityData({...newFacilityData, name: e.target.value})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="type" className="text-sm font-medium sm:text-right min-w-0">{t.facilityType}</Label>
                        <Select onValueChange={(value: 'Public' | 'Private') => setNewFacilityData({...newFacilityData, type: value})} defaultValue={newFacilityData.type}>
                            <SelectTrigger className="w-full sm:col-span-3 min-h-[44px] rounded-xl">
                                <SelectValue placeholder={t.facilityType} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public">{t.public}</SelectItem>
                                <SelectItem value="Private">{t.private}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="location" className="text-sm font-medium sm:text-right min-w-0">{t.location}</Label>
                        <Input id="location" value={newFacilityData.location} onChange={(e) => setNewFacilityData({...newFacilityData, location: e.target.value})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="lga" className="text-sm font-medium sm:text-right min-w-0">{t.lga}</Label>
                        <Input id="lga" value={newFacilityData.lga} onChange={(e) => setNewFacilityData({...newFacilityData, lga: e.target.value})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="emergency" className="text-sm font-medium sm:text-right min-w-0">{t.totalEmergencyBeds}</Label>
                        <Input id="emergency" type="number" value={newFacilityData.emergency.total} onChange={(e) => setNewFacilityData({...newFacilityData, emergency: {...newFacilityData.emergency, total: parseInt(e.target.value) || 0}})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="icu" className="text-sm font-medium sm:text-right min-w-0">{t.totalIcuBeds}</Label>
                        <Input id="icu" type="number" value={newFacilityData.icu.total} onChange={(e) => setNewFacilityData({...newFacilityData, icu: {...newFacilityData.icu, total: parseInt(e.target.value) || 0}})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="morgue" className="text-sm font-medium sm:text-right min-w-0">{t.totalMorgueSpaces}</Label>
                        <Input id="morgue" type="number" value={newFacilityData.morgue.total} onChange={(e) => setNewFacilityData({...newFacilityData, morgue: {...newFacilityData.morgue, total: parseInt(e.target.value) || 0}})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-4 gap-2 sm:gap-4 items-start sm:items-center">
                        <Label htmlFor="ambulances" className="text-sm font-medium sm:text-right min-w-0">{t.totalAmbulances}</Label>
                        <Input id="ambulances" type="number" value={newFacilityData.ambulances.total} onChange={(e) => setNewFacilityData({...newFacilityData, ambulances: {...newFacilityData.ambulances, total: parseInt(e.target.value) || 0}})} className="w-full sm:col-span-3 min-h-[44px] rounded-xl" />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant={'outline'} onClick={() => setAddModalOpen(false)} className="w-full sm:w-auto min-h-[44px] rounded-xl">{t.cancel}</Button>
                    <Button onClick={handleAddFacility} className="w-full sm:w-auto min-h-[44px] rounded-xl">{t.addFacility}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
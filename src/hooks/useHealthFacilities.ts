import { useState, useEffect } from 'react';
import { HealthFacility } from '@/types/facility';
import { mockFacilities } from '@/data/mockFacilities';

const STORAGE_KEY = 'healthFacilities_v2';

export function useHealthFacilities() {
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedFacilities = localStorage.getItem(STORAGE_KEY);
      if (storedFacilities) {
        setFacilities(JSON.parse(storedFacilities));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockFacilities));
        setFacilities(mockFacilities);
      }
    } catch (error) {
      console.error("Failed to load facilities from localStorage", error);
      setFacilities(mockFacilities);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFacility = (updatedFacility: HealthFacility) => {
    setFacilities(prevFacilities => {
        const updatedFacilities = prevFacilities.map((facility) =>
          facility.id === updatedFacility.id ? updatedFacility : facility
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFacilities));
        return updatedFacilities;
    });
  };

  const addFacility = (newFacility: Omit<HealthFacility, 'id'>) => {
    setFacilities(prevFacilities => {
      const facilityWithId: HealthFacility = {
        ...newFacility,
        id: new Date().toISOString(),
      };
      const updatedFacilities = [...prevFacilities, facilityWithId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedFacilities));
      return updatedFacilities;
    });
  };

  return { facilities, loading, updateFacility, addFacility };
}

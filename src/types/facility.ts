export interface ResourceAvailability {
  total: number;
  available: number;
}

export interface HealthFacility {
  id: string;
  name: string;
  type: 'Public' | 'Private';
  location: string;
  state: string;
  lga: string;
  emergency: ResourceAvailability;
  icu: ResourceAvailability;
  morgue: ResourceAvailability;
  ambulances: ResourceAvailability;
  parkedAmbulances: number;
}
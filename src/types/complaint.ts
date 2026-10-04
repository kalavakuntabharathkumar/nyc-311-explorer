export interface Complaint {
  unique_key: string
  created_date: string
  closed_date: string | null
  agency: string
  agency_name: string
  complaint_type: string
  descriptor: string
  location_type: string
  incident_zip: string | null
  incident_address: string | null
  street_name: string | null
  cross_street_1: string | null
  cross_street_2: string | null
  intersection_street_1: string | null
  intersection_street_2: string | null
  address_type: string | null
  city: string
  landmark: string | null
  facility_type: string | null
  status: string
  due_date: string | null
  resolution_description: string | null
  resolution_action_updated_date: string | null
  community_board: string | null
  bbl: string | null
  borough: string
  x_coordinate_state_plane: string | null
  y_coordinate_state_plane: string | null
  open_data_channel_type: string | null
  park_facility_name: string | null
  park_borough: string | null
  school_name: string | null
  school_number: string | null
  school_region: string | null
  school_code: string | null
  school_phone_number: string | null
  school_address: string | null
  school_city: string | null
  school_state: string | null
  school_zip: string | null
  school_not_found: string | null
  school_or_citywide_complaint: string | null
  vehicle_type: string | null
  taxi_company_borough: string | null
  taxi_pick_up_location: string | null
  bridge_highway_name: string | null
  bridge_highway_direction: string | null
  road_ramp: string | null
  bridge_highway_segment: string | null
  latitude: string | null
  longitude: string | null
  location: {
    type: 'Point'
    coordinates: [number, number]
  } | null
}

export interface ComplaintsResponse {
  data: Complaint[]
  total: number
  page: number
  pageSize: number
}

export type ComplaintCategory = 
  | 'Noise'
  | 'Heat/Hot Water'
  | 'Plumbing'
  | 'Sanitation'
  | 'Building/Construction'
  | 'Rodent'
  | 'Street Condition'
  | 'Traffic'
  | 'Other'

// Map complaint_type to our simplified categories
export const CATEGORY_MAP: Record<string, ComplaintCategory> = {
  'Noise - Residential': 'Noise',
  'Noise - Commercial': 'Noise',
  'Noise - Vehicle': 'Noise',
  'Noise - Helicopter': 'Noise',
  'Noise - House of Worship': 'Noise',
  'Heat/Hot Water': 'Heat/Hot Water',
  'Plumbing': 'Plumbing',
  'Sanitation Condition': 'Sanitation',
  'Building/Construction': 'Building/Construction',
  'Rodent': 'Rodent',
  'Street Condition': 'Street Condition',
  'Traffic Signal': 'Traffic',
  'Traffic': 'Traffic'
}

// Reverse map for filter chips
export const CATEGORIES: ComplaintCategory[] = [
  'Noise',
  'Heat/Hot Water',
  'Plumbing',
  'Sanitation',
  'Building/Construction',
  'Rodent',
  'Street Condition',
  'Traffic',
  'Other'
]

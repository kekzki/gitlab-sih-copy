// A static user ID to filter the mock data, matching the 'Researcher' UUID
const RESEARCHER_UUID = "79c57103-6d6f-48de-905b-b781d134c996";

// --- MOCK DATA ARRAY ---
// This array mimics the data you would normally fetch from your 'datasets' table
const mockDatasets = [
  {
    id: 1,
    title: "Mangalore Coastal pH Monitoring",
    description: "Monthly pH monitoring data from Mangalore coast",
    status: "Public",
    uploaded_by_id: RESEARCHER_UUID,
    created_at: "2024-03-15T10:00:00Z",
    file_count: 2,
  },
  {
    id: 2,
    title: "Goa Marine Biodiversity Study",
    description: "Comprehensive biodiversity assessment of Goa waters",
    status: "Private",
    uploaded_by_id: RESEARCHER_UUID,
    created_at: "2024-02-28T12:30:00Z",
    file_count: 4,
  },
  {
    id: 3,
    title: "Chennai Port Water Quality Analysis",
    description: "Water quality assessment near Chennai port area",
    status: "Public",
    uploaded_by_id: RESEARCHER_UUID,
    created_at: "2024-01-10T09:15:00Z",
    file_count: 6,
  },
  {
    id: 4,
    title: "Sunderban Mangrove Health Report 2024",
    description: "Satellite imagery and health indices for Sunderban mangroves",
    status: "Public",
    uploaded_by_id: RESEARCHER_UUID,
    created_at: "2024-04-05T14:45:00Z",
    file_count: 1,
  },
  {
    id: 5,
    title: "Andaman Deep Sea Fish Survey",
    description: "A private collection of deep-sea sonar recordings",
    status: "Private",
    uploaded_by_id: RESEARCHER_UUID,
    created_at: "2024-05-20T11:00:00Z",
    file_count: 3,
  },
  // Add a dataset that doesn't belong to the researcher for filtering tests
  {
    id: 6,
    title: "Global Ocean Temperature Averages",
    description: "General public dataset from NOAA sources",
    status: "Public",
    uploaded_by_id: "some-other-uuid",
    created_at: "2023-11-01T08:00:00Z",
    file_count: 10,
  },
];

// In the real application, this would be a function to fetch from Supabase.
// For now, it filters the mock data by the researcher's UUID.
export const fetchResearcherDatasets = (researcherId) => {
  return mockDatasets.filter(
    (dataset) => dataset.uploaded_by_id === researcherId
  );
};

export default mockDatasets;

public class DistrictResponse
    {
        // Name cua Province
        public string Name { get; set; }
        // Code cua Province
        public int Code { get; set; }
        // Wards la List District
        public List<DistrictModel> Wards { get; set; } = new List<DistrictModel>();
    }
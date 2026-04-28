public class LocationNode
    {
        public int Id { get; set; }
        public string OriginalName { get; set; }
        // Dictionary giúp tra cứu tên (đã clean) với độ phức tạp O(1)
        public Dictionary<string, LocationNode> Children { get; set; } = new Dictionary<string, LocationNode>();
    }
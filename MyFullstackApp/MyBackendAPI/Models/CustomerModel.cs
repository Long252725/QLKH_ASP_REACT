using MiniExcelLibs.Attributes;

public class CustomerModel
    {
        public Guid Id { get; set; }
        [ExcelColumnName("Họ")]
        public string? Ho { get; set; }
        [ExcelColumnName("Tên")]
        public string? Ten { get; set; }
        [ExcelColumnName("Tên đệm")]
        public string? TenDem { get; set; }
        [ExcelColumnName("Họ tên đầy đủ")]
        public string? HoTenDayDu { get; set; }
        [ExcelColumnName("Email")]
        public string? Email { get; set; }
        [ExcelColumnName("SDT")]
        public string? Sdt { get; set; }
        [ExcelColumnName("Ngày sinh")]
        public string? DateOfBirth { get; set; }
        [ExcelColumnName("Giới tính")]
        public string? Gender { get; set; }
        [ExcelColumnName("Tỉnh/TP")]
        public string? Province { get; set; }
        [ExcelColumnName("Quận/Huyện")]
        public string? District { get; set; }
        [ExcelColumnName("Phường/Xã")]
        public string? Ward { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
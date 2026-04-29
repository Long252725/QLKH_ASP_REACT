public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Ho { get; set; }
    public string Ten { get; set; }
    public string? TenDem { get; set; }
    public string HoTenDayDu { get; set; }
    public string? Email { get; set; }
    public string? Sdt { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Province { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
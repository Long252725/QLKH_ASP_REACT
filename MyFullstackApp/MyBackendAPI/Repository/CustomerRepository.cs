using MiniExcelLibs;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using System.Text;
using System.Globalization;
using MyBackendAPI.Helpers;
namespace MyBackendAPI.Repository
{
    public class CustomerRepository : ICustomerRepository
    {
        public static async Task<List<ProvinceResponse>> FetchAllProvincesAsync()
        {
            // Lưu ý: Trong thực tế nên dùng IHttpClientFactory để quản lý vòng đời HttpClient
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    string url = "https://provinces.open-api.vn/api/v2/p/?depth=2";
                    
                    // Tự động gọi API và chuyển thành List<ProvinceModel>
                    var provinces = await client.GetFromJsonAsync<List<ProvinceResponse>>(url);
                    
                    return provinces ?? new List<ProvinceResponse>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error fetching provinces: {ex.Message}");
                    return new List<ProvinceResponse>();
                }
            }
        }
        public static async Task<List<DistrictModel>> FetchDistrictsByProvinceCodeAsync(int provinceCode)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    string url = $"https://provinces.open-api.vn/api/v2/p/{provinceCode}?depth=2";
                    var response = await client.GetFromJsonAsync<DistrictResponse>(url);
                    return response?.Wards ?? new List<DistrictModel>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi lấy danh sách huyện của tỉnh {provinceCode}: {ex.Message}");
                    return new List<DistrictModel>();
                }
            }
        }      

        public static async Task<List<WardResponse>> FetchWardsByDistrictCodeAsync(int districtCode)
        {
            using (var client = new HttpClient())
            {
                try
                {
                    string url = $"https://provinces.open-api.vn/api/v2/w/{districtCode}/to-legacies/";
                    var response = await client.GetFromJsonAsync<List<WardResponse>>(url);
                    return response ?? new List<WardResponse>();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Lỗi khi lấy danh sách phường của huyện {districtCode}: {ex.Message}");
                    return new List<WardResponse>();
                }
            }
        }
        public static (List<CustomerVM> UniqueData, List<CustomerVM> DataTrung) LocData(List<CustomerVM> data)
        {
            var processData = data.Select(d => new
            {
                Original = d,
                Sdt = d.Sdt?.Trim() ?? "",
                Email = d.Email?.Trim().ToLower() ?? ""
            }).ToList();

            var countSdt = processData.GroupBy(x => x.Sdt).ToDictionary(g => g.Key, g => g.Count());
            var countEmail = processData.GroupBy(x => x.Email).ToDictionary(g => g.Key, g => g.Count());

             var UniqueData = new List<CustomerVM>();       
             var DataTrung = new List<CustomerVM>();       

            foreach(var item in processData)
            {
                if(countSdt[item.Sdt] > 1 || countEmail[item.Email] > 1)
                {
                    DataTrung.Add(item.Original);
                } else
                {
                    UniqueData.Add(item.Original);
                }
            }
            foreach (var item in DataTrung)
                {
                    item.HoTenDayDu = $"{item.Ho?.Trim() ?? ""} {item.TenDem?.Trim() ?? ""} {item.Ten?.Trim() ?? ""}".Trim();
                    item.Gender = StringHelper.FormatName(item.Gender ?? string.Empty);
                }
            return (UniqueData, DataTrung);
        }
        public static async Task<(List<CustomerVM> dataTrue, List<CustomerVM> dataFalse, List<CustomerVM> dataTrung)> handleNomarlizeData(List<CustomerVM> data)
        {
            // Khoi tao loc trung
            Dictionary<string, LocationNode> Map = new Dictionary<string, LocationNode>();
            var (uniqueData, dataTrung) = LocData(data);
            // Load list province vao map
            var provinceList = await FetchAllProvincesAsync();
            foreach(var p in provinceList)
            {
                Map[CleanTextHelper.CleanText(p.Name)] = new LocationNode()
                {
                    Id = p.Code,
                    OriginalName = p.Name
                };
            }

            var dataTrue = new List<CustomerVM>();
            var dataFalse = new List<CustomerVM>();
            // handle Province
            foreach(var item in uniqueData)         
            {
                string pKey = CleanTextHelper.CleanText(item.Province);
                LocationNode? provinceInfo = null;
                if(!String.IsNullOrEmpty(pKey) && Map.TryGetValue(pKey, out provinceInfo))
                {
                    item.Province = provinceInfo.OriginalName;
                    if(provinceInfo.Children.Count == 0)
                    {
                        var districtList = await FetchDistrictsByProvinceCodeAsync(provinceInfo.Id);
                        foreach(var d in districtList)
                        {
                            provinceInfo.Children[CleanTextHelper.CleanText(d.Name)] = new LocationNode()
                            {
                                Id = d.Code,
                                OriginalName = d.Name
                            };
                        }
                    }
                } else
                {
                    item.Province = "";
                }
                // handle District
                var dKey = CleanTextHelper.CleanText(item.District);
                Console.WriteLine(dKey);
                LocationNode? districtInfo = null;
                if (!string.IsNullOrEmpty(dKey) && provinceInfo != null && provinceInfo.Children.TryGetValue(dKey, out districtInfo))
                {
                    item.District = districtInfo.OriginalName;
                    if(districtInfo.Children.Count == 0)
                    {
                        var wardList = await FetchWardsByDistrictCodeAsync(districtInfo.Id);
                        foreach(var w in wardList)
                        {
                            districtInfo.Children[CleanTextHelper.CleanText(w.Name)] = new LocationNode()
                            {
                                Id = w.Code,
                                OriginalName = w.Name
                            };
                        }
                    }
                } else
                {
                    item.District = "";
                }
                // handle Ward
                var wKey = CleanTextHelper.CleanText(item.Ward);
                LocationNode? wardInfo = null;
                if (!string.IsNullOrEmpty(wKey) && districtInfo != null && districtInfo.Children.TryGetValue(wKey, out wardInfo))
                {
                    item.Ward = wardInfo.OriginalName;
                } else
                {
                    item.Ward = "";
                }
                bool isError = false;
                // Handle Ho, Ten, TenDem, Gender
                string formattedGender = StringHelper.FormatName(item.Gender ?? string.Empty);
                if(!string.IsNullOrEmpty(formattedGender) && formattedGender != "Nam" && formattedGender != "Nữ" && formattedGender != "Khác")
                {
                    isError = true;
                    item.ErrorFields.Add("Gender");
                }
                string formattedHo = StringHelper.FormatName(item.Ho ?? string.Empty);
                if(string.IsNullOrEmpty(formattedHo)) {
                    isError = true;
                    item.ErrorFields.Add("Ho");
                }
                string formattedTenDem = StringHelper.FormatName(item.TenDem ?? string.Empty);
                string formattedTen = StringHelper.FormatName(item.Ten ?? string.Empty);
                if(string.IsNullOrEmpty(formattedTen)) {
                    isError = true;
                    item.ErrorFields.Add("Ten");
                }
                // handle SDT
                string rawSdt = item.Sdt?.Trim() ?? string.Empty;
                if(rawSdt.Length > 0 && !Regex.IsMatch(rawSdt, @"^0[0-9]{9}$")) // SDT phải bắt đầu bằng 0 và có 10 số
                {
                    item.ErrorFields.Add("Sdt");
                    isError = true;
                }
                // Format SDT: 9 số thì thêm 0, 10 số giữ nguyên
                string formattedSdt = rawSdt;
                if (rawSdt.Length == 9) 
                {
                    formattedSdt = "0" + rawSdt;
                }
                // Format Email
                string rawEmail = item.Email?.ToLower().Trim() ?? "";
                string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$";
                if(rawEmail.Length > 0 && !Regex.IsMatch(rawEmail, emailPattern))
                {
                    item.ErrorFields.Add("Email");
                    isError = true;
                }
                string formattedEmail = rawEmail;
                // Format DateOfBirth
                string formattedDateOfBirth = FormatDateHelper.FormatDate(item.DateOfBirth);
                if(!string.IsNullOrEmpty(item.DateOfBirth) && string.IsNullOrEmpty(formattedDateOfBirth))
                {
                    item.ErrorFields.Add("DateOfBirth");
                    isError = true;
                }
                if (isError)
                {
                    dataFalse.Add(new CustomerVM
                    {
                        Ho = formattedHo,
                        Ten = formattedTen,
                        TenDem = formattedTenDem,
                        HoTenDayDu = formattedHo +" "+ formattedTenDem +" "+ formattedTen,
                        Email = formattedEmail,
                        Sdt = formattedSdt,
                        DateOfBirth = item.DateOfBirth,
                        Gender = formattedGender,
                        Province = item.Province.Trim(),
                        District = item.District.Trim(),
                        Ward = item.Ward.Trim(),
                        ErrorFields = item.ErrorFields    
                    });
                    
                } else {
                    dataTrue.Add(new CustomerVM
                    {
                        Ho = formattedHo,
                        Ten = formattedTen,
                        TenDem = formattedTenDem,
                        HoTenDayDu = formattedHo +" "+ formattedTenDem +" "+ formattedTen,
                        Email = formattedEmail,
                        Sdt = formattedSdt,
                        DateOfBirth = formattedDateOfBirth,
                        Gender = formattedGender,
                        Province = item.Province.Trim(),
                        District = item.District.Trim(),
                        Ward = item.Ward.Trim() 
                    });
                }
                
                
            }   
            return (dataTrue, dataFalse, dataTrung);
        }
    private readonly MyDbContext _context;
    public CustomerRepository(MyDbContext context)
    {
        _context = context;
    }

    public object Search(
        string? keyword, 
        string? province, 
        string? sortBy, 
        string? gender,
        string? dobFrom,
        string? dobTo,
        int page = 1, 
        int pageSize = 10
        )
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            if(Regex.IsMatch(keyword, @"^\d{0,9}$")) // Nếu keyword có dạng số điện thoại (bắt đầu bằng 0 và có tối đa 10 chữ số)
            {
                query = query.Where(c => c.Sdt.Contains(keyword));
            }
             else // Mặc định tìm kiếm theo tên đầy đủ
             {
                 query = query.Where(c => c.HoTenDayDu.Contains(keyword));
             }
        }
       
        if (!string.IsNullOrEmpty(province))
        {
            query = query.Where(c => c.Province == province);
        }
        if (!string.IsNullOrEmpty(gender))
        {
            query = query.Where(c => c.Gender == gender);
        }

        if (!string.IsNullOrEmpty(dobFrom) && !string.IsNullOrEmpty(dobTo))
        {
            var fromDate = DateTime.Parse(dobFrom); // 2026-04-09 00:00:00
            var toDate = DateTime.Parse(dobTo).AddDays(1); // 2026-04-19 00:00:00

            // Lấy từ 00:00 ngày 09 đến TRƯỚC 00:00 ngày 19 (tức là hết ngày 18)
            query = query.Where(c => c.DateOfBirth >= fromDate && c.DateOfBirth < toDate);
        }
        if (!string.IsNullOrEmpty(dobFrom) && string.IsNullOrEmpty(dobTo))
        {
            var fromDate = DateTime.Parse(dobFrom);
            query = query.Where(c => c.DateOfBirth >= fromDate);
        }
        if (string.IsNullOrEmpty(dobFrom) && !string.IsNullOrEmpty(dobTo))
        {
            var toDate = DateTime.Parse(dobTo).AddDays(1);
            query = query.Where(c => c.DateOfBirth < toDate);
        }

        if (!string.IsNullOrEmpty(sortBy))
        {
            if (sortBy.Equals("HoTenDayDu_asc", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderBy(c => c.HoTenDayDu);
            }
            else if (sortBy.Equals("HoTenDayDu_desc", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderByDescending(c => c.HoTenDayDu);
            }
            else if (sortBy.Equals("DateOfBirth_asc", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderBy(c => c.DateOfBirth);
            }
            else if (sortBy.Equals("DateOfBirth_desc", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderByDescending(c => c.DateOfBirth);
            }
        } else
        {
            query = query.OrderByDescending(c => c.CreatedAt);
        }

        var listItems = query.Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CustomerVM
                    {
                        Id = c.Id,
                        Ho = c.Ho,
                        Ten = c.Ten,
                        TenDem = c.TenDem,
                        HoTenDayDu = c.HoTenDayDu,
                        Email = c.Email,
                        Sdt = c.Sdt,
                        DateOfBirth = FormatDateHelper.FormatDate(c.DateOfBirth),
                        Gender = c.Gender,
                        Province = c.Province,
                        District = c.District,
                        Ward = c.Ward
                    }).ToList();
        return new
        {
            items = listItems,
            totalItems = query.Count(),
            totalPages = (int)Math.Ceiling(query.Count() / (double)pageSize),
            currentPage = page
        };
    }



    public CustomerVM Add(CustomerModel customer)
    {
        var entity = new Customer
            {
                Ho = customer.Ho,
                Ten = customer.Ten,
                TenDem = customer.TenDem,
                HoTenDayDu = $"{customer.Ho} {customer.TenDem} {customer.Ten}",
                Email = customer.Email,
                Sdt = customer.Sdt,
                DateOfBirth = DateTime.TryParse(customer.DateOfBirth, out var dob) ? dob : (DateTime?)null,
                Gender = customer.Gender,
                Province = customer.Province,
                District = customer.District,
                Ward = customer.Ward
            };
                _context.Customers.Add(entity);
                _context.SaveChanges();
                return new CustomerVM
                {
                    Id = entity.Id,
                    Ho = entity.Ho,
                    Ten = entity.Ten,
                    TenDem = entity.TenDem,
                    HoTenDayDu = entity.HoTenDayDu,
                    Email = entity.Email,
                    Sdt = entity.Sdt,
                    DateOfBirth = FormatDateHelper.FormatDate(entity.DateOfBirth),
                    Gender = entity.Gender,
                    Province = entity.Province,
                    District = entity.District,
                    Ward = entity.Ward
                };
    }
    public object DeleteMany(List<string> ids)
    {
        var guidIds = ids.Select(id => Guid.Parse(id)).ToList();
        var customersToDelete = _context.Customers.Where(c => guidIds.Contains(c.Id)).ToList();
        _context.Customers.RemoveRange(customersToDelete);
        int countDeleted = _context.SaveChanges();
        return new { success = true, 
            message = $"Đã xóa thành công {countDeleted} mục!",
            count = countDeleted
            };
    }
    public CustomerVM Update(CustomerModel customer)
    {
        var entity = _context.Customers.FirstOrDefault(c => c.Id == customer.Id);
        if (entity != null)
        {
            entity.Ho = customer.Ho;
            entity.Ten = customer.Ten;
            entity.TenDem = customer.TenDem;
            entity.HoTenDayDu = $"{customer.Ho} {customer.TenDem} {customer.Ten}";
            entity.Email = customer.Email;
            entity.Sdt = customer.Sdt;
            entity.DateOfBirth = DateTime.TryParse(customer.DateOfBirth, out var dob) ? dob : (DateTime?)null;
            entity.Gender = customer.Gender;
            entity.Province = customer.Province;
            entity.District = customer.District;
            entity.Ward = customer.Ward;
            entity.UpdatedAt = DateTime.UtcNow;
            _context.SaveChanges();
            return new CustomerVM
            {
                Id = entity.Id,
                Ho = entity.Ho,
                Ten = entity.Ten,
                TenDem = entity.TenDem,
                HoTenDayDu = entity.HoTenDayDu,
                Email = entity.Email,
                Sdt = entity.Sdt,
                DateOfBirth = FormatDateHelper.FormatDate(entity.DateOfBirth),
                Gender = entity.Gender,
                Province = entity.Province,
                District = entity.District,
                Ward = entity.Ward
            };
        }
        return null;
    }
    public CustomerVM GetCustomerById(string id)
    {
        var guidId = Guid.Parse(id);
        var entity = _context.Customers.FirstOrDefault(c => c.Id == guidId);
        if (entity != null)
        {
            return new CustomerVM
            {
                Id = entity.Id,
                Ho = entity.Ho,
                Ten = entity.Ten,
                TenDem = entity.TenDem,
                HoTenDayDu = entity.HoTenDayDu,
                Email = entity.Email,
                Sdt = entity.Sdt,
                DateOfBirth = FormatDateHelper.FormatDate(entity.DateOfBirth),
                Gender = entity.Gender,
                Province = entity.Province,
                District = entity.District,
                Ward = entity.Ward
            };
        }
        return null;
    }
    public async Task<object> ImportExcel(IFormFile file)
    {
    if (file == null || file.Length == 0)
        return "Vui lòng chọn file Excel.";

    // Kiểm tra đuôi file
    var extension = Path.GetExtension(file.FileName).ToLower();
    if (extension != ".xlsx")
        return "Chỉ hỗ trợ file .xlsx";

    using (var stream = file.OpenReadStream())
    {
        var rows = stream.Query<CustomerVM>().ToList();
        var locdata = LocData(rows);

        var dataNomarlized = await handleNomarlizeData(rows);

        // Xử lý logic (Ví dụ: Lưu vào Database)    
        
        
        _context.Customers.AddRange(dataNomarlized.dataTrue.Select(data => new Customer
        {
                Ho = data.Ho,
                Ten = data.Ten,
                TenDem = data.TenDem,
                HoTenDayDu = data.HoTenDayDu,
                Email = data.Email,
                Sdt = data.Sdt,
                DateOfBirth = DateTime.TryParse(data.DateOfBirth, out var dob) ? dob : null,
                Gender = data.Gender,
                Province = data.Province,
                District = data.District,
                Ward = data.Ward
        }).ToList());
        await _context.SaveChangesAsync();

        return new
        {
            sucess = true,
            dataTrue = dataNomarlized.dataTrue,
            dataFalse = dataNomarlized.dataFalse,
            dataTrung = dataNomarlized.dataTrung
        };
    }
    }
    }
}
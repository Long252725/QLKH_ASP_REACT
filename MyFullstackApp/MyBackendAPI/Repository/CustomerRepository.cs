using MiniExcelLibs;
using System.Net.Http.Json;
using System.Text.RegularExpressions;
using System.Text;
using System.Text.RegularExpressions;
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
                LocationNode provinceInfo = null;
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
                LocationNode districtInfo = null;
                if(!String.IsNullOrEmpty(dKey) && Map.TryGetValue(dKey, out districtInfo))
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
                LocationNode wardInfo = null;
                if(!String.IsNullOrEmpty(wKey) && Map.TryGetValue(wKey, out wardInfo))
                {
                    item.Ward = wardInfo.OriginalName;
                } else
                {
                    item.Ward = "";
                }
                // Handle Ho, Ten, TenDem, Gender
                string formattedGender = StringHelper.FormatName(item.Gender);
                Console.WriteLine(formattedGender);
                string formattedHo = StringHelper.FormatName(item.Ho);
                string formattedTenDem = StringHelper.FormatName(item.TenDem);
                string formattedTen = StringHelper.FormatName(item.Ten);
                // handle SDT
                string rawSdt = item.Sdt.Trim();
                if(rawSdt.Length > 0 && !Regex.IsMatch(rawSdt, @"^[0-9\s\s\-()+]+$"))
                {
                    dataFalse.Add(item);
                    continue;
                }
                // Format SDT: 9 số thì thêm 0, 10 số giữ nguyên
                string formattedSdt = rawSdt;
                if (rawSdt.Length == 9) 
                {
                    formattedSdt = "0" + rawSdt;
                }
                // Format Email
                string rawEmail = item.Email.ToLower().Trim();
                string emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|vn|net)$";
                if(rawEmail.Length > 0 && !Regex.IsMatch(rawEmail, emailPattern))
                {
                    dataFalse.Add(item);
                    continue;
                }
                string formattedEmail = rawEmail;

                dataTrue.Add(new CustomerVM
                {
                    Ho = formattedHo,
                    Ten = formattedTen,
                    TenDem = formattedTenDem,
                    HoTenDayDu = formattedHo +" "+ formattedTenDem +" "+ formattedTen,
                    Email = formattedEmail,
                    Sdt = formattedSdt,
                    DateOfBirth = FormatDateHelper.FormatDate(item.DateOfBirth),
                    Gender = formattedGender,
                    Province = item.Province.Trim(),
                    District = item.District.Trim(),
                    Ward = item.Ward.Trim() 
                });
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
        string? dob,
        int page = 1, 
        int pageSize = 10
        )
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(keyword))
        {
            query = query.Where(c => c.HoTenDayDu.Contains(keyword));
        }

        if (!string.IsNullOrEmpty(province))
        {
            query = query.Where(c => c.Province == province);
        }
        if (!string.IsNullOrEmpty(gender))
        {
            query = query.Where(c => c.Gender == gender);
        }

        // if (!string.IsNullOrEmpty(dob))
        // {
        //     query = query.Where(c => c.DateOfBirth == DateTime.Parse(dob));
        // }

        if (!string.IsNullOrEmpty(sortBy))
        {
            if (sortBy.Equals("HoTenDayDu", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderBy(c => c.HoTenDayDu);
            }
            else if (sortBy.Equals("DateOfBirth", StringComparison.OrdinalIgnoreCase))
            {
                query = query.OrderBy(c => c.DateOfBirth);
            }
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
                        DateOfBirth = c.DateOfBirth,
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
                DateOfBirth = customer.DateOfBirth,
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
                    DateOfBirth = entity.DateOfBirth,
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
            entity.DateOfBirth = customer.DateOfBirth;
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
                DateOfBirth = entity.DateOfBirth,
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
                DateOfBirth = entity.DateOfBirth,
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
        foreach (var row in rows)
        {
        // Tự gán ID mới cho từng bản ghi trước khi lưu vào DB
        row.Id = Guid.NewGuid(); 
        }
        var locdata = LocData(rows);
        Console.WriteLine(locdata.UniqueData);

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
                DateOfBirth = data.DateOfBirth,
                Gender = data.Gender,
                Province = data.Province,
                District = data.District,
                Ward = data.Ward
        }).ToList());
        await _context.SaveChangesAsync();

        return new
        {
            dataTrue = dataNomarlized.dataTrue,
            dataFalse = dataNomarlized.dataFalse,
            dataTrung = dataNomarlized.dataTrung
        };
    }
    }
    }
}
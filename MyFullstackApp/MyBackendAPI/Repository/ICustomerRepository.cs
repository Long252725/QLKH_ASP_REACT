using MyBackendAPI.Models;


public interface ICustomerRepository
{
    object Search(
    string? keyword, 
    string? province, 
    string? sortBy, 
    string? gender,
    string? dobFrom,
    string? dobTo,
    int page = 1, 
    int pageSize = 10);
    object DeleteMany(List<string> ids);
    CustomerVM Add(CustomerModel customer);
    CustomerVM Update(CustomerModel customer);
    CustomerVM GetCustomerById(string id);
    Task<object> ImportExcel(IFormFile file);
    List<CustomerVM> GetCustomersSelected(string[]? ids);
    int GetTotalCustomers();
    Task<(List<StatsGender>, List<StatsProvince>)> GetStats();
}
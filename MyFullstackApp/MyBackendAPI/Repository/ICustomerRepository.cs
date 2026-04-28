public interface ICustomerRepository
{
    object Search(
    string? keyword, 
    string? province, 
    string? sortBy, 
    string? gender,
    string? dob,
    int page = 1, 
    int pageSize = 10);
    object DeleteMany(List<string> ids);
    CustomerVM Add(CustomerModel customer);
    CustomerVM Update(CustomerModel customer);
    CustomerVM GetCustomerById(string id);
    Task<object> ImportExcel(IFormFile file);
}
using Microsoft.EntityFrameworkCore;
using MyBackendAPI.Repository;
var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
var connectionString = builder.Configuration.GetConnectionString("MyDbSql");
// Đọc cấu hình từ appsettings.json
builder.Services.AddDbContext<MyDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
);
// Đăng ký MongoClient như một Singleton
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.WithOrigins(allowedOrigins) // Port mặc định của Vite/React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReact");
app.MapControllers();

app.Run();
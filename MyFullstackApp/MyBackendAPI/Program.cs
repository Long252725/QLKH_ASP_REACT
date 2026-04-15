using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);
var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
// Đọc cấu hình từ appsettings.json
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDB"));

// Đăng ký MongoClient như một Singleton
builder.Services.AddSingleton<IMongoClient>(s =>
    new MongoClient(builder.Configuration.GetValue<string>("MongoDB:ConnectionString")));
// 1. Thêm dịch vụ CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowReact", policy => {
        policy.WithOrigins(allowedOrigins) // Port mặc định của Vite/React
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// 2. Thêm dịch vụ Controllers
builder.Services.AddControllers();


// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
// 2. Sử dụng CORS (Đặt trước MapControllers)
app.UseCors("AllowReact");

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};
app.MapControllers();

app.Run();
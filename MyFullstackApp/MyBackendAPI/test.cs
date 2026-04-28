// using MongoDB.Driver;

// var builder = WebApplication.CreateBuilder(args);
// var allowedOrigins = builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173";
// // Đọc cấu hình từ appsettings.json
// builder.Services.Configure<MongoDbSettings>(
//     builder.Configuration.GetSection("MongoDB"));

// // Đăng ký MongoClient như một Singleton
// builder.Services.AddSingleton<IMongoClient>(s =>
//     new MongoClient(builder.Configuration.GetValue<string>("MongoDB:ConnectionString")));

// builder.Services.AddCors(options => {
//     options.AddPolicy("AllowReact", policy => {
//         policy.WithOrigins(allowedOrigins) // Port mặc định của Vite/React
//               .AllowAnyHeader()
//               .AllowAnyMethod();
//     });
// });

// builder.Services.AddControllers();
// builder.Services.AddOpenApi();

// var app = builder.Build();

// if (app.Environment.IsDevelopment())
// {
//     app.MapOpenApi();
// }

// app.UseHttpsRedirection();
// app.UseCors("AllowReact");
// app.MapControllers();

// app.Run();
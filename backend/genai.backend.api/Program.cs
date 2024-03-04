using genai.backend.api.Data;
using genai.backend.api.Hub;
using genai.backend.api.Models;
using genai.backend.api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySQL(builder.Configuration.GetConnectionString("OracleDb")));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<SemanticService>();
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<ChatHub>();
builder.Services.AddScoped<ResponseStream>();
builder.Services.AddSignalR();
builder.Services.AddSingleton<IDictionary<string, ChatHubConnection>>(new Dictionary<string, ChatHubConnection>());

string? corsAllowedHosts = builder.Configuration.GetValue("CorsAllowedHosts", string.Empty);

if (string.IsNullOrEmpty(corsAllowedHosts))
{
    throw new ApplicationException("No CORS allowed hosts specified in configuration, can be multiple values semicolon delimited");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowAll",
        builder =>
            builder
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
            .WithOrigins(corsAllowedHosts.Split(';'))
        );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapHub<ChatHub>(pattern: "/chat");

app.UseAuthorization();

app.MapControllers();

app.Run();

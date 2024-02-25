using genai.backend.api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<SemanticService>();


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
            .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
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

app.UseAuthorization();

app.MapControllers();

app.Run();

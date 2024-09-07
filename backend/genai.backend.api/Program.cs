using Cassandra;
using genai.backend.api.Hub;
using genai.backend.api.Models;
using genai.backend.api.Plugins;
using genai.backend.api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.Configuration;

var builder = WebApplication.CreateBuilder(args);

/*// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseMySQL(builder.Configuration.GetConnectionString("OracleDb")));*/

// Configure Cassandra
var cassandraCluster = Cluster.Builder()
    .AddContactPoint(builder.Configuration.GetValue<string>("Cassandra:Host"))
    .WithPort(builder.Configuration.GetValue<int>("Cassandra:Port"))
    .Build();
var session = cassandraCluster.Connect(builder.Configuration.GetValue<string>("Cassandra:Keyspace"));

builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration.GetValue<string>("Jwt:SecretKey"))),
        ValidateIssuer = false,
        ValidateAudience = false,
        ClockSkew = TimeSpan.Zero
    };
});
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// Register Cassandra session with DI container
builder.Services.AddSingleton<Cassandra.ISession>(session);
builder.Services.AddMemoryCache();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSingleton<BingPlugin>();
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
            .WithExposedHeaders("Authorization")
        );
});

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "GenAI Backend API V1");
    c.RoutePrefix = string.Empty;
});

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapHub<ChatHub>(pattern: "/hub").AllowAnonymous();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

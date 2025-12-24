using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Foot2site_V1.Data;
using System.Reflection;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<Foot2site_V1Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Foot2site_V1Context") ?? throw new InvalidOperationException("Connection string 'Foot2site_V1Context' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddSwaggerGen(options =>
{
    // Informations générales sur l'API
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Foot2sité API",
        Description = "API REST pour la gestion de la boutique de maillots de football",
        Contact = new OpenApiContact
        {
            Name = "Équipe Foot2sité",
            Email = "la227472@student.helha.be"
        },
        License = new OpenApiLicense
        {
            Name = "Utilisation libre",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez le token JWT sous la forme : Bearer {votre_token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    options.IncludeXmlComments(xmlPath);
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// Pour les autorisations CORS
app.UseCors("AngularApp");

app.MapControllers();

app.Run();

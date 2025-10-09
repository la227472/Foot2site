using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Foot2site_V1.Data;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<Foot2site_V1Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Foot2site_V1Context") ?? throw new InvalidOperationException("Connection string 'Foot2site_V1Context' not found.")));

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

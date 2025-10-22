using System.Security.Claims;
using System.Text;
using IdentityDemo.IdentityService;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Components.RenderTree;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TaskManagerApi.Data.Database;
using TaskManagerApi.Endpoints;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddSingleton<JwtService>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IUser, CurrentUser>();
builder.Services.AddCors();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));


var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);  // Encodes the JWT secret key string to a byte array


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ManagerOnly", policy => policy.RequireRole("Manager"));
});


builder.Services.AddScoped<DynamoAuthService>();
builder.Services.AddScoped<DynamoProjectService>();
builder.Services.AddScoped<DynamoUserService>();
builder.Services.AddScoped<DynamoBugService>();

// var awsRegion = Amazon.RegionEndpoint.EUNorth1;
// var awsAccessKey = builder.Configuration["AWS:AccessKey"];
// var awsSecretKey = builder.Configuration["AWS:SecretKey"];

// builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
// {
//     return new AmazonDynamoDBClient(awsAccessKey, awsSecretKey, awsRegion);
// });


builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
{
    var config = new AmazonDynamoDBConfig
    {
        ServiceURL = "http://localhost:8000", 
        UseHttp = true
    };

    return new AmazonDynamoDBClient("FakeId", "FakeSecretKey", config);
});



builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;

        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        Console.WriteLine("Exception caught by middleware:");
        Console.WriteLine(exception?.GetType().FullName);
        Console.WriteLine(exception?.Message);
        Console.WriteLine(exception?.StackTrace);


        var response = ApiResponse<string>.Fail(exception?.Message ?? "Internal Server Error");

        await context.Response.WriteAsJsonAsync(response);
    });
});

app.UseCors(policy =>
    policy.AllowAnyOrigin()
          .AllowAnyMethod()
          .AllowAnyHeader());

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "uploads")),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();

app.MapAuthEndpoints();
app.MapUsersEndpoints();
app.MapProjectEndpoints();
app.MapBugEndpoints();

app.Run();
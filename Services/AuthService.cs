using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using GenericRepositoryApp.Models;

public class AuthService
{
    private readonly IConfiguration _config;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(IConfiguration config, IUnitOfWork unitOfWork)
    {
        _config = config;
        _unitOfWork = unitOfWork;
    }

    public string HashPassword(string password)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        var bytes = sha.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    public bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: creds);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public async Task<User?> GetUserAsync(string username)
    {
        var users = await _unitOfWork.Users.GetAllAsync();
        return users.FirstOrDefault(u => u.Username == username);
    }

    public async Task<User> CreateUserAsync(string username, string password)
    {
        var user = new User
        {
            Username = username,
            PasswordHash = HashPassword(password)
        };
        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.CompleteAsync();
        return user;
    }
}

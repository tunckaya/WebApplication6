using Microsoft.AspNetCore.Mvc;
using GenericRepositoryApp.Models;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly AuthService _authService;

    public UserController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserLogin request)
    {
        var user = await _authService.CreateUserAsync(request.Username, request.Password);
        return Ok(new { user.Id, user.Username });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLogin request)
    {
        var user = await _authService.GetUserAsync(request.Username);
        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized();
        }
        var token = _authService.GenerateToken(user);
        return Ok(new { token });
    }
}

public class UserLogin
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

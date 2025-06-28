using GenericRepositoryApp.Data;
using GenericRepositoryApp.Models;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    private IGenericRepository<Point>? _pointsRepository;
    public IGenericRepository<Point> Points => _pointsRepository ??= new GenericRepository<Point>(_context);

    private IGenericRepository<AnotherEntity>? _anotherEntityRepository;
    public IGenericRepository<AnotherEntity> AnotherEntities => _anotherEntityRepository ??= new GenericRepository<AnotherEntity>(_context);

    private IGenericRepository<User>? _userRepository;
    public IGenericRepository<User> Users => _userRepository ??= new GenericRepository<User>(_context);

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync(); // Tüm değişiklikleri kaydet
    }

    public void Dispose()
    {
        _context.Dispose(); // Bellek yönetimi
    }
}

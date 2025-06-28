using GenericRepositoryApp.Models;

public class PointService
{
    private readonly IUnitOfWork _unitOfWork;

    public PointService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<Point>> GetAllPointsAsync()
    {
        return await _unitOfWork.Points.GetAllAsync();
    }

    public async Task<Point?> GetPointByIdAsync(int id)
    {
        return await _unitOfWork.Points.GetByIdAsync(id);
    }

    public async Task AddPointAsync(Point point)
    {
        await _unitOfWork.Points.AddAsync(point);
        await _unitOfWork.CompleteAsync(); // Değişiklikleri veritabanına kaydet
    }

    public async Task UpdatePointAsync(Point point)
    {
        _unitOfWork.Points.Update(point);
        await _unitOfWork.CompleteAsync(); // Güncellemeyi kaydet
    }

    public async Task DeletePointAsync(int id)
    {
        var point = await _unitOfWork.Points.GetByIdAsync(id);
        if (point != null)
        {
            _unitOfWork.Points.Delete(point);
            await _unitOfWork.CompleteAsync(); // Silme işlemini kaydet
        }
    }
}

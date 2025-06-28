using Microsoft.AspNetCore.Mvc;
using GenericRepositoryApp.Models;

[ApiController]
[Route("api/[controller]")]
public class PointsController : ControllerBase
{
    private readonly PointService _pointService;

    public PointsController(PointService pointService)
    {
        _pointService = pointService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Point>>> GetPoints()
    {
        var points = await _pointService.GetAllPointsAsync();
        return Ok(points);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Point>> GetPointById(int id)
    {
        var point = await _pointService.GetPointByIdAsync(id);
        if (point == null)
        {
            return NotFound();
        }
        return Ok(point);
    }

    [HttpPost]
    public async Task<ActionResult> CreatePoint(Point point)
    {
        await _pointService.AddPointAsync(point);
        return CreatedAtAction(nameof(GetPointById), new { id = point.Id }, point);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdatePoint(int id, Point point)
    {
        if (id != point.Id)
        {
            return BadRequest();
        }
        await _pointService.UpdatePointAsync(point); // Değişiklikler kaydedilecek
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeletePoint(int id)
    {
        await _pointService.DeletePointAsync(id); // Silme işlemi kaydedilecek
        return NoContent();
    }
}

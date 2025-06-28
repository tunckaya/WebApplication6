using Microsoft.EntityFrameworkCore;
using GenericRepositoryApp.Models;

namespace GenericRepositoryApp.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Point> Points { get; set; }
        public DbSet<AnotherEntity> AnotherEntities { get; set; }  // Eklenen diğer entity'ler
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>().ToTable("Points"); // Tablo adını manuel olarak belirtin
            modelBuilder.Entity<AnotherEntity>().ToTable("AnotherEntities"); // Diğer entity'ler için de tablo adı belirtin
            modelBuilder.Entity<User>().ToTable("Users");
        }
    }
}

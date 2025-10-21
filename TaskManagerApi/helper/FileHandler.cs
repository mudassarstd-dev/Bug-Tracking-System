

namespace TaskManagerApi.helper;

public static class FileHandler
{
    private static readonly string UploadsRoot = Path.Combine(Directory.GetCurrentDirectory(), "uploads");

    public static async Task<string> SaveFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Invalid file provided.");

        if (!Directory.Exists(UploadsRoot))
            Directory.CreateDirectory(UploadsRoot);

        var extension = Path.GetExtension(file.FileName);
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(UploadsRoot, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return filePath;
    }

    public static void DeleteFile(string fileName)
    {
        var filePath = Path.Combine(UploadsRoot, fileName);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
    }

    public static async Task<FileStream?> GetFileAsync(string absolutePath)
    {
        if (string.IsNullOrWhiteSpace(absolutePath)) return null; if (!File.Exists(absolutePath)) return null;
        return new FileStream(absolutePath, FileMode.Open, FileAccess.Read, FileShare.Read);
    }
}

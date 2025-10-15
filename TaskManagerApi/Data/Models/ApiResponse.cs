using System.Text.Json.Serialization;

public class ApiResponse<T>
{
    public bool Success { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public T? Data { get; set; }

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Message { get; set; }   

    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Error { get; set; }   
    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
     public ErrorCode? Code { get; set; }

    public static ApiResponse<T> Ok(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }

       public static ApiResponse<T> Fail(string error, ErrorCode code = ErrorCode.Unknown)
        => new() { Success = false, Error = error, Code = code };
}
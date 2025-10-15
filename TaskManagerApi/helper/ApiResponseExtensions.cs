public static class ApiResponseExtensions
{
    public static IResult ToHttpResult<T>(this ApiResponse<T> response) =>
        response switch
        {
            { Success: true } => TypedResults.Ok(response),
            { Code: ErrorCode.UserExists } => TypedResults.Conflict(response),
            { Code: ErrorCode.InvalidRole } => TypedResults.BadRequest(response),
            { Code: ErrorCode.InvalidCredentials } => TypedResults.Unauthorized(),
            { Code: ErrorCode.ValidationError } => TypedResults.BadRequest(response),
            _ => TypedResults.BadRequest(response)
        };
}

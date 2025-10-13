namespace TaskManagerApi.Data.Models;

public class TaskAssignment
{
    public int Id { get; set; }
    public int AssignedBy { get; set; }
    public int AssignedTo { get; set; }
    public DateTime TimeStamp { get; set; }

    public static TaskAssignment Create(int to, int by)
    {
        return new TaskAssignment
        {
            AssignedBy = by,
            AssignedTo = to,
            TimeStamp = DateTime.Now
        };
    }
}
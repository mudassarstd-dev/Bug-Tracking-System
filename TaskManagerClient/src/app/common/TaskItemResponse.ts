import { TaskStatus } from "./TaskStatus";

export interface TaskItemResponse {
  status: TaskStatus,
  title: string,
  description: string,
  assignedTo: number  
}
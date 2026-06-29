import { Task } from '../types';

const TASKS_KEY = 'getsft_tasks';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    realtorId: 'david',
    leadId: 'inq-1',
    leadName: 'Eleanor Vance',
    title: 'Call Buyer to confirm Friday viewing',
    dueDate: '2026-06-25',
    priority: 'High',
    status: 'Pending'
  },
  {
    id: 'task-2',
    realtorId: 'david',
    leadId: 'inq-2',
    leadName: 'René Larson',
    title: 'Send Triple Glazing spec sheet and insulation report',
    dueDate: '2026-06-26',
    priority: 'Medium',
    status: 'Pending'
  },
  {
    id: 'task-3',
    realtorId: 'sarah',
    leadId: 'inq-3',
    leadName: 'Charles Belmont',
    title: 'Provide Heliport coordinates and slot scheduling contract',
    dueDate: '2026-06-24',
    priority: 'High',
    status: 'Completed'
  }
];

export const taskService = {
  async getTasks(realtorId?: string): Promise<Task[]> {
    if (typeof window === 'undefined') return INITIAL_TASKS;
    const stored = localStorage.getItem(TASKS_KEY);
    let tasks: Task[] = stored ? JSON.parse(stored) : INITIAL_TASKS;
    if (realtorId) {
      tasks = tasks.filter(t => t.realtorId === realtorId);
    }
    return tasks;
  },
  async saveTasks(tasks: Task[]): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  },
  async addTask(task: Task): Promise<Task> {
    const tasks = await this.getTasks();
    tasks.unshift(task);
    await this.saveTasks(tasks);
    return task;
  },
  async updateTask(task: Task): Promise<Task> {
    const tasks = await this.getTasks();
    const updated = tasks.map(t => t.id === task.id ? task : t);
    await this.saveTasks(updated);
    return task;
  },
  async deleteTask(id: string): Promise<boolean> {
    const tasks = await this.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    await this.saveTasks(filtered);
    return tasks.length > filtered.length;
  }
};

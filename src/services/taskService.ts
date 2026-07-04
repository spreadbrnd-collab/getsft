import { Task } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from '../firebase';

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
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      if (snap.empty) {
        console.log('Seeding initial tasks...');
        for (const t of INITIAL_TASKS) {
          await setDoc(doc(db, 'tasks', t.id), t);
        }
        return realtorId ? INITIAL_TASKS.filter(t => t.realtorId === realtorId) : INITIAL_TASKS;
      }
      const tasks: Task[] = [];
      snap.forEach(docSnap => {
        tasks.push(docSnap.data() as Task);
      });
      if (realtorId) {
        return tasks.filter(t => t.realtorId === realtorId);
      }
      return tasks;
    } catch (err) {
      console.error('Error fetching tasks from Firestore:', err);
      return realtorId ? INITIAL_TASKS.filter(t => t.realtorId === realtorId) : INITIAL_TASKS;
    }
  },

  async addTask(task: Task): Promise<Task> {
    try {
      await setDoc(doc(db, 'tasks', task.id), task);
      return task;
    } catch (err) {
      console.error('Error adding task in Firestore:', err);
      throw err;
    }
  },

  async updateTask(task: Task): Promise<Task> {
    try {
      await setDoc(doc(db, 'tasks', task.id), task);
      return task;
    } catch (err) {
      console.error('Error updating task in Firestore:', err);
      throw err;
    }
  },

  async deleteTask(id: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, 'tasks', id));
      return true;
    } catch (err) {
      console.error('Error deleting task from Firestore:', err);
      return false;
    }
  }
};

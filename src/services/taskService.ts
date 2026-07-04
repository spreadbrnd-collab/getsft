import { Task } from '../types';
import { db, collection, doc, getDocs, setDoc, deleteDoc } from '../firebase';

export const taskService = {
  async getTasks(realtorId?: string): Promise<Task[]> {
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const tasks: Task[] = [];
      snap.forEach(docSnap => {
        const t = docSnap.data() as Task;
        if (t && t.realtorId !== 'david' && t.realtorId !== 'sarah' && t.realtorId !== 'julian') {
          tasks.push(t);
        }
      });
      if (realtorId) {
        return tasks.filter(t => t.realtorId === realtorId);
      }
      return tasks;
    } catch (err) {
      console.error('Error fetching tasks from Firestore:', err);
      return [];
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

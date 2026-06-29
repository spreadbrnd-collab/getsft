import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Trash2, Plus, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Task, Realtor, Inquiry } from '../types';
import { taskService } from '../services/taskService';
import { leadService } from '../services/leadService';

interface TasksTabProps {
  currentUser: { id: string };
  realtor: Realtor;
  showToast: (msg: string) => void;
}

export default function TasksTab({
  currentUser,
  realtor,
  showToast,
}: TasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [leads, setLeads] = useState<Inquiry[]>([]);

  // Task Form State
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('2026-06-25');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('High');
  const [selectedLeadId, setSelectedLeadId] = useState('');

  useEffect(() => {
    async function init() {
      const fetchedTasks = await taskService.getTasks(realtor.id);
      setTasks(fetchedTasks);
      const fetchedLeads = await leadService.getLeads(realtor.id);
      setLeads(fetchedLeads);
    }
    init();
  }, [realtor.id]);

  const handleToggleStatus = async (task: Task) => {
    const nextStatus: 'Pending' | 'Completed' = task.status === 'Pending' ? 'Completed' : 'Pending';
    const updated: Task = { ...task, status: nextStatus };
    await taskService.updateTask(updated);
    setTasks(prev => prev.map(t => t.id === task.id ? updated : t));
    showToast(`Task marked as ${nextStatus}`);
  };

  const handleDelete = async (id: string) => {
    const success = await taskService.deleteTask(id);
    if (success) {
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task deleted successfully.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedLead = leads.find(l => l.id === selectedLeadId);

    const newTask: Task = {
      id: 'task-' + Date.now(),
      realtorId: realtor.id,
      leadId: selectedLeadId || undefined,
      leadName: matchedLead ? matchedLead.name : undefined,
      title,
      dueDate,
      priority,
      status: 'Pending'
    };

    await taskService.addTask(newTask);
    setTasks(prev => [newTask, ...prev]);
    setIsCreating(false);
    setTitle('');
    setSelectedLeadId('');
    showToast('New CRM task registered successfully.');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Pending') return t.status === 'Pending';
    if (filter === 'Completed') return t.status === 'Completed';
    return true;
  });

  const priorityColors = {
    'High': 'text-red-700 bg-red-50 border border-red-200',
    'Medium': 'text-amber-700 bg-amber-50 border border-amber-200',
    'Low': 'text-neutral-600 bg-neutral-100 border border-neutral-200',
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-xs tracking-widest text-neutral-400 uppercase">Operational Workflows</span>
          <h1 className="text-3xl font-display font-medium tracking-tight text-neutral-900 mt-1">
            CRM Tasks Console
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Stay organized. Link direct client actions like viewing follow-ups, spec sheet dispatches, and contracts signing.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full flex items-center gap-2 cursor-pointer shadow-sm transition-transform active:scale-95"
          id="tasks-add-new-btn"
        >
          <Plus className="w-4 h-4" />
          Add CRM Task
        </button>
      </header>

      {/* Stats indicators + Quick filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-neutral-100">
        <div className="flex items-center gap-2">
          {['All', 'Pending', 'Completed'].map((opt) => {
            const count = tasks.filter(t => opt === 'All' ? true : opt === 'Pending' ? t.status === 'Pending' : t.status === 'Completed').length;
            const isSel = filter === opt;
            return (
              <button
                key={opt}
                onClick={() => setFilter(opt as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-mono tracking-wide transition-all ${
                  isSel ? 'bg-neutral-950 text-white font-bold' : 'bg-white border border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                }`}
              >
                {opt} ({count})
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-mono text-neutral-400 uppercase">
          Realtor: {realtor.name}
        </span>
      </div>

      {/* Task Rows Grid */}
      <div className="bg-white border border-neutral-150 rounded-[24px] overflow-hidden shadow-xs">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-24 text-neutral-400 text-xs font-sans italic flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8 text-neutral-200" />
            <span>All clear! No tasks under this filter.</span>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {filteredTasks.map((task) => {
              const isComp = task.status === 'Completed';
              return (
                <div key={task.id} className="p-6 hover:bg-neutral-50/30 transition-colors flex items-center justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="p-1 text-neutral-400 hover:text-black transition-colors"
                      id={`toggle-task-${task.id}`}
                    >
                      {isComp ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <span className={`text-sm font-medium block leading-snug ${isComp ? 'text-neutral-400 line-through decoration-neutral-300' : 'text-neutral-900'}`}>
                        {task.title}
                      </span>
                      
                      <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                        {task.leadName && (
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold">
                            Lead: {task.leadName}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-neutral-400">
                          <Clock className="w-3.5 h-3.5" /> Due: {task.dueDate}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          priorityColors[task.priority as keyof typeof priorityColors] || 'bg-neutral-100'
                        }`}>
                          {task.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-2 text-neutral-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    id={`delete-task-${task.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE TASK DIALOG OVERLAY */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] border border-neutral-150 p-8 max-w-md w-full shadow-2xl space-y-6">
            <h3 className="text-xl font-display font-semibold tracking-tight text-neutral-950">
              Create New CRM Task
            </h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Task Description / Action</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call Charles to confirm booking"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black"
                  id="new-task-title-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟡 Medium</option>
                    <option value="Low">⚪ Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono tracking-wider uppercase text-neutral-400 mb-1">Link to Lead (Optional)</label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-xl text-xs font-sans outline-none focus:border-black bg-white"
                >
                  <option value="">No Lead Linked</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>{lead.name} ({lead.property_title})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-sans font-medium rounded-full cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-black hover:bg-neutral-900 text-white text-xs font-sans font-medium rounded-full cursor-pointer shadow-sm"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

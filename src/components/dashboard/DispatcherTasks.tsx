"use client";
import { useState } from "react";
import { Plus, Check, Trash2, Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function DispatcherTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  const addTask = () => {
    if (!newTask.trim()) return;
    setAdding(true);
    setTimeout(() => {
      setTasks([...tasks, { id: Date.now().toString(), title: newTask.trim(), completed: false }]);
      setNewTask("");
      setAdding(false);
    }, 300);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h4 className="text-sm font-display font-semibold text-foreground mb-3">Dispatcher Tasks</h4>

      <div className="flex gap-2 mb-3">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Add a task..."
          className="flex-1 bg-secondary border border-border rounded-md px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={addTask}
          disabled={adding || !newTask.trim()}
          className="shrink-0 h-8 w-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">No tasks yet</p>
      ) : (
        <div className="space-y-1 max-h-[300px] overflow-y-auto">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs group transition-colors ${
                task.completed ? "opacity-50" : ""
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={`shrink-0 h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                  task.completed
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border hover:border-primary"
                }`}
              >
                {task.completed && <Check className="h-3 w-3" />}
              </button>
              <span className={`flex-1 truncate ${task.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {task.title}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="shrink-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive/80 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Plus, GripVertical } from "lucide-react";

type TaskStatus = "todo" | "in-progress" | "done";

interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  date: string;
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "서초 래미안 아파트 101동 누수 탐지", status: "in-progress", date: "2026-04-02" },
  { id: "2", title: "송파 다세대 주택 배관 공사", status: "todo", date: "2026-04-03" },
  { id: "3", title: "강남 빌라 옥상 방수", status: "done", date: "2026-04-01" },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      date: new Date().toISOString().split("T")[0],
    };
    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const statusMap: Record<TaskStatus, { label: string, color: string, icon: any }> = {
    "todo": { label: "대기 중", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    "in-progress": { label: "진행 중", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Clock },
    "done": { label: "완료", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Add Task */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="새로운 작업 입력..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition flex items-center justify-center shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {(["todo", "in-progress", "done"] as TaskStatus[]).map(status => {
          const statusTasks = tasks.filter(t => t.status === status);
          if (statusTasks.length === 0) return null;

          return (
            <div key={status} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 px-1 border-b pb-2 flex items-center justify-between">
                {statusMap[status].label}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{statusTasks.length}</span>
              </h3>
              <div className="space-y-2">
                {statusTasks.map(task => (
                  <div key={task.id} className="bg-white border text-sm border-gray-200 p-4 rounded-xl shadow-sm flex items-center justify-between gap-3 group sm:hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 w-full">
                      <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                        <GripVertical size={16} />
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span className={`font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                          {task.title}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">{task.date}</span>
                      </div>
                    </div>
                    {/* Status Dropdown/Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`text-xs px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer font-medium ${statusMap[task.status].color}`}
                      >
                        <option value="todo">대기 중</option>
                        <option value="in-progress">진행 중</option>
                        <option value="done">완료</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

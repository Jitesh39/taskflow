"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../utils/api";
import DashboardLayout from "@/components/DashboardLayout";
import TaskTable from "@/components/TaskTable";
import TaskForm from "@/components/TaskForm";
import { CheckSquare, Plus } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [role, setRole] = useState<"Admin" | "Member">("Member");
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role") as "Admin" | "Member";
    if (!userRole) {
      router.push("/login");
      return;
    }
    setRole(userRole);
    fetchData(userRole);
  }, [router]);

  const fetchData = async (userRole: "Admin" | "Member") => {
    try {
      const p = [api.get("/tasks")];
      if (userRole === "Admin") {
        p.push(api.get("/users"));
        p.push(api.get("/projects"));
      }
      const results = await Promise.all(p);
      setTasks(results[0].data);
      if (userRole === "Admin") {
        setUsers(results[1].data);
        setProjects(results[2].data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    }
  };

  const handleCreateTask = async (taskData: any) => {
    await api.post("/tasks", taskData);
    toast.success("Task created successfully!");
    setShowTaskForm(false);
    fetchData(role);
  };

  const handleUpdateTask = async (taskId: string, formData: FormData) => {
    try {
      await api.put(`/tasks/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Task updated successfully");
      fetchData(role);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update task");
      throw err; // throw so modal can catch it
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success("Task deleted");
        fetchData(role);
      } catch (err) {
        toast.info("Delete functionality not fully implemented on backend");
      }
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <CheckSquare className="text-primary" size={28} /> {role === "Admin" ? "Assign Tasks" : "My Tasks"}
          </h3>
          <p className="text-muted m-0 mt-1">
            {role === "Admin" ? "Manage all tasks across all projects." : "Track and update your assigned tasks."}
          </p>
        </div>
        {role === "Admin" && !showTaskForm && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowTaskForm(true)}>
            <Plus size={18} /> New Task
          </button>
        )}
      </div>

      {showTaskForm && role === "Admin" && (
        <TaskForm projects={projects} users={users} onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)} />
      )}

      <TaskTable 
        tasks={tasks} 
        role={role} 
        onUpdateTask={handleUpdateTask}
        onDelete={handleDeleteTask}
        onEdit={(task) => toast.info("Edit feature not fully implemented yet.")}
      />
    </DashboardLayout>
  );
}

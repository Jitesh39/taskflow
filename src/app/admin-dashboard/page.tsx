"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { isPast } from "date-fns";
import api from "../utils/api";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskTable from "@/components/TaskTable";
import TaskForm from "@/components/TaskForm";
import { Plus } from "lucide-react";

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedEditTask, setSelectedEditTask] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Admin") {
      router.push("/login");
      return;
    }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, projectsRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/users"),
        api.get("/projects")
      ]);
      setTasks(tasksRes.data);
      setUsers(usersRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleCreateTask = async (taskData: any) => {
    await api.post("/tasks", taskData);
    toast.success("Task created successfully!");
    setShowTaskForm(false);
    fetchData();
  };

  const handleUpdateTask = async () => {
    if (!selectedEditTask) return;
    try {
      await api.put(`/tasks/${selectedEditTask._id}`, {
        title: selectedEditTask.title,
        assignedTo: selectedEditTask.assignedTo?._id || selectedEditTask.assignedTo,
        deadline: selectedEditTask.deadline,
      });
      toast.success("Task updated successfully!");
      setSelectedEditTask(null);
      fetchData();
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await api.delete(`/tasks/${taskId}`);
        toast.success("Task deleted");
        fetchData();
      } catch (err) {
        toast.error("Failed to delete task");
      }
    }
  };

  const isOverdue = (deadline: string, status: string) => {
    if (!deadline || status === "Completed") return false;
    return isPast(new Date(deadline));
  };

  const metrics = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    pending: tasks.filter((t) => t.status === "Pending" || t.status === "In Progress").length,
    overdue: tasks.filter((t) => isOverdue(t.deadline, t.status)).length,
  };

  return (
    <DashboardLayout role="Admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark">Dashboard Overview</h3>
          <p className="text-muted m-0">Here's what's happening with your projects today.</p>
        </div>
        {!showTaskForm && (
          <button className="btn btn-primary d-flex align-items-center gap-2 fw-medium shadow-sm" onClick={() => setShowTaskForm(true)}>
            <Plus size={18} /> <span className="d-none d-sm-inline">New Task</span>
          </button>
        )}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Assigned Tasks" value={metrics.total} type="total" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Completed" value={metrics.completed} type="completed" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Pending" value={metrics.pending} type="pending" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Overdue" value={metrics.overdue} type="overdue" /></div>
      </div>

      {showTaskForm && (
        <TaskForm projects={projects} users={users} onSubmit={handleCreateTask} onClose={() => setShowTaskForm(false)} />
      )}

      <TaskTable
        tasks={tasks}
        role="Admin"
        onDelete={handleDeleteTask}
        onEdit={(task) => setSelectedEditTask({ ...task, assignedTo: task.assignedTo?._id || task.assignedTo })}
      />

      {/* Edit Task Modal */}
      {selectedEditTask && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
          <div className="modal-box shadow-lg border-0 animate-zoom-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold m-0 text-dark">Edit Task</h4>
              <button className="btn-close shadow-none" onClick={() => setSelectedEditTask(null)}></button>
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-medium small">Task Title</label>
              <input
                type="text"
                className="form-control"
                value={selectedEditTask.title}
                onChange={(e) => setSelectedEditTask({ ...selectedEditTask, title: e.target.value })}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-muted fw-medium small">Assigned To</label>
              <select
                className="form-select"
                value={selectedEditTask.assignedTo?._id || selectedEditTask.assignedTo}
                onChange={(e) => setSelectedEditTask({ ...selectedEditTask, assignedTo: e.target.value })}
              >
                {users.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label text-muted fw-medium small">Deadline</label>
              <input
                type="date"
                className="form-control"
                value={selectedEditTask.deadline ? new Date(selectedEditTask.deadline).toISOString().split("T")[0] : ""}
                onChange={(e) => setSelectedEditTask({ ...selectedEditTask, deadline: e.target.value })}
              />
            </div>

            <div className="d-flex gap-2">
              <button className="btn btn-primary flex-grow-1 py-2 fw-bold" onClick={handleUpdateTask}>Save Changes</button>
              <button className="btn btn-light border flex-grow-1 py-2 fw-bold" onClick={() => setSelectedEditTask(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-box {
          background: white;
          padding: 30px;
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
        }
        .animate-zoom-in {
          animation: zoomIn 0.2s ease-out;
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </DashboardLayout>
  );
}

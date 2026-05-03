"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { isPast } from "date-fns";
import api from "../utils/api";

import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import TaskTable from "@/components/TaskTable";

export default function MemberDashboard() {
  const [tasks, setTasks] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Member") {
      router.push("/login");
      return;
    }
    fetchTasks();
  }, [router]);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    }
  };

  const handleUpdateTask = async (taskId: string, formData: FormData) => {
    try {
      await api.put(`/tasks/${taskId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Task updated successfully");
      fetchTasks();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update task");
      throw err; // throw so modal can catch it
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
    <DashboardLayout role="Member">
      <div className="mb-4">
        <h3 className="fw-bold m-0 text-dark">My Workspace</h3>
        <p className="text-muted m-0">Track and update your assigned tasks here.</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="My Tasks" value={metrics.total} type="total" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Completed" value={metrics.completed} type="completed" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Pending" value={metrics.pending} type="pending" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Overdue" value={metrics.overdue} type="overdue" /></div>
      </div>

      <TaskTable 
        tasks={tasks} 
        role="Member" 
        onUpdateTask={handleUpdateTask}
      />
    </DashboardLayout>
  );
}

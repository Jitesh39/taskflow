import React, { useState } from "react";
import { Plus, X } from "lucide-react";

interface TaskFormProps {
  projects: any[];
  users: any[];
  onSubmit: (task: any) => Promise<void>;
  onClose: () => void;
}

export default function TaskForm({ projects, users, onSubmit, onClose }: TaskFormProps) {
  const [task, setTask] = useState({ title: "", description: "", projectId: "", assignedTo: "", deadline: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title || !task.projectId || !task.assignedTo || !task.deadline) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(task);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-semibold text-dark d-flex align-items-center gap-2">
          <Plus size={20} className="text-primary" /> Create New Task
        </h5>
        <button className="btn btn-sm btn-light rounded-circle p-2" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="card-body p-4">
        {error && <div className="alert alert-danger py-2 px-3 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted fw-medium text-sm mb-1" style={{ fontSize: '0.85rem' }}>Task Title *</label>
              <input type="text" className="form-control shadow-none border-secondary-subtle" placeholder="What needs to be done?" value={task.title} onChange={e => setTask({...task, title: e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted fw-medium text-sm mb-1" style={{ fontSize: '0.85rem' }}>Deadline *</label>
              <input type="date" className="form-control shadow-none border-secondary-subtle" value={task.deadline} onChange={e => setTask({...task, deadline: e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted fw-medium text-sm mb-1" style={{ fontSize: '0.85rem' }}>Project *</label>
              <select className="form-select shadow-none border-secondary-subtle" value={task.projectId} onChange={e => setTask({...task, projectId: e.target.value})}>
                <option value="">Select Project...</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted fw-medium text-sm mb-1" style={{ fontSize: '0.85rem' }}>Assign To *</label>
              <select className="form-select shadow-none border-secondary-subtle" value={task.assignedTo} onChange={e => setTask({...task, assignedTo: e.target.value})}>
                <option value="">Select Team Member...</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-12 mt-4 d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light px-4 fw-medium" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4 fw-medium" disabled={loading}>
                {loading ? "Saving..." : "Save Task"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

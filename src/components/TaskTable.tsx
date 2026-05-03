import React, { useState } from "react";
import { format, isPast } from "date-fns";
import { Edit, Trash2, CheckCircle2, Image as ImageIcon } from "lucide-react";
import TaskUpdateModal from "./TaskUpdateModal";
import ProofGalleryModal from "./ProofGalleryModal";

interface TaskTableProps {
  tasks: any[];
  role: "Admin" | "Member";
  onStatusChange?: (taskId: string, newStatus: string) => void; // Deprecated, keeping for backward compatibility
  onUpdateTask?: (taskId: string, formData: FormData) => Promise<void>;
  onEdit?: (task: any) => void;
  onDelete?: (taskId: string) => void;
}

export default function TaskTable({ tasks, role, onUpdateTask, onEdit, onDelete }: TaskTableProps) {
  const [selectedUpdateTask, setSelectedUpdateTask] = useState<any>(null);
  const [selectedProofImages, setSelectedProofImages] = useState<string[] | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const isOverdue = (deadline: string, status: string) => {
    if (!deadline || status === "Completed") return false;
    return isPast(new Date(deadline));
  };

  const filteredTasks = tasks.filter(task => {
    const overdue = isOverdue(task.deadline, task.status);

    if (statusFilter === "All") return true;
    if (statusFilter === "Pending") return task.status === "Pending";
    if (statusFilter === "In Progress") return task.status === "In Progress";
    if (statusFilter === "Completed") return task.status === "Completed";
    if (statusFilter === "Overdue") return overdue;
    return true;
  });

  const getStatusBadge = (status: string, overdue: boolean) => {
    if (overdue) return <span className="badge bg-danger text-white px-3 py-2 rounded-pill shadow-sm">Overdue</span>;
    if (status === "Pending") return <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">Pending</span>;
    if (status === "In Progress") return <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill">In Progress</span>;
    return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">Completed</span>;
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
        <h5 className="m-0 fw-semibold text-dark">Recent Tasks</h5>
        <div className="d-flex align-items-center gap-2">
          <label className="text-muted small fw-medium d-none d-sm-inline">Filter by Status:</label>
          <select
            className="form-select form-select-sm shadow-none border-secondary-subtle"
            style={{ width: "150px", borderRadius: "8px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>TASK</th>
              <th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>PROJECT</th>
              <th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>ASSIGNED TO</th>
              <th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>STATUS</th>
              <th className="px-4 py-3 fw-semibold text-muted" style={{ fontSize: "0.85rem" }}>DEADLINE</th>
              <th className="px-4 py-3 fw-semibold text-muted text-end" style={{ fontSize: "0.85rem" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const overdue = isOverdue(task.deadline, task.status);
                return (
                  <tr key={task._id} className={overdue ? "table-danger" : ""}>
                    <td className="px-4 py-3 fw-medium">
                      {task.title}
                      {task.proofImages && task.proofImages.length > 0 && (
                        <button
                          className="btn btn-sm btn-link text-primary p-0 ms-2 d-inline-flex align-items-center gap-1 text-decoration-none"
                          style={{ fontSize: "0.8rem" }}
                          onClick={() => setSelectedProofImages(task.proofImages)}
                        >
                          <ImageIcon size={14} /> View Proof
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-secondary">{task.projectId?.title || "N/A"}</td>
                    <td className="px-4 py-3 text-secondary">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle overflow-hidden border bg-light d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                          style={{ width: "32px", height: "32px", fontSize: "0.75rem" }}
                        >
                          {task.assignedTo?.profileImage ? (
                            <img src={task.assignedTo.profileImage} alt={task.assignedTo.name} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <span className="fw-bold text-primary">{task.assignedTo?.name ? task.assignedTo.name.charAt(0).toUpperCase() : "?"}</span>
                          )}
                        </div>
                        <span className="text-truncate" style={{ maxWidth: '120px' }}>{task.assignedTo?.name || "Unassigned"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(task.status, overdue)}
                    </td>
                    <td className="px-4 py-3 text-secondary">
                      {task.deadline ? format(new Date(task.deadline), "MMM dd, yyyy") : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-end">
                      {role === "Admin" ? (
                        <div className="d-flex gap-2 justify-content-end">
                          <button
                            className="btn btn-sm btn-light text-primary hover-bg-primary-subtle"
                            onClick={() => onEdit && onEdit(task)}
                            disabled={task.status === "Completed"}
                            title={task.status === "Completed" ? "Completed tasks cannot be edited" : "Edit Task"}
                            style={{ opacity: task.status === "Completed" ? 0.5 : 1 }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-light text-danger hover-bg-danger-subtle"
                            onClick={() => onDelete && onDelete(task._id)}
                            disabled={task.status === "Completed"}
                            title={task.status === "Completed" ? "Completed tasks cannot be deleted" : "Delete Task"}
                            style={{ opacity: task.status === "Completed" ? 0.5 : 1 }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-primary w-100"
                          onClick={() => setSelectedUpdateTask(task)}
                          disabled={task.status === "Completed"}
                        >
                          {task.status === "Completed" ? "Task Completed" : "Update Status"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  <div className="d-flex flex-column align-items-center">
                    <CheckCircle2 size={40} className="text-light mb-3" />
                    <p className="m-0 fw-medium">No tasks found</p>
                    <small>You're all caught up!</small>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUpdateTask && onUpdateTask && (
        <TaskUpdateModal
          task={selectedUpdateTask}
          onClose={() => setSelectedUpdateTask(null)}
          onSubmit={onUpdateTask}
        />
      )}

      {selectedProofImages && (
        <ProofGalleryModal
          images={selectedProofImages}
          onClose={() => setSelectedProofImages(null)}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-bg-primary-subtle:hover { background-color: #cfe2ff !important; }
        .hover-bg-danger-subtle:hover { background-color: #f8d7da !important; }
      `}} />
    </div>
  );
}

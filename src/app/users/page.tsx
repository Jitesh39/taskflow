"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../utils/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Users as UsersIcon, Plus, Trash2, Shield, User as UserIcon, MoreVertical, Edit2, UserX, UserCheck } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [roleModalUser, setRoleModalUser] = useState<any | null>(null);
  const [actionUser, setActionUser] = useState<any | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "Member" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("id");
    if (userRole !== "Admin") {
      router.push("/member-dashboard");
      return;
    }
    setRole(userRole);
    setCurrentUserId(userId);
    fetchUsers();
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/users", newUser);
      toast.success("User created successfully");
      setShowForm(false);
      setNewUser({ name: "", email: "", password: "", role: "Member" });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (user: any) => {
    if (user._id === currentUserId) {
      toast.warning("You cannot suspend your own account!");
      return;
    }

    const confirmMsg = user.isActive
      ? `Are you sure you want to suspend ${user.name}? They will lose all access immediately.`
      : `Re-activate ${user.name}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const newStatus = !user.isActive;
      await api.put(`/users/${user._id}/status`, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'suspended'}`);
      setActionUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const handleRoleUpdate = async (newRole: string) => {
    if (!roleModalUser) return;
    try {
      await api.put(`/users/${roleModalUser._id}/role`, { role: newRole });
      toast.success("Role updated successfully");
      setRoleModalUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUserId) {
      toast.warning("You cannot delete your own account!");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this user? This action is irreversible.")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User permanently deleted");
      setActionUser(null);
      fetchUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  if (role !== "Admin") return null;

  return (
    <DashboardLayout role="Admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <UsersIcon className="text-primary" size={28} /> Users Management
          </h3>
          <p className="text-muted m-0 mt-1">Add, remove, and manage platform users.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New User
          </button>
        )}
      </div>

      {showForm && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="mb-3 fw-semibold">Add New User</h5>
            <form onSubmit={handleCreateUser}>
              <div className="row g-3">
                <div className="col-md-3">
                  <input type="text" className="form-control" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="email" className="form-control" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="password" className="form-control" placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="Member">Member</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div className="col-12 mt-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Add User"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="px-4 py-3 fw-semibold text-muted text-sm">USER</th>
                <th className="px-4 py-3 fw-semibold text-muted text-sm">EMAIL</th>
                <th className="px-4 py-3 fw-semibold text-muted text-sm">ROLE</th>
                <th className="px-4 py-3 fw-semibold text-muted text-sm">STATUS</th>
                <th className="px-4 py-3 fw-semibold text-muted text-sm text-end">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className={!user.isActive ? "bg-light-danger opacity-75" : ""}>
                  <td className="px-4 py-3 fw-medium text-dark d-flex align-items-center gap-3">
                    <div className="rounded-circle overflow-hidden border bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: '38px', height: '38px' }}>
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-100 h-100 object-fit-cover" />
                      ) : (
                        <span className="text-primary fw-bold" style={{ fontSize: '0.9rem' }}>{user.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="px-4 py-3 text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.role === 'Admin' ? 'bg-danger-subtle text-danger border border-danger-subtle' : 'bg-info-subtle text-info border border-info-subtle'} px-3 py-2 rounded-pill d-inline-flex align-items-center gap-1`}>
                      {user.role === 'Admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${user.isActive ? 'bg-success text-white' : 'bg-danger text-white'} px-2 py-1 rounded`} style={{ fontSize: '0.7rem' }}>
                      {user.isActive ? "ACTIVE" : "SUSPENDED"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button
                      className="btn btn-sm btn-light p-1 rounded-circle shadow-sm border"
                      style={{ width: '32px', height: '32px' }}
                      onClick={() => setActionUser(user)}
                    >
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Selection Modal */}
      {actionUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1200 }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow-lg animate-zoom-in">
              <div className="modal-header border-bottom py-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle overflow-hidden border" style={{ width: '40px', height: '40px' }}>
                    {actionUser.profileImage ? (
                      <img src={actionUser.profileImage} alt={actionUser.name} className="w-100 h-100 object-fit-cover" />
                    ) : (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center bg-light text-primary fw-bold">
                        {actionUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold m-0">User Actions</h6>
                    <small className="text-muted">{actionUser.name}</small>
                  </div>
                </div>
                <button type="button" className="btn-close shadow-none" onClick={() => setActionUser(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-grid gap-3">
                  <button
                    className="btn btn-light border py-2 d-flex align-items-center justify-content-center gap-2 fw-medium"
                    onClick={() => { setRoleModalUser(actionUser); setActionUser(null); }}
                  >
                    <Edit2 size={18} className="text-primary" /> Change User Role
                  </button>

                  <button
                    className={`btn ${actionUser.isActive ? 'btn-outline-danger' : 'btn-outline-success'} py-2 d-flex align-items-center justify-content-center gap-2 fw-medium`}
                    onClick={() => handleStatusUpdate(actionUser)}
                    disabled={actionUser._id === currentUserId}
                  >
                    {actionUser.isActive ? (
                      <><UserX size={18} /> Suspend Access</>
                    ) : (
                      <><UserCheck size={18} /> Activate Access</>
                    )}
                  </button>

                  <button
                    className="btn btn-outline-dark py-2 d-flex align-items-center justify-content-center gap-2 fw-medium"
                    onClick={() => handleDeleteUser(actionUser._id)}
                    disabled={actionUser._id === currentUserId}
                  >
                    <Trash2 size={18} /> Permanently Delete
                  </button>
                </div>
              </div>
              <div className="modal-footer bg-light border-top-0 py-2">
                <button type="button" className="btn btn-secondary w-100 py-2 fw-medium" onClick={() => setActionUser(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Update Modal */}
      {roleModalUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1300 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg animate-zoom-in">
              <div className="modal-header border-bottom-0 pb-0">
                <h6 className="modal-title fw-bold">Update Role</h6>
                <button type="button" className="btn-close shadow-none" onClick={() => setRoleModalUser(null)}></button>
              </div>
              <div className="modal-body p-4 pt-2">
                <p className="text-muted small mb-3">Set account permissions for <strong>{roleModalUser.name}</strong>.</p>
                <div className="d-grid gap-2">
                  <button
                    className={`btn ${roleModalUser.role === 'Member' ? 'btn-info text-white' : 'btn-outline-info'} py-2 fw-medium`}
                    onClick={() => handleRoleUpdate("Member")}
                  >
                    Set as Member
                  </button>
                  <button
                    className={`btn ${roleModalUser.role === 'Admin' ? 'btn-danger text-white' : 'btn-outline-danger'} py-2 fw-medium`}
                    onClick={() => handleRoleUpdate("Admin")}
                  >
                    Set as Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .text-sm { font-size: 0.85rem; }
        .bg-light-danger { background-color: #fff5f5; }
        .animate-zoom-in { animation: zoomIn 0.2s ease-out; }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </DashboardLayout>
  );
}

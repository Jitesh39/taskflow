"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "../utils/api";
import DashboardLayout from "@/components/DashboardLayout";
import { Briefcase, Plus, Users as UsersIcon } from "lucide-react";
import Select from "react-select";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<any[] | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", members: [] as string[] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "Admin") {
      router.push("/member-dashboard");
      return;
    }
    setRole(userRole);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users")
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) {
      toast.error("Project title is required.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/projects", newProject);
      toast.success("Project created successfully");
      setShowForm(false);
      setNewProject({ title: "", description: "", members: [] });
      fetchData();
    } catch (err) {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (role !== "Admin") return null;

  return (
    <DashboardLayout role="Admin">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <Briefcase className="text-primary" size={28} /> Projects
          </h3>
          <p className="text-muted m-0 mt-1">Manage workspaces and assign teams.</p>
        </div>
        {!showForm && (
          <button className="btn btn-primary d-flex align-items-center gap-2 shadow-sm" onClick={() => setShowForm(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="card shadow-sm border-0 mb-4 bg-light">
          <div className="card-body p-4">
            <h5 className="mb-3 fw-semibold">Create New Project</h5>
            <form onSubmit={handleCreateProject}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label text-sm fw-medium text-muted">Title *</label>
                  <input type="text" className="form-control" placeholder="Project Name" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-sm fw-medium text-muted">Members</label>
                  <Select
                    isMulti
                    options={users.map(u => ({ value: u._id, label: `${u.name} (${u.email})` }))}
                    value={users.filter(u => newProject.members.includes(u._id)).map(u => ({ value: u._id, label: `${u.name} (${u.email})` }))}
                    onChange={(selectedOptions: any) => {
                      const selected = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
                      setNewProject({ ...newProject, members: selected });
                    }}
                    placeholder="Search and select members..."
                    className="react-select-container"
                    classNamePrefix="react-select"
                    styles={{
                      control: (baseStyles) => ({
                        ...baseStyles,
                        borderColor: '#dee2e6',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#86b7fe'
                        }
                      })
                    }}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label text-sm fw-medium text-muted">Description</label>
                  <textarea className="form-control" rows={3} placeholder="Project details..." value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                </div>

                <div className="col-12 mt-3 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Create Project"}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row g-4">
        {projects.map((proj) => (
          <div className="col-md-6 col-xl-4" key={proj._id}>
            <div className="card shadow-sm border-0 h-100 project-card">
              <div className="card-body p-4">
                <h5 className="fw-semibold text-dark mb-2">{proj.title}</h5>
                <p className="text-secondary small mb-3">{proj.description || "No description provided."}</p>
                <div 
                  className="d-flex align-items-center gap-2 text-primary small mt-auto fw-medium" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMembers(proj.members)}
                >
                  <UsersIcon size={16} />
                  <span>{proj.members?.length || 0} Members assigned</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && !showForm && (
          <div className="col-12 text-center py-5 text-muted">
            <Briefcase size={40} className="mb-3 text-light" />
            <p>No projects created yet.</p>
          </div>
        )}
      </div>

      {/* Member List Modal */}
      {selectedMembers && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Project Members</h5>
                <button type="button" className="btn-close shadow-none" onClick={() => setSelectedMembers(null)}></button>
              </div>
              <div className="modal-body">
                <div className="list-group list-group-flush">
                  {selectedMembers.length > 0 ? (
                    selectedMembers.map((m: any) => (
                      <div key={m._id} className="list-group-item px-0 py-3 d-flex align-items-center gap-3">
                        <div className="rounded-circle overflow-hidden bg-light d-flex align-items-center justify-content-center fw-bold border shadow-sm" style={{ width: '45px', height: '45px' }}>
                          {m.profileImage ? (
                            <img src={m.profileImage} alt={m.name} className="w-100 h-100 object-fit-cover" />
                          ) : (
                            <span className="text-primary">{m.name.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div>
                          <p className="m-0 fw-semibold text-dark">{m.name}</p>
                          <p className="m-0 text-muted small">{m.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-center py-3">No members assigned to this project.</p>
                  )}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light w-100" onClick={() => setSelectedMembers(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .text-sm { font-size: 0.85rem; }
        .project-card { transition: transform 0.2s; border-top: 4px solid var(--primary) !important; }
        .project-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
      `}} />
    </DashboardLayout>
  );
}

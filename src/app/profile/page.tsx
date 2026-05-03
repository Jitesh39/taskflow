"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { UploadCloud, User as UserIcon } from "lucide-react";
import api from "../utils/api";
import DashboardLayout from "@/components/DashboardLayout";

export default function ProfilePage() {
  const [role, setRole] = useState<"Admin" | "Member">("Member");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("role") as "Admin" | "Member";
    if (!userRole) {
      router.push("/login");
      return;
    }
    setRole(userRole);
    setName(localStorage.getItem("name") || "");
    setEmail(localStorage.getItem("email") || "");
    setProfileImage(localStorage.getItem("profileImage") || null);
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setProfileImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (file) {
        formData.append("profileImage", file);
      }

      const res = await api.put("/users/profile", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const updatedUser = res.data;
      localStorage.setItem("name", updatedUser.name);
      if (updatedUser.profileImage) {
        localStorage.setItem("profileImage", updatedUser.profileImage);
      }

      toast.success("Profile updated successfully!");
      // Force reload to update layout avatar across the app
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role={role}>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <UserIcon className="text-primary" size={28} /> My Profile
          </h3>
          <p className="text-muted m-0 mt-1">Manage your personal information and avatar.</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 bg-white" style={{ maxWidth: "800px" }}>
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSave}>
            <div className="d-flex flex-column align-items-center mb-2">
              <div
                className="position-relative rounded-circle overflow-hidden shadow-sm border mb-3"
                style={{ width: "120px", height: "120px", backgroundColor: "#f1f5f9" }}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                    <UserIcon size={48} className="text-secondary" />
                  </div>
                )}
              </div>
              <div className="position-relative">
                <input
                  type="file"
                  accept="image/*"
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                  style={{ cursor: "pointer" }}
                  onChange={handleImageChange}
                />
                <button type="button" className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2">
                  <UploadCloud size={16} /> Change Avatar
                </button>
              </div>
            </div>

            <div className="mb-2">
              <label className="form-label text-muted fw-medium text-sm">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-muted fw-medium text-sm">Email Address</label>
              <input
                type="email"
                className="form-control bg-light"
                value={email}
                readOnly
              />
              <small className="text-muted mt-1 d-block">Your email cannot be changed.</small>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light" onClick={() => router.back()}>Cancel</button>
              <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .text-sm { font-size: 0.85rem; }
      `}} />
    </DashboardLayout>
  );
}

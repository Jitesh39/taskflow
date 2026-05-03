"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Bell, Check, Trash2, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "../utils/api";
import DashboardLayout from "@/components/DashboardLayout";
import { socket } from "../utils/socket";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [role, setRole] = useState<"Admin" | "Member" | "">("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userRole = localStorage.getItem("role") as "Admin" | "Member";
    const userId = localStorage.getItem("id");
    if (!userRole) {
      router.push("/login");
      return;
    }
    setRole(userRole);
    fetchNotifications();

    if (userId) {
      socket.connect();
      socket.emit("join", userId);
      socket.on("newNotification", fetchNotifications);
    }

    return () => {
      socket.off("newNotification");
    };
  }, [router]);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      toast.error("Failed to update notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error("Failed to update notifications");
    }
  };

  if (!role) return null;

  return (
    <DashboardLayout role={role}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0 text-dark d-flex align-items-center gap-2">
            <Bell className="text-primary" size={28} /> Notifications
          </h3>
          <p className="text-muted m-0 mt-1">Stay updated with task assignments and status changes.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            className="btn btn-outline-primary d-flex align-items-center gap-2 fw-medium shadow-sm"
            onClick={markAllAsRead}
          >
            <Check size={18} /> Mark all as read
          </button>
        )}
      </div>

      <div className="card shadow-sm border-0 bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="list-group list-group-flush">
            {notifications.map((n) => (
              <div 
                key={n._id} 
                className={`list-group-item list-group-item-action p-4 border-start border-4 ${!n.isRead ? 'border-primary bg-light' : 'border-transparent'}`}
                style={{ transition: 'all 0.2s' }}
              >
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <div className="d-flex gap-3">
                    <div className={`rounded-circle p-2 d-flex align-items-center justify-content-center shadow-sm ${n.type === 'TASK_ASSIGNED' ? 'bg-info text-white' : 'bg-success text-white'}`} style={{ width: '40px', height: '40px' }}>
                      <Bell size={20} />
                    </div>
                    <div>
                      <h6 className={`mb-1 ${!n.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>{n.message}</h6>
                      <div className="d-flex align-items-center gap-2 text-muted">
                        <Clock size={14} />
                        <small>{formatDistanceToNow(new Date(n.createdAt))} ago</small>
                        <span className="mx-1">•</span>
                        <small className="text-uppercase fw-bold" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                          {n.type.replace('_', ' ')}
                        </small>
                      </div>
                    </div>
                  </div>
                  {!n.isRead && (
                    <button 
                      className="btn btn-sm btn-link text-primary text-decoration-none fw-bold"
                      onClick={() => markAsRead(n._id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-center">
            <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
              <Bell size={48} className="text-muted opacity-50" />
            </div>
            <h5 className="text-dark fw-bold">No notifications yet</h5>
            <p className="text-muted mb-0">We'll notify you when tasks are assigned or updated.</p>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .border-transparent { border-left-color: transparent !important; }
        .list-group-item:hover { transform: translateX(5px); }
      `}} />
    </DashboardLayout>
  );
}

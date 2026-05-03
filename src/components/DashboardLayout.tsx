"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, CheckSquare, Briefcase, Users, LogOut, Menu, X, User, ClipboardList, Bell } from "lucide-react";
import { socket } from "../app/utils/socket";
import api from "../app/utils/api";
import { formatDistanceToNow } from "date-fns";

export default function DashboardLayout({ children, role }: { children: React.ReactNode, role: "Admin" | "Member" }) {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    setName(localStorage.getItem("name") || role);
    setProfileImage(localStorage.getItem("profileImage") || "");
    const userId = localStorage.getItem("id");

    fetchNotifications();

    if (userId) {
      socket.connect();
      socket.emit("join", userId);
      
      socket.on("newNotification", () => {
        fetchNotifications();
        // Optional: show a small toast or sound
      });
    }

    const handleClickOutside = (event: MouseEvent) => {
      const profileDropdown = document.querySelector(".profile-dropdown-container");
      const notifDropdown = document.querySelector(".notif-dropdown-container");
      
      if (profileDropdown && !profileDropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifDropdown && !notifDropdown.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      socket.off("newNotification");
      socket.disconnect();
    };
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: `/${role.toLowerCase()}-dashboard` },
    { name: role === "Admin" ? "Assign Tasks" : "Tasks", icon: <CheckSquare size={20} />, path: `/tasks` },
  ];

  if (role === "Admin") {
    navItems.push(
      { name: "Projects", icon: <Briefcase size={20} />, path: "/projects" },
      { name: "Users", icon: <Users size={20} />, path: "/users" }
    );
  }

  navItems.push({ name: "Notifications", icon: <Bell size={20} />, path: "/notifications" });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="main-container" style={{ backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark d-md-none"
          style={{ opacity: 0.5, zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar bg-white border-end d-flex flex-column ${sidebarOpen ? "show-sidebar" : ""}`}>
        <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
          <h4 className="m-0 fw-bold text-primary">TaskFlow</h4>
          <button className="btn btn-sm d-md-none" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <div className="p-3 flex-grow-1 overflow-auto">
          <ul className="nav flex-column gap-2">
            {navItems.map((item) => (
              <li className="nav-item" key={item.name}>
                <Link
                  href={item.path}
                  className={`nav-link d-flex align-items-center gap-3 rounded px-3 py-2 ${pathname === item.path ? "bg-primary text-white" : "text-dark hover-bg-light"}`}
                >
                  {item.icon}
                  <span className="fw-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-3 border-top mt-auto">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div
              className="rounded-circle overflow-hidden border shadow-sm flex-shrink-0"
              style={{ width: "40px", height: "40px", backgroundColor: "#e2e8f0" }}
            >
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
              ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary fw-bold">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="m-0 fw-bold text-dark text-truncate small">{name}</p>
              <p className="m-0 text-muted text-truncate" style={{ fontSize: "0.75rem" }}>{role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-light w-100 d-flex align-items-center justify-content-center gap-2 text-danger fw-medium py-2 rounded-pill border">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="content d-flex flex-column">
        {/* Navbar */}
        <header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center sticky-top" style={{ zIndex: 1030 }}>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2 d-md-none">
              <button className="btn btn-light p-2" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <h5 className="m-0 fw-bold text-primary">TaskFlow</h5>
            </div>
            <h5 className="m-0 fw-semibold d-none d-md-block">Welcome, {name}</h5>
          </div>
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="position-relative notif-dropdown-container">
              <button 
                className="btn btn-light border-0 p-2 rounded-circle shadow-none position-relative" 
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={22} className="text-muted" />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 show animate-fade-in p-0 overflow-hidden notif-dropdown">
                  <div className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                    <h6 className="m-0 fw-bold text-dark">Notifications</h6>
                    {unreadCount > 0 && <span className="badge bg-primary-subtle text-primary small rounded-pill">{unreadCount} New</span>}
                  </div>
                  <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                    {notifications.length > 0 ? (
                      notifications.slice(0, 10).map((n) => (
                        <div 
                          key={n._id} 
                          className={`p-3 border-bottom notification-item d-flex gap-3 align-items-start ${!n.isRead ? 'bg-light' : ''}`} 
                          style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                          onClick={() => {
                            markAsRead(n._id);
                            router.push('/tasks');
                            setNotifOpen(false);
                          }}
                        >
                          <div className={`mt-1 rounded-circle p-1 ${n.type === 'TASK_ASSIGNED' ? 'bg-info-subtle text-info' : 'bg-success-subtle text-success'}`}>
                            <Bell size={14} />
                          </div>
                          <div className="flex-grow-1">
                            <p className={`m-0 small ${!n.isRead ? 'fw-bold text-dark' : 'text-secondary'}`}>{n.message}</p>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{formatDistanceToNow(new Date(n.createdAt))} ago</small>
                          </div>
                          {!n.isRead && <div className="rounded-circle bg-primary mt-2" style={{ width: '8px', height: '8px' }}></div>}
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <Bell size={32} className="text-light mb-2" />
                        <p className="text-muted small m-0">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  <Link 
                    href="/notifications" 
                    className="dropdown-item py-2 text-center text-primary fw-bold small border-top bg-light"
                    onClick={() => setNotifOpen(false)}
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="position-relative profile-dropdown-container">
            <div className="position-relative">
              <div
                className="rounded-circle overflow-hidden border shadow-sm"
                style={{ width: "40px", height: "40px", cursor: "pointer", backgroundColor: "#e2e8f0" }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <div className="w-100 h-100 d-flex align-items-center justify-content-center text-secondary fw-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {dropdownOpen && (
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2 show animate-fade-in profile-dropdown">
                  <li className="px-3 py-2 border-bottom mb-1 bg-light">
                    <p className="m-0 fw-bold text-dark small text-truncate">{name}</p>
                    <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill" style={{ fontSize: '0.65rem' }}>
                    </span>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" href="/profile" onClick={() => setDropdownOpen(false)}>
                      <User size={16} className="text-muted" />
                      <span>{role === "Admin" ? "My Profile" : "View Profile"}</span>
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center gap-2" href="/tasks" onClick={() => setDropdownOpen(false)}>
                      <ClipboardList size={16} className="text-muted" />
                      <span>{role === "Admin" ? "Assign Tasks" : "My Tasks"}</span>
                    </Link>
                  </li>
                  <li className="border-top mt-1 pt-1">
                    <button className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

        {/* Page Content */}
        <main className="p-4 flex-grow-1 overflow-auto">
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        body {
          margin: 0;
          padding: 0;
        }
        .main-container {
          display: flex;
          width: 100%;
          overflow-x: hidden;
        }
        .sidebar {
          width: 240px;
          min-width: 240px;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 1050;
          transition: transform 0.3s ease;
        }
        .content {
          margin-left: 240px;
          width: calc(100% - 240px);
          min-height: 100vh;
        }
        .hover-bg-light:hover {
          background-color: #f1f5f9;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out;
        }

        .notif-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 320px;
          display: block;
          z-index: 1100;
        }

        .profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          minWidth: 200px;
          display: block;
          padding: 0.5rem 0;
          z-index: 1100;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Mobile styles */
        @media (max-width: 767.98px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.show-sidebar {
            transform: translateX(0);
          }
          .content {
            margin-left: 0;
            width: 100%;
          }
          
          .notif-dropdown {
            position: fixed;
            top: 70px;
            left: 15px;
            right: 15px;
            width: auto;
          }

          .profile-dropdown {
            position: fixed;
            top: 70px;
            left: 15px;
            right: 15px;
            width: auto;
          }
        }
      `}} />
    </div>
  );
}

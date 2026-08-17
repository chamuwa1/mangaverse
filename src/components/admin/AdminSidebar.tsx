"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Users, FileText, Settings, Shield, ArrowLeft } from "lucide-react";
import Image from "next/image";

interface AdminSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Overview", path: "/admin/overview", icon: LayoutDashboard },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Users", path: "/admin/users", icon: Users },
    { name: "Content", path: "/admin/content", icon: FileText },
    { name: "Settings", path: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="admin-sidebar-container">
      <style jsx global>{`
        .admin-layout-wrapper {
          display: flex;
          min-height: 100vh;
          background-color: var(--bg-primary);
        }
        .admin-sidebar-container {
          width: 260px;
          background: linear-gradient(180deg, var(--bg-secondary) 0%, #10121a 100%);
          border-right: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 110;
          transition: all 0.3s ease;
        }
        .admin-sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .admin-logo-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .admin-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          box-shadow: var(--shadow-glow-pink);
          overflow: hidden;
        }
        .admin-logo-text {
          font-family: 'Nunito', sans-serif;
          font-weight: 900;
          font-size: 18px;
          background: var(--gradient-main);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .admin-back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          transition: color 0.2s;
        }
        .admin-back-btn:hover {
          color: var(--accent-pink-light);
        }
        .admin-sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .admin-nav-item:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
          transform: translateX(4px);
        }
        .admin-nav-item.active {
          background: rgba(233, 30, 140, 0.08);
          color: var(--accent-pink-light);
          border: 1px solid rgba(233, 30, 140, 0.2);
          box-shadow: 0 4px 12px rgba(233, 30, 140, 0.05);
        }
        .admin-sidebar-footer {
          padding: 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(0, 0, 0, 0.15);
        }
        .admin-user-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid var(--border-default);
          overflow: hidden;
          background: var(--gradient-main);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .admin-user-info {
          min-width: 0;
          flex: 1;
        }
        .admin-user-name {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .admin-user-role {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-pink-light);
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 1px;
        }
        .admin-main-container {
          flex: 1;
          margin-left: 260px;
          min-height: 100vh;
          padding: 40px;
          transition: all 0.3s ease;
        }

        /* Mobile adjustments */
        @media (max-width: 1024px) {
          .admin-sidebar-container {
            width: 80px;
          }
          .admin-sidebar-container .admin-logo-text,
          .admin-sidebar-container .admin-back-btn span,
          .admin-sidebar-container .admin-nav-item span,
          .admin-sidebar-container .admin-user-info {
            display: none !important;
          }
          .admin-sidebar-header {
            align-items: center;
            padding: 20px 10px;
          }
          .admin-sidebar-nav {
            padding: 20px 8px;
            align-items: center;
          }
          .admin-nav-item {
            justify-content: center;
            width: 48px;
            height: 48px;
            padding: 0;
            border-radius: 50%;
          }
          .admin-nav-item:hover {
            transform: scale(1.08);
          }
          .admin-sidebar-footer {
            justify-content: center;
            padding: 16px 8px;
          }
          .admin-main-container {
            margin-left: 80px;
            padding: 30px 20px;
          }
        }

        @media (max-width: 640px) {
          .admin-layout-wrapper {
            flex-direction: column;
          }
          .admin-sidebar-container {
            position: relative;
            width: 100%;
            height: auto;
            bottom: auto;
            border-right: none;
            border-bottom: 1px solid var(--border-subtle);
          }
          .admin-sidebar-header {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
          }
          .admin-sidebar-container .admin-logo-text {
            display: block !important;
          }
          .admin-sidebar-nav {
            flex-direction: row;
            padding: 10px 20px;
            overflow-x: auto;
            gap: 12px;
            scrollbar-width: none;
          }
          .admin-sidebar-nav::-webkit-scrollbar {
            display: none;
          }
          .admin-nav-item {
            width: auto;
            height: auto;
            padding: 8px 14px;
            border-radius: var(--radius-full);
            white-space: nowrap;
          }
          .admin-sidebar-container .admin-nav-item span {
            display: block !important;
          }
          .admin-sidebar-footer {
            display: none !important;
          }
          .admin-main-container {
            margin-left: 0;
            padding: 24px 16px;
          }
        }
      `}</style>

      {/* Header */}
      <div className="admin-sidebar-header">

        <Link href="/" className="admin-back-btn">
          <ArrowLeft size={14} />
          <span>Exit Dashboard</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-avatar">
          {user.image ? (
            <Image src={user.image} width={38} height={38} alt="Avatar" />
          ) : (
            <Shield size={16} color="white" />
          )}
        </div>
        <div className="admin-user-info">
          <div className="admin-user-name">{user.name || "Administrator"}</div>
          <div className="admin-user-role">
            <Shield size={11} fill="currentColor" /> Admin Mode
          </div>
        </div>
      </div>
    </aside>
  );
}

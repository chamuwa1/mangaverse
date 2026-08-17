"use client";

import { useEffect, useState } from "react";
import { Users, Search, Download, ArrowUpDown, Shield } from "lucide-react";
import toast from "react-hot-toast";

interface UserItem {
  userId: string;
  fullId: string;
  bookmarks: number;
  reads: number;
  ratings: number;
  lastSeen: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof UserItem>("reads");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to load user list");
        const json = await res.json();
        setUsers(json.users || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load user list");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleSort = (field: keyof UserItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  // Sort and filter users
  const filteredUsers = users
    .filter(
      (u) =>
        u.fullId.toLowerCase().includes(search.toLowerCase()) ||
        u.userId.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

  // Client-side CSV exporter
  const exportCSV = () => {
    if (!users.length) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Truncated User ID", "Full User ID", "Bookmarks Count", "Reads Count", "Ratings Count", "Last Active"];
    const rows = users.map((u) => [
      u.userId,
      u.fullId,
      u.bookmarks,
      u.reads,
      u.ratings,
      u.lastSeen ? new Date(u.lastSeen).toISOString() : "Never",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mangaverse_user_activity_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV file downloaded successfully!");
  };

  if (loading) {
    return (
      <div className="users-loading-wrapper">
        <style jsx>{`
          .users-loading-wrapper {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }
          .skeleton-toolbar {
            height: 48px;
            border-radius: var(--radius-md);
          }
          .skeleton-table {
            height: 450px;
            border-radius: var(--radius-lg);
          }
        `}</style>
        <div className="skeleton skeleton-toolbar" />
        <div className="skeleton skeleton-table" />
      </div>
    );
  }

  return (
    <div className="users-page-wrapper animate-fade-in">
      <style jsx>{`
        .users-page-wrapper {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .users-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .users-title h1 {
          font-size: 28px;
          margin-bottom: 4px;
        }
        .users-subtitle {
          color: var(--text-muted);
          font-size: 14px;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
          min-width: 250px;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 42px;
          background: var(--bg-card);
          border: 1px solid var(--border-default);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          outline: none;
          font-size: 14px;
          transition: all 0.2s;
        }
        .search-input:focus {
          border-color: var(--accent-pink);
          box-shadow: 0 0 12px rgba(233, 30, 140, 0.15);
        }
        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translate/Y(-50%);
          transform: translateY(-50%);
        }
        .table-card {
          overflow: hidden;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          font-size: 14px;
        }
        th {
          background: rgba(0, 0, 0, 0.2);
          padding: 16px 20px;
          color: var(--text-secondary);
          font-weight: 700;
          border-bottom: 1px solid var(--border-subtle);
          cursor: pointer;
          user-select: none;
          transition: background 0.15s;
        }
        th:hover {
          background: rgba(255, 255, 255, 0.03);
        }
        .th-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-subtle);
          color: var(--text-secondary);
        }
        tr:hover td {
          background: rgba(255, 255, 255, 0.015);
          color: var(--text-primary);
        }
        .user-id-badge {
          font-family: monospace;
          background: var(--bg-elevated);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle);
        }
        .empty-state {
          padding: 48px;
          text-align: center;
          color: var(--text-muted);
        }
      `}</style>

      {/* Header */}
      <div className="users-header">
        <div className="users-title">
          <h1>User Management</h1>
          <div className="users-subtitle">Anonymized log of all system users and reading activities.</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} className="search-icon" color="var(--text-muted)" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by User ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={exportCSV} className="btn-secondary">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Users Table */}
      <div className="card table-card">
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort("userId")}>
                  <div className="th-content">
                    User ID <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort("bookmarks")}>
                  <div className="th-content">
                    Bookmarks <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort("reads")}>
                  <div className="th-content">
                    Reads <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort("ratings")}>
                  <div className="th-content">
                    Ratings <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => handleSort("lastSeen")}>
                  <div className="th-content">
                    Last Seen <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.fullId}>
                    <td>
                      <span className="user-id-badge" title={user.fullId}>
                        {user.userId}
                      </span>
                    </td>
                    <td>{user.bookmarks}</td>
                    <td>{user.reads}</td>
                    <td>{user.ratings}</td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {user.lastSeen
                        ? new Date(user.lastSeen).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "Never"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No active users found matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

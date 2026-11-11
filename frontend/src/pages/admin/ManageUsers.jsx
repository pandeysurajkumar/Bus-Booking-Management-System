import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/admin.css";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: { search, role, page, limit: 10 },
      });

      const result = response.data?.data ?? response.data;
      setUsers(result.users ?? result.results ?? []);
      setPagination(result.pagination ?? result);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load users. The admin users API may not be implemented yet."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [search, role, page]);

  async function toggleUserStatus(user) {
    const isInactive = user.status === "suspended" || user.isActive === false;
    const action = isInactive ? "activate" : "deactivate";

    if (!window.confirm(`Are you sure you want to ${action} this account?`)) {
      return;
    }

    try {
      await api.patch(`/admin/users/${user._id}/status`, {
        status: isInactive ? "active" : "suspended",
      });
      await loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update account status.");
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">PEOPLE & ACCESS</span>
          <h1>User Management</h1>
          <p>Review passenger, operator, staff and administrator accounts.</p>
        </div>
      </header>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <input
            className="admin-input"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by name or email..."
          />
          <select
            className="admin-input admin-select"
            value={role}
            onChange={(event) => {
              setRole(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All roles</option>
            <option value="passenger">Passenger</option>
            <option value="operator">Operator</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No users found for these filters.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Account</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name || "Unnamed user"}</strong>
                      <small>{user.email}</small>
                    </td>
                    <td><span className="admin-role">{user.role}</span></td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN")
                        : "—"}
                    </td>
                    <td>
                      <span className={`admin-status ${user.status === "suspended" || user.isActive === false ? "status-cancelled" : "status-active"}`}>
                        {user.status === "suspended" || user.isActive === false ? "Suspended" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-button admin-button-secondary"
                        onClick={() => toggleUserStatus(user)}
                        disabled={user.role === "admin"}
                      >
                        {user.status === "suspended" || user.isActive === false ? "Activate" : "Deactivate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="admin-pagination">
          <button
            className="admin-button admin-button-secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="admin-button admin-button-secondary"
            disabled={
              pagination.totalPages
                ? page >= pagination.totalPages
                : users.length < 10
            }
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
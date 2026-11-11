import { useEffect, useState } from "react";
import api from "../../api/client";
import "../../styles/admin.css";

export default function ManageOperators() {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOperators() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/operators", {
        params: { page: 1, limit: 100 },
      });

      const result = response.data?.data ?? response.data;
      setOperators(
        Array.isArray(result)
          ? result
          : result.operators ?? result.results ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not load operators. Check the operators API."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOperators();
  }, []);

  async function updateStatus(operator) {
    const nextStatus = operator.status === "active" ? "suspended" : "active";

    if (!window.confirm(`Change operator status to ${nextStatus}?`)) return;

    try {
      await api.patch(`/operators/${operator._id}/status`, {
        status: nextStatus,
      });
      await loadOperators();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update operator.");
    }
  }

  return (
    <main className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-eyebrow">PARTNER NETWORK</span>
          <h1>Operator Management</h1>
          <p>Review transport partners and monitor their account status.</p>
        </div>
      </header>

      <section className="admin-panel">
        {error && <div className="admin-alert admin-alert-error">{error}</div>}

        {loading ? (
          <div className="admin-loading">Loading operators...</div>
        ) : operators.length === 0 ? (
          <div className="admin-empty">No operators found.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Contact</th>
                  <th>Fleet</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => (
                  <tr key={operator._id}>
                    <td>
                      <strong>{operator.companyName || operator.name || "—"}</strong>
                      <small>{operator._id}</small>
                    </td>
                    <td>
                      {operator.contactEmail || operator.email || "—"}
                      <small>{operator.contactPhone || operator.phone || "No phone provided"}</small>
                    </td>
                    <td>{operator.busCount ?? operator.totalBuses ?? "—"}</td>
                    <td>
                      <span className={`admin-status status-${operator.status || "unknown"}`}>
                        {operator.status || "Unknown"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="admin-button admin-button-secondary"
                        onClick={() => updateStatus(operator)}
                      >
                        {operator.status === "active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { getServerHealth } from "../../services/healthService";

const BackendStatus = () => {
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Checking backend connection...");

  useEffect(() => {
    let active = true;

    const checkBackend = async () => {
      try {
        const result = await getServerHealth();

        if (!active) return;

        if (result.success && result.data?.database === "connected") {
          setStatus("connected");
          setMessage("Backend and database connected");
        } else {
          setStatus("unhealthy");
          setMessage("Backend responded, but database is unavailable");
        }

      } catch (error) {
        if (!active) return;

        setStatus("disconnected");
        setMessage(
          error.response?.data?.message ||
          "Unable to connect to backend"
        );
      }
    };

    checkBackend();

    return () => {
      active = false;
    };
  }, []);

  const styles = {
    checking: "bg-amber-100 text-amber-800",
    connected: "bg-green-100 text-green-800",
    disconnected: "bg-red-100 text-red-800",
    unhealthy: "bg-orange-100 text-orange-800"
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${styles[status]}`}>
      <span className="w-2 h-2 rounded-full bg-current" />
      {message}
    </div>
  );
};

export default BackendStatus;

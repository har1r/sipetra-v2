import { useState, useEffect } from "react";

export const useSystemStatus = () => {
  const [status, setStatus] = useState({
    version: "v0.0.0",
    server: "Checking",
    database: "Checking",
    api: "Checking",
    uptime: 0,
    timestamp: null,
    loading: true,
  });

  const fetchStatus = async () => {
    try {
      const response = await fetch("http://localhost:5000/api");
      const data = await response.json();

      setStatus({
        version: data.version,
        server: data.server,
        database: data.database,
        api: data.api,
        uptime: data.uptime,
        timestamp: data.timestamp,
        loading: false,
      });
    } catch (error) {
      console.error("Health check failed:", error);
      setStatus((prev) => ({
        ...prev,
        server: "Offline",
        database: "Error",
        api: "Unhealthy",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    fetchStatus();
    const serverInterval = setInterval(fetchStatus, 30000);
    return () => clearInterval(serverInterval);
  }, []);

  useEffect(() => {
    let localCounter;

    if (status.server === "Online" && status.uptime > 0) {
      localCounter = setInterval(() => {
        setStatus((prevStatus) => ({
          ...prevStatus,
          uptime: prevStatus.uptime + 1,
        }));
      }, 1000);
    }

    return () => clearInterval(localCounter);
  }, [status.server, status.loading]);

  return status;
};

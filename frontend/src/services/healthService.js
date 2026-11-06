
import api from "./api";

export const getServerHealth = async () => {
  const response = await api.get("/health");

  return response.data;
};

import { Navigate } from "react-router-dom";

function readSavedUser() {
  try {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

export function AdminRoute({ children }) {
  if (!localStorage.getItem("token")) {
    return <Navigate replace to="/login" />;
  }

  if (readSavedUser()?.role !== "admin") {
    return <Navigate replace to="/" />;
  }

  return children;
}

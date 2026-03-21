import { Navigate } from "react-router-dom";

// Redirect root to the main dashboard
const Index = () => {
  return <Navigate to="/dashboard" replace />;
};

export default Index;

import { useLocation } from "wouter";
import OperatorDashboard from "@/components/OperatorDashboard";

export default function OperatorPage() {
  const [, setLocation] = useLocation();

  // todo: Get operator info from backend based on scanned QR code
  const operatorInfo = {
    name: "Jean Dupont",
    role: "Cooling Room Operator"
  };

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <OperatorDashboard
      operatorName={operatorInfo.name}
      operatorRole={operatorInfo.role}
      onLogout={handleLogout}
    />
  );
}

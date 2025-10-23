import OperatorDashboard from '../OperatorDashboard';

export default function OperatorDashboardExample() {
  return (
    <OperatorDashboard
      operatorName="Jean Dupont"
      operatorRole="Cooling Room Operator"
      onLogout={() => console.log('Logging out')}
    />
  );
}

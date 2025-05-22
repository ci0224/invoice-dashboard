import type { Route } from "./+types/home";
import { useUser } from "../contexts/UserContext";
import { DashboardHeader } from "../components/DashboardHeader";
import { InvoiceSection } from "../components/InvoiceSection";
import { DataSection } from "../components/DataSection";
import { UsageBar } from "../components/UsageBar";
import { TokenDebugPanel } from "../components/TokenDebugPanel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Invoice Dashboard" },
    { name: "description", content: "Your invoice dashboard" },
  ];
}

export default function Home() {
  const { logout } = useUser();

  const handleCreateInvoice = () => {
    // TODO: Implement invoice creation
    console.log('Create invoice clicked');
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Export data clicked');
  };

  const handleViewReports = () => {
    // TODO: Implement view reports
    console.log('View reports clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DashboardHeader onLogout={logout} />

        <UsageBar />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InvoiceSection onCreateInvoice={handleCreateInvoice} />
          <DataSection 
            onExportData={handleExportData}
            onViewReports={handleViewReports}
          />
        </div>

        <TokenDebugPanel />
      </div>
    </div>
  );
}

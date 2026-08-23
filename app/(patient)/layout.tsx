import AppHeader from "@/components/AppHeader";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader variant="patient" />
      {children}
    </div>
  );
}

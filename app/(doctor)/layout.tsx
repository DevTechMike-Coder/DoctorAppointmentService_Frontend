import AppHeader from "@/components/AppHeader";

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <AppHeader variant="doctor" />
      {children}
    </div>
  );
}

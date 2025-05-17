import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard - Invoice Dashboard" },
    { name: "description", content: "Your invoice dashboard" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {/* Add your dashboard content here */}
      </div>
    </div>
  );
}

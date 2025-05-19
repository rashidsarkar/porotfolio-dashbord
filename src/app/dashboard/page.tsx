import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Code2,
  FileText,
} from "lucide-react";

const stats = [
  {
    title: "Blogs",
    value: "12",
    icon: FileText,
    color: "text-blue-500",
  },
  {
    title: "Projects",
    value: "8",
    icon: Briefcase,
    color: "text-green-500",
  },
  {
    title: "Skills",
    value: "15",
    icon: Code2,
    color: "text-purple-500",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 
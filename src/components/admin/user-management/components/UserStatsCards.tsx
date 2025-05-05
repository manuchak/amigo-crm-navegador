
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Shield, UserCheck, UserX, UserCog } from 'lucide-react';

interface UserStats {
  total: number;
  verified: number;
  unverified: number;
  admins: number;
  users: number;
}

interface UserStatsCardsProps {
  stats: UserStats;
}

export const UserStatsCards: React.FC<UserStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <StatCard 
        icon={<Users className="h-5 w-5 text-blue-500" />}
        title="Total usuarios"
        value={stats.total}
        bgColor="bg-blue-50"
      />
      <StatCard 
        icon={<UserCheck className="h-5 w-5 text-green-500" />}
        title="Verificados"
        value={stats.verified}
        bgColor="bg-green-50"
      />
      <StatCard 
        icon={<UserX className="h-5 w-5 text-amber-500" />}
        title="Por verificar"
        value={stats.unverified}
        bgColor="bg-amber-50"
      />
      <StatCard 
        icon={<Shield className="h-5 w-5 text-red-500" />}
        title="Administradores"
        value={stats.admins}
        bgColor="bg-red-50"
      />
      <StatCard 
        icon={<UserCog className="h-5 w-5 text-purple-500" />}
        title="Usuarios"
        value={stats.users}
        bgColor="bg-purple-50"
      />
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, bgColor }) => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={`rounded-full p-2 ${bgColor}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

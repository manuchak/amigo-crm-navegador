
import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield,
  UserCog
} from 'lucide-react';
import { 
  Card,
  CardContent
} from '@/components/ui/card';

interface UserStatsProps {
  stats: {
    total: number;
    verified: number;
    unverified: number;
    admins: number;
    users: number;
  };
}

export const UserStatsCards: React.FC<UserStatsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Usuarios',
      value: stats.total,
      change: null,
      icon: <Users className="h-4 w-4 text-blue-600" />,
      color: 'bg-blue-50 text-blue-600 border-blue-100'
    },
    {
      title: 'Verificados',
      value: stats.verified,
      change: stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0,
      icon: <UserCheck className="h-4 w-4 text-green-600" />,
      color: 'bg-green-50 text-green-600 border-green-100'
    },
    {
      title: 'No Verificados',
      value: stats.unverified,
      change: stats.total > 0 ? Math.round((stats.unverified / stats.total) * 100) : 0,
      icon: <UserX className="h-4 w-4 text-amber-600" />,
      color: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      title: 'Admins',
      value: stats.admins,
      change: null,
      icon: <Shield className="h-4 w-4 text-red-600" />,
      color: 'bg-red-50 text-red-600 border-red-100'
    },
    {
      title: 'Usuarios Base',
      value: stats.users,
      change: null,
      icon: <UserCog className="h-4 w-4 text-purple-600" />,
      color: 'bg-purple-50 text-purple-600 border-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index} className={`border ${card.color}`}>
          <CardContent className="p-3 flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] font-medium">{card.title}</span>
              {card.icon}
            </div>

            <div className="text-xl font-bold">{card.value}</div>
            
            {card.change !== null && (
              <div className="text-[10px] mt-1">
                {card.change}% del total
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

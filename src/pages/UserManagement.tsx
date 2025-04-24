
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { UserData } from '@/types/auth';
import { UserManagementPanel } from '@/components/admin/UserManagementPanel';

const UserManagement = () => {
  const { userData: currentUserData, loading } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto py-20 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load user management data.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!currentUserData || (currentUserData.role !== 'admin' && currentUserData.role !== 'owner')) {
    return (
      <div className="container mx-auto py-20 px-4">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription className="text-red-500">
              No tienes permisos para gestionar usuarios.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <UserManagementPanel />
    </div>
  );
};

export default UserManagement;

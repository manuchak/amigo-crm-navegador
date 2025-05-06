
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import UserManagementPanel from '@/components/admin/UserManagementPanel';

const UserManagement: React.FC = () => {
  return (
    <PageLayout title="Gestión de Usuarios">
      <UserManagementPanel />
    </PageLayout>
  );
};

export default UserManagement;

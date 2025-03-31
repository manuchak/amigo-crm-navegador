
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface FormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const FormLayout = ({ title, description, children }: FormLayoutProps) => {
  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default FormLayout;

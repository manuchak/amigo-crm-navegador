
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Star
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CustodioData {
  id: string | number;
  name: string;
  activeMonths: number;
  completedJobs: number;
  averageRating: number;
  reliability: number;
  responseTime: number;
  earnings: number;
  ltv: number;
  status: 'active' | 'inactive' | 'pending';
}

interface CustodioTableProps {
  data?: CustodioData[];
  isLoading: boolean;
}

export function CustodioTable({ data, isLoading }: CustodioTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  
  const filteredData = data?.filter(custodio => 
    custodio.name.toLowerCase().includes(search.toLowerCase())
  );
  
  const paginatedData = filteredData?.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil((filteredData?.length || 0) / pageSize);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'inactive': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg font-medium">
            Desempeño de Custodios
          </CardTitle>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar custodio..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Custodio</TableHead>
                <TableHead className="hidden md:table-cell">Meses Activos</TableHead>
                <TableHead className="text-right">Servicios</TableHead>
                <TableHead className="text-center hidden md:table-cell">Calificación</TableHead>
                <TableHead className="text-right hidden lg:table-cell">Ganancias</TableHead>
                <TableHead className="text-right hidden lg:table-cell">LTV</TableHead>
                <TableHead className="text-center">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton rows when loading
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell>
                    <TableCell className="text-center hidden md:table-cell"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                    <TableCell className="text-right hidden lg:table-cell"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-right hidden lg:table-cell"><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                    <TableCell className="text-center"><Skeleton className="h-6 w-16 mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : paginatedData?.length ? (
                paginatedData.map((custodio) => (
                  <TableRow key={custodio.id}>
                    <TableCell className="font-medium">{custodio.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{custodio.activeMonths}</TableCell>
                    <TableCell className="text-right">{custodio.completedJobs}</TableCell>
                    <TableCell className="text-center hidden md:table-cell">
                      <div className="flex items-center justify-center">
                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                        <span>{formatRating(custodio.averageRating)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">{formatCurrency(custodio.earnings)}</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">{formatCurrency(custodio.ltv)}</TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline"
                        className={`${getStatusColor(custodio.status)}`}
                      >
                        {getStatusLabel(custodio.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron custodios
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {Boolean(filteredData?.length) && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Mostrando <strong>{(page - 1) * pageSize + 1}</strong> a{' '}
              <strong>{Math.min(page * pageSize, filteredData?.length || 0)}</strong> de{' '}
              <strong>{filteredData?.length}</strong> custodios
            </p>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import React, { useState } from 'react';
import { 
  Table, TableHeader, TableRow, TableHead, 
  TableBody, TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSupport, Ticket } from '@/context/SupportContext';
import { 
  Search, Filter, ArrowDownUp, MessageSquare,
  Clock, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import TicketDetailsDialog from './TicketDetailsDialog';
import { 
  Select, SelectContent, SelectGroup, 
  SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const TicketList = () => {
  const { tickets, isLoadingTickets, searchTickets } = useSupport();
  const { currentUser, userData } = useAuth();
  
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  const isAgent = userData && ['admin', 'owner', 'atención_afiliado'].includes(userData.role);
  
  // Apply filters and sorting
  React.useEffect(() => {
    let filtered = [...tickets];
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }
    
    // Apply sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'priority') {
        const priorityMap = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
        // @ts-ignore
        const priorityA = priorityMap[a.priority] || 999;
        // @ts-ignore
        const priorityB = priorityMap[b.priority] || 999;
        return sortDir === 'asc' ? priorityA - priorityB : priorityB - priorityA;
      }
      return 0;
    });
    
    setFilteredTickets(filtered);
  }, [tickets, statusFilter, priorityFilter, sortBy, sortDir]);
  
  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to filtered view of all tickets
      setFilteredTickets(tickets);
      return;
    }
    
    const results = await searchTickets(searchQuery);
    setFilteredTickets(results);
  };
  
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Abierto</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">En Progreso</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">Pendiente</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Resuelto</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Cerrado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgente</Badge>;
      case 'high':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Alta</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">Media</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">Baja</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
  };
  
  // Loading skeleton
  if (isLoadingTickets) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Skeleton className="h-10 w-full md:w-72" />
          <Skeleton className="h-10 w-full md:w-40" />
          <Skeleton className="h-10 w-full md:w-40" />
        </div>
        
        <div className="border rounded-md">
          <div className="p-4 border-b">
            <Skeleton className="h-6 w-48" />
          </div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-b last:border-0">
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-full max-w-md mb-2" />
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Empty state
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">No hay tickets disponibles</h3>
        <p className="text-muted-foreground mt-1">
          No se encontraron tickets de soporte. ¡Crea uno nuevo para comenzar!
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por número de ticket, asunto o descripción..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-9"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Estado</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="open">Abierto</SelectItem>
                <SelectItem value="in_progress">En progreso</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="resolved">Resuelto</SelectItem>
                <SelectItem value="closed">Cerrado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>Prioridad</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="low">Baja</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tickets table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Número</TableHead>
              <TableHead className="max-w-[300px]">Asunto</TableHead>
              <TableHead 
                className="w-[120px] cursor-pointer"
                onClick={() => toggleSort('priority')}
              >
                <div className="flex items-center gap-2">
                  <span>Prioridad</span>
                  {sortBy === 'priority' && (
                    <ArrowDownUp className="h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[120px]">Estado</TableHead>
              <TableHead 
                className="w-[180px] cursor-pointer"
                onClick={() => toggleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  <span>Creado</span>
                  {sortBy === 'created_at' && (
                    <ArrowDownUp className="h-3 w-3" />
                  )}
                </div>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <Info className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                  No se encontraron tickets con estos filtros.
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.ticket_number}</TableCell>
                  <TableCell className="font-medium truncate max-w-[300px]">{ticket.subject}</TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(ticket.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Info className="h-4 w-4 mr-1" />
                      Detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Ticket details dialog */}
      {selectedTicket && (
        <TicketDetailsDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          isAgent={isAgent}
        />
      )}
    </div>
  );
};

export default TicketList;

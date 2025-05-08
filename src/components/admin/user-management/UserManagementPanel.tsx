import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertTriangle, Users, Search, Filter } from 'lucide-react';
import { useAuth } from '@/context/auth';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { UserRole, UserData } from '@/types/auth';
import { useRolePermissions } from '@/hooks/useRolePermissions';
import { getRoleDisplayName } from '@/hooks/useRolePermissions';
import { useUserManagementMethods } from '@/hooks/user-management';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export type ColumnDef<TData, TValue> = {
  header?: string | React.ReactNode
  cell?: (row: TData) => React.ReactNode
}

const roleSchema = z.object({
  role: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

interface UserManagementPanelProps {
}

const UserManagementPanel: React.FC<UserManagementPanelProps> = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<UserRole | 'all'>('all');
  const [sortColumn, setSortColumn] = useState<keyof UserData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { currentUser, userData, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  })
  const { canAccessUserManagement, canEditRoles, canVerifyUsers } = useRolePermissions(userData?.role);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSettingOwner, setIsSettingOwner] = useState(false);
  const [isSettingOwnerEmail, setIsSettingOwnerEmail] = useState('');

  const form = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: "",
    },
  })

  // Fix for the Promise return type mismatch
  // We're wrapping the refreshUserData function to ensure it returns void
  const wrappedRefreshUserData = async (): Promise<void> => {
    await refreshUserData();
    return;
  };

  const {
    updateUserRole,
    getAllUsers,
    verifyEmail,
    setUserAsVerifiedOwner
  } = useUserManagementMethods(
    setSelectedUser,
    setLoading,
    wrappedRefreshUserData
  );

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers, toast]);

  const filteredUsers = React.useMemo(() => {
    let filtered = [...users];

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.displayName.toLowerCase().includes(lowerCaseQuery) ||
        user.email.toLowerCase().includes(lowerCaseQuery)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    return filtered;
  }, [users, searchQuery, filterRole]);

  const sortedUsers = React.useMemo(() => {
    if (!sortColumn) return filteredUsers;

    const sorted = [...filteredUsers];
    sorted.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return -1;
      if (bValue === null || bValue === undefined) return 1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return sorted;
  }, [filteredUsers, sortColumn, sortDirection]);

  const handleSort = (column: keyof UserData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleOpenDeleteDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const handleOpenRoleDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsRoleDialogOpen(true);
  };

  const handleCloseRoleDialog = () => {
    setIsRoleDialogOpen(false);
    setSelectedUser(null);
  };

  const handleRoleSubmit = async (values: z.infer<typeof roleSchema>) => {
    if (!selectedUser) return;

    try {
      await updateUserRole(selectedUser.uid, values.role as UserRole);
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      })
    }
  };

  const handleVerifyEmail = async (user: UserData) => {
    if (!user) return;

    setIsVerifying(true);
    setLoadingId(user.uid);
    try {
      await verifyEmail(user.uid);
      toast({
        title: "Success",
        description: "User email verified successfully",
      })
    } catch (error) {
      console.error('Error verifying user email:', error);
      toast({
        title: "Error",
        description: "Failed to verify user email",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false);
      setLoadingId(null);
    }
  };

  const handleSetOwner = async () => {
    setIsSettingOwner(true);
    try {
      await setUserAsVerifiedOwner(isSettingOwnerEmail);
      toast({
        title: "Success",
        description: "User set as verified owner successfully",
      })
    } catch (error) {
      console.error('Error setting user as verified owner:', error);
      toast({
        title: "Error",
        description: "Failed to set user as verified owner",
        variant: "destructive",
      })
    } finally {
      setIsSettingOwner(false);
    }
  };

  if (!canAccessUserManagement) {
    return (
      <div className="flex items-center justify-center h-48">
        <AlertTriangle className="mr-2 h-4 w-4" />
        <span>No tienes permisos para acceder a esta sección.</span>
      </div>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <Input
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-1/3">
            <Select onValueChange={value => setFilterRole(value as UserRole | 'all')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="unverified">No verificado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="soporte">Soporte</SelectItem>
                <SelectItem value="supply">Supply</SelectItem>
                <SelectItem value="supply_admin">Supply Admin</SelectItem>
                <SelectItem value="bi">BI</SelectItem>
                <SelectItem value="monitoring">Monitoreo</SelectItem>
                <SelectItem value="monitoring_supervisor">Supervisor Monitoreo</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="owner">Propietario</SelectItem>
                <SelectItem value="afiliados">Afiliados</SelectItem>
                <SelectItem value="atención_afiliado">Atención Afiliado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setFilterRole('all');
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            Limpiar filtros
          </Button>
        </div>
        <div className="relative w-full overflow-auto">
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('displayName')}
                  >
                    Nombre
                    {sortColumn === 'displayName' && (
                      sortDirection === 'asc' ? ' ▲' : ' ▼'
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('email')}
                  >
                    Email
                    {sortColumn === 'email' && (
                      sortDirection === 'asc' ? ' ▲' : ' ▼'
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('role')}
                  >
                    Rol
                    {sortColumn === 'role' && (
                      sortDirection === 'asc' ? ' ▲' : ' ▼'
                    )}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort('lastLogin')}
                  >
                    Último Login
                    {sortColumn === 'lastLogin' && (
                      sortDirection === 'asc' ? ' ▲' : ' ▼'
                    )}
                  </Button>
                </TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  <TableRow>
                    <TableCell className="text-center py-6" colSpan={5}>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                </>
              ) : sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center py-6" colSpan={5}>
                    No se encontraron usuarios.
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium">{user.displayName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleDisplayName(user.role)}</TableCell>
                    <TableCell>
                      {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <Users className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => handleOpenRoleDialog(user)}
                            disabled={!canEditRoles || user.role === 'owner'}
                          >
                            Editar Rol
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVerifyEmail(user)}
                            disabled={!canVerifyUsers || user.emailVerified}
                          >
                            {isVerifying && loadingId === user.uid ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                Verificar Email
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleOpenDeleteDialog(user)}
                            disabled={user.role === 'owner'}
                          >
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario permanentemente.
              ¿Estás seguro de que quieres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Rol de Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el nuevo rol para el usuario.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleRoleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={selectedUser?.role}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="unverified">No verificado</SelectItem>
                          <SelectItem value="pending">Pendiente</SelectItem>
                          <SelectItem value="soporte">Soporte</SelectItem>
                          <SelectItem value="supply">Supply</SelectItem>
                          <SelectItem value="supply_admin">Supply Admin</SelectItem>
                          <SelectItem value="bi">BI</SelectItem>
                          <SelectItem value="monitoring">Monitoreo</SelectItem>
                          <SelectItem value="monitoring_supervisor">Supervisor Monitoreo</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="owner">Propietario</SelectItem>
                          <SelectItem value="afiliados">Afiliados</SelectItem>
                          <SelectItem value="atención_afiliado">Atención Afiliado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        El rol del usuario determina sus permisos en el sistema.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">Actualizar Rol</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Email del usuario a establecer como Owner..."
                value={isSettingOwnerEmail}
                onChange={(e) => setIsSettingOwnerEmail(e.target.value)}
              />
            </div>
            <Button
              variant="destructive"
              onClick={() => handleSetOwner()}
              disabled={!canEditRoles || isSettingOwner}
            >
              {isSettingOwner ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Estableciendo Owner...
                </>
              ) : (
                <>
                  Establecer Owner
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Card>
  );
};

export default UserManagementPanel;

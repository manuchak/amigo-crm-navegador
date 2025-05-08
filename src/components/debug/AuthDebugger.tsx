
import React from 'react';
import { useAuth } from '@/context/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AuthDebuggerProps {
  showInProduction?: boolean;
}

const AuthDebugger: React.FC<AuthDebuggerProps> = ({
  showInProduction = false
}) => {
  const { 
    user, 
    currentUser, 
    userData, 
    session, 
    loading, 
    refreshUserData, 
    refreshSession 
  } = useAuth();
  
  // Check if we should show in current environment
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !showInProduction) return null;

  const handleRefresh = async () => {
    try {
      await refreshSession();
      await refreshUserData();
    } catch (error) {
      console.error("Error refreshing auth state:", error);
    }
  };

  return (
    <Card className="bg-slate-50 border-orange-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm text-slate-700">Auth Debug Info</CardTitle>
          <Badge variant={loading ? "outline" : "default"}>
            {loading ? "Loading..." : "Ready"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-xs pt-0">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Session: </span>
            {session ? 
              <Badge variant="outline" className="font-mono">
                {session.access_token ? session.access_token.slice(0, 5) + "..." : "No token"}
              </Badge> : 
              "No session"
            }
          </div>
          
          <div>
            <span className="font-semibold">User: </span>
            {user ? 
              <Badge variant="outline" className="font-mono">
                {user.email || user.id?.slice(0, 5) + "..."}
              </Badge> : 
              "No user"
            }
          </div>
          
          <div>
            <span className="font-semibold">Current User: </span>
            {currentUser ? 
              <Badge variant="outline" className="font-mono">
                {currentUser.email || currentUser.uid?.slice(0, 5) + "..."}
              </Badge> : 
              "No currentUser"
            }
          </div>
          
          <div>
            <span className="font-semibold">User Data: </span>
            {userData ? 
              <Badge variant="outline" className="font-mono">
                {userData.role || "no role"} | {userData.email?.slice(0, 5) + "..."}
              </Badge> : 
              "No userData"
            }
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2" 
            onClick={handleRefresh}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh Auth
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthDebugger;

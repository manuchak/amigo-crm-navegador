
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Phone, History } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ProcessCallSectionProps {
  callId: string;
  onCallIdChange: (value: string) => void;
  onProcess: () => void;
  loading: boolean;
}

const ProcessCallSection: React.FC<ProcessCallSectionProps> = ({ 
  callId, 
  onCallIdChange, 
  onProcess, 
  loading 
}) => {
  const [recentCallIds, setRecentCallIds] = useState<string[]>([]);
  
  // Get call ID from clipboard
  const getFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        onCallIdChange(text.trim());
        toast.success("ID copiado del portapapeles");
      }
    } catch (error) {
      console.error("Error accessing clipboard:", error);
      toast.error("No se pudo acceder al portapapeles");
    }
  };
  
  // Add current ID to recent calls and process it
  const handleProcess = () => {
    if (callId && !recentCallIds.includes(callId)) {
      setRecentCallIds(prev => [callId, ...prev.slice(0, 4)]);
    }
    onProcess();
  };

  return (
    <>
      <Separator />
      <div className="space-y-3">
        <Label htmlFor="callId">Procesar Llamada Específica</Label>
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Input
              id="callId"
              placeholder="Ingresa ID de llamada VAPI"
              value={callId}
              onChange={(e) => onCallIdChange(e.target.value)}
              disabled={loading}
              className="pr-10"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-full w-10 px-0" 
                    onClick={getFromClipboard}
                    disabled={loading}
                  >
                    <History className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Pegar desde portapapeles</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            onClick={handleProcess}
            disabled={loading || !callId.trim()}
            className="whitespace-nowrap"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Phone className="h-4 w-4 mr-2" />}
            Procesar
          </Button>
        </div>
        
        {recentCallIds.length > 0 && (
          <div className="pt-1">
            <Label className="text-xs text-muted-foreground">Recientes:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {recentCallIds.map((id, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 px-2"
                  disabled={loading}
                  onClick={() => onCallIdChange(id)}
                >
                  {id.substring(0, 8)}...
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProcessCallSection;

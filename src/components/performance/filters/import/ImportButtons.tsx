
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DownloadIcon, UploadIcon, XIcon } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TemplateHelpDialog } from '../TemplateHelpDialog';

interface ImportButtonsProps {
  isUploading: boolean;
  isDownloading?: boolean;
  onFileSelected: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDownloadTemplate: () => void;
  onCancelImport: () => void;
}

export function ImportButtons({
  isUploading,
  isDownloading,
  onFileSelected,
  onDownloadTemplate,
  onCancelImport
}: ImportButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      <Input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFileSelected}
        className="hidden"
        id="servicios-file-upload"
        disabled={isUploading}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <label htmlFor="servicios-file-upload">
              <Button variant="outline" size="sm" className="whitespace-nowrap gap-1" asChild disabled={isUploading}>
                <span>
                  {isUploading ? (
                    <>Importando...</>
                  ) : (
                    <>
                      <UploadIcon className="h-4 w-4 mr-1" />
                      Importar Servicios (CSV/Excel)
                    </>
                  )}
                </span>
              </Button>
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Importar datos de servicios desde un archivo CSV o Excel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {isUploading && (
        <Button size="sm" variant="destructive" onClick={onCancelImport} className="whitespace-nowrap gap-1">
          <XIcon className="h-4 w-4 mr-1" />
          Cancelar
        </Button>
      )}
      
      <div className="flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="sm" 
                variant="outline" 
                className="whitespace-nowrap gap-1"
                onClick={onDownloadTemplate}
                disabled={isDownloading}
              >
                <DownloadIcon className="h-4 w-4 mr-1" />
                Descargar Plantilla CSV
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Descargar plantilla CSV con formato correcto para importación</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TemplateHelpDialog />
      </div>
      
      <Button size="sm" className="whitespace-nowrap">
        Generar reporte
      </Button>
    </div>
  );
}

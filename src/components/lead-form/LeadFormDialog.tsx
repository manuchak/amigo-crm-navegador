
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ContactInfo } from "./ContactInfo";
import { QualificationsForm } from "./QualificationsForm";
import { useLeadForm } from "./useLeadForm";
import { LeadFormDialogProps } from "./types";

export function LeadFormDialog({
  open,
  onOpenChange,
  onSubmit,
}: LeadFormDialogProps) {
  const { form, watchTieneCarro, handleSubmit } = useLeadForm({ onSubmit, onOpenChange });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-lg border-0">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-medium text-slate-800">
            Nuevo Lead
          </DialogTitle>
          <DialogDescription className="text-slate-500 text-sm">
            Complete la información del prospecto
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 py-2"
          >
            <ContactInfo form={form} />
            <QualificationsForm form={form} watchTieneCarro={watchTieneCarro} />

            <DialogFooter className="pt-2">
              <Button 
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
              >
                Registrar Lead
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

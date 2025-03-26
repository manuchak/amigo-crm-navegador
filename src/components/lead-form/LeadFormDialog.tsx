
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
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Registro de Nuevo Lead
          </DialogTitle>
          <DialogDescription>
            Ingresa la información del prospecto de custodio
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <ContactInfo form={form} />
            <QualificationsForm form={form} watchTieneCarro={watchTieneCarro} />

            <DialogFooter>
              <Button type="submit">Registrar Lead</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  type Vendor,
} from "@/hooks/useVendors";
import { VendorCard } from "@/components/concierge/VendorCard";
import { VendorForm } from "@/components/concierge/VendorForm";
import { Constants } from "@/integrations/supabase/types";

const serviceCategories = Constants.public.Enums.service_category;

export default function ConciergeVendors() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);

  const { data: vendors, isLoading } = useVendors({ searchTerm, serviceFilter });
  const createVendor = useCreateVendor();
  const updateVendor = useUpdateVendor();
  const deleteVendor = useDeleteVendor();

  const handleOpenForm = (vendor?: Vendor) => {
    setEditingVendor(vendor || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingVendor(null);
  };

  const handleSubmit = (data: { name: string; contact_info?: string; service_types?: string[]; internal_notes?: string }) => {
    if (editingVendor) {
      updateVendor.mutate(
        { id: editingVendor.id, ...data },
        {
          onSuccess: () => {
            toast({ title: t("concierge.vendors.updated") });
            handleCloseForm();
          },
          onError: () => {
            toast({ title: t("concierge.vendors.error"), variant: "destructive" });
          },
        }
      );
    } else {
      createVendor.mutate(data, {
        onSuccess: () => {
          toast({ title: t("concierge.vendors.created") });
          handleCloseForm();
        },
        onError: () => {
          toast({ title: t("concierge.vendors.error"), variant: "destructive" });
        },
      });
    }
  };

  const handleDelete = () => {
    if (!deletingVendor) return;
    deleteVendor.mutate(deletingVendor.id, {
      onSuccess: () => {
        toast({ title: t("concierge.vendors.deleted") });
        setDeletingVendor(null);
      },
      onError: () => {
        toast({ title: t("concierge.vendors.error"), variant: "destructive" });
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold">
            {t("concierge.vendors.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("concierge.vendors.description")}
          </p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <Plus className="h-4 w-4" />
          {t("concierge.vendors.addVendor")}
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("concierge.vendors.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("concierge.vendors.filterByService")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("concierge.vendors.allServices")}</SelectItem>
                {serviceCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {t(`experiences.filter.${category}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : !vendors?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("concierge.vendors.noVendors")}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {vendors.map((vendor) => (
                <VendorCard
                  key={vendor.id}
                  vendor={vendor}
                  onEdit={handleOpenForm}
                  onDelete={setDeletingVendor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <VendorForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        vendor={editingVendor}
        onSubmit={handleSubmit}
        isSubmitting={createVendor.isPending || updateVendor.isPending}
      />

      <AlertDialog open={!!deletingVendor} onOpenChange={() => setDeletingVendor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {t("concierge.vendors.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("concierge.vendors.deleteConfirm.description", {
                name: deletingVendor?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("concierge.vendors.deleteConfirm.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("concierge.vendors.deleteConfirm.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

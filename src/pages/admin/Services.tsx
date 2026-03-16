import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { ServiceForm, type ServiceFormData } from "@/components/services/ServiceForm";
import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  type Service,
} from "@/hooks/useServices";
import { useCategories, getCategoryName, getCategoryNameBySlug } from "@/hooks/useCategories";

export default function AdminServices() {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useServices({
    searchTerm,
    categoryFilter,
  });
  const { data: categories = [] } = useCategories();

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const handleOpenForm = (service?: Service) => {
    setEditingService(service || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingService(null);
  };

  const handleSubmit = async (data: ServiceFormData) => {
    try {
      const photos = data.photo_urls
        ? data.photo_urls
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : null;

      const serviceData = {
        name: data.name_en,
        name_en: data.name_en,
        name_es: data.name_es || null,
        description: data.description_en,
        description_en: data.description_en,
        description_es: data.description_es || null,
        category: data.category,
        photos,
        price_min: data.price_min ?? null,
        price_max: data.price_max ?? null,
        is_for_sale: data.is_for_sale ?? false,
        is_rental: data.is_rental ?? false,
      };

      if (editingService) {
        await updateService.mutateAsync({
          id: editingService.id,
          ...serviceData,
        });
        toast.success(t("admin.services.updated"));
      } else {
        await createService.mutateAsync(serviceData);
        toast.success(t("admin.services.created"));
      }
      handleCloseForm();
    } catch (error) {
      toast.error(t("admin.services.error"));
    }
  };

  const handleDeleteClick = (service: Service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleDuplicate = (service: Service) => {
    // Open form pre-filled with source service data but no concierge_id
    const duplicated = { ...service, concierge_id: null } as Service;
    setEditingService(null); // Force "create" mode
    setFormOpen(true);
    // Use setTimeout to let form mount before resetting
    setTimeout(() => {
      // The form will be in "create" mode but we need to pre-fill via the service prop
      // Instead, set editingService to null and open with a special duplicated service
    }, 0);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await deleteService.mutateAsync(serviceToDelete.id);
      toast.success(t("admin.services.deleted"));
      setDeleteDialogOpen(false);
      setServiceToDelete(null);
    } catch (error) {
      toast.error(t("admin.services.error"));
    }
  };

  const getServiceName = (service: Service) => {
    if (i18n.language === "es") {
      return (service as any).name_es || (service as any).name_en || service.name;
    }
    return (service as any).name_en || service.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            {t("admin.services.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.services.description")}
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.services.addService")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.services.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("experiences.filter.all")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("experiences.filter.all")}</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.slug} value={category.slug}>
                {getCategoryName(category, i18n.language)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.services.columns.name")}</TableHead>
              <TableHead>{t("admin.services.columns.category")}</TableHead>
              <TableHead>{t("admin.services.columns.status")}</TableHead>
              <TableHead>{t("admin.services.columns.priceRange")}</TableHead>
              <TableHead className="w-[100px]">
                {t("admin.services.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                  {t("experiences.loading")}
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {t("admin.services.noServices")}
                </TableCell>
              </TableRow>
            ) : (
              services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{getServiceName(service)}</TableCell>
                  <TableCell>
                    {getCategoryNameBySlug(categories, service.category, i18n.language)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {service.is_for_sale && (
                        <Badge variant="secondary">
                          {t("admin.services.forSale")}
                        </Badge>
                      )}
                      {service.is_rental && (
                        <Badge variant="outline">
                          {t("admin.services.rental")}
                        </Badge>
                      )}
                      {!service.is_for_sale && !service.is_rental && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {service.price_min != null && service.price_max != null
                      ? service.price_min === service.price_max
                        ? `$${service.price_min.toFixed(2)}`
                        : `$${service.price_min.toFixed(2)} – $${service.price_max.toFixed(2)}`
                      : service.price_min != null
                        ? `${t("experiences.fromPrice", { price: `$${service.price_min.toFixed(2)}` })}`
                        : "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(service)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("admin.services.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(service)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("admin.services.delete")}
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

      <ServiceForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        service={editingService}
        onSubmit={handleSubmit}
        isSubmitting={createService.isPending || updateService.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.services.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.services.deleteConfirm.description", {
                name: serviceToDelete?.name,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("admin.users.removeConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.services.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

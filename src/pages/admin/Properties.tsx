import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { PropertyForm } from "@/components/properties/PropertyForm";
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  type Property,
} from "@/hooks/useProperties";
import { Constants } from "@/integrations/supabase/types";

const locationTypes = Constants.public.Enums.location_type;

export default function AdminProperties() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);

  const { data: properties = [], isLoading } = useProperties({
    searchTerm,
    locationFilter,
  });

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  const handleOpenForm = (property?: Property) => {
    setEditingProperty(property || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingProperty(null);
  };

  const handleSubmit = async (data: {
    name: string;
    description: string;
    location: string;
    booking_url?: string | null;
    sleeps: number;
    bedrooms: number;
    bathrooms: number;
    vendor_id?: string | null;
    photo_urls?: string | null;
    amenities_text?: string | null;
  }) => {
    try {
      // Parse photo URLs from textarea (one per line)
      const photos = data.photo_urls
        ? data.photo_urls
            .split("\n")
            .map((url) => url.trim())
            .filter((url) => url.length > 0)
        : null;

      // Parse amenities from textarea (one per line)
      const amenities = data.amenities_text
        ? data.amenities_text
            .split("\n")
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
        : null;

      const propertyData = {
        name: data.name,
        description: data.description,
        location: data.location as typeof locationTypes[number],
        booking_url: data.booking_url || null,
        sleeps: data.sleeps,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        vendor_id: data.vendor_id || null,
        photos,
        amenities,
      };

      if (editingProperty) {
        await updateProperty.mutateAsync({
          id: editingProperty.id,
          ...propertyData,
        });
        toast.success(t("admin.properties.updated"));
      } else {
        await createProperty.mutateAsync(propertyData);
        toast.success(t("admin.properties.created"));
      }
      handleCloseForm();
    } catch (error) {
      toast.error(t("admin.properties.error"));
    }
  };

  const handleDeleteClick = (property: Property) => {
    setPropertyToDelete(property);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!propertyToDelete) return;

    try {
      await deleteProperty.mutateAsync(propertyToDelete.id);
      toast.success(t("admin.properties.deleted"));
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    } catch (error) {
      toast.error(t("admin.properties.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            {t("admin.properties.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.properties.description")}
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.properties.addProperty")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("admin.properties.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t("admin.properties.allLocations")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("admin.properties.allLocations")}</SelectItem>
            {locationTypes.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {t(`properties.locations.${loc}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.properties.columns.name")}</TableHead>
              <TableHead>{t("admin.properties.columns.location")}</TableHead>
              <TableHead>{t("admin.properties.columns.sleeps")}</TableHead>
              <TableHead>{t("admin.properties.columns.propertyManager")}</TableHead>
              <TableHead>{t("admin.properties.columns.bookingLink")}</TableHead>
              <TableHead className="w-[100px]">
                {t("admin.properties.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("experiences.loading")}
                </TableCell>
              </TableRow>
            ) : properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  {t("admin.properties.noProperties")}
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.name}</TableCell>
                  <TableCell>
                    {t(`properties.locations.${property.location}`)}
                  </TableCell>
                  <TableCell>{property.sleeps}</TableCell>
                  <TableCell>{property.vendor_name || "-"}</TableCell>
                  <TableCell>
                    {property.booking_url ? (
                      <a
                        href={property.booking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {t("admin.properties.viewListing")}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(property)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("admin.properties.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(property)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("admin.properties.delete")}
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

      <PropertyForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        property={editingProperty}
        onSubmit={handleSubmit}
        isSubmitting={createProperty.isPending || updateProperty.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.properties.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.properties.deleteConfirm.description", {
                name: propertyToDelete?.name,
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
              {t("admin.properties.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

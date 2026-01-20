import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, MoreHorizontal, Check, X } from "lucide-react";
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
import { CategoryForm } from "@/components/admin/CategoryForm";
import {
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useCategoryServiceCount,
  type Category,
  type CategoryInsert,
  type CategoryUpdate,
} from "@/hooks/useCategories";

export default function AdminCategories() {
  const { t } = useTranslation();
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useAllCategories();
  const { data: serviceCount = 0 } = useCategoryServiceCount(categoryToDelete?.slug || null);

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const handleOpenForm = (category?: Category) => {
    setEditingCategory(category || null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (data: CategoryInsert | Omit<CategoryUpdate, "id">) => {
    try {
      if (editingCategory) {
        await updateCategory.mutateAsync({
          id: editingCategory.id,
          ...data,
        });
        toast.success(t("admin.categories.updated"));
      } else {
        await createCategory.mutateAsync(data as CategoryInsert);
        toast.success(t("admin.categories.created"));
      }
      handleCloseForm();
    } catch (error: any) {
      if (error?.message?.includes("duplicate key")) {
        toast.error(t("admin.categories.duplicateSlug"));
      } else {
        toast.error(t("admin.categories.error"));
      }
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteCategory.mutateAsync(categoryToDelete.id);
      toast.success(t("admin.categories.deleted"));
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(t("admin.categories.error"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold">
            {t("admin.categories.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.categories.description")}
          </p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.categories.addCategory")}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.categories.columns.nameEn")}</TableHead>
              <TableHead>{t("admin.categories.columns.nameEs")}</TableHead>
              <TableHead>{t("admin.categories.columns.slug")}</TableHead>
              <TableHead>{t("admin.categories.columns.icon")}</TableHead>
              <TableHead className="text-center">{t("admin.categories.columns.order")}</TableHead>
              <TableHead className="text-center">{t("admin.categories.columns.active")}</TableHead>
              <TableHead className="w-[100px]">
                {t("admin.categories.columns.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t("experiences.loading")}
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  {t("admin.categories.noCategories")}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name_en}</TableCell>
                  <TableCell>{category.name_es}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.slug}</Badge>
                  </TableCell>
                  <TableCell>{category.icon || "-"}</TableCell>
                  <TableCell className="text-center">{category.sort_order}</TableCell>
                  <TableCell className="text-center">
                    {category.is_active ? (
                      <Check className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <X className="h-4 w-4 text-muted-foreground mx-auto" />
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
                        <DropdownMenuItem onClick={() => handleOpenForm(category)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t("admin.categories.edit")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(category)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t("admin.categories.delete")}
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

      <CategoryForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        category={editingCategory}
        onSubmit={handleSubmit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("admin.categories.deleteConfirm.title")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {serviceCount > 0
                ? t("admin.categories.deleteConfirm.hasServices", {
                    name: categoryToDelete?.name_en,
                    count: serviceCount,
                  })
                : t("admin.categories.deleteConfirm.description", {
                    name: categoryToDelete?.name_en,
                  })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("admin.users.removeConfirm.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={serviceCount > 0}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("admin.categories.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

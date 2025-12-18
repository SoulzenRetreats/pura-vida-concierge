import { Edit2, Trash2, Phone, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Vendor } from "@/hooks/useVendors";

interface VendorCardProps {
  vendor: Vendor;
  onEdit: (vendor: Vendor) => void;
  onDelete: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onEdit, onDelete }: VendorCardProps) {

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{vendor.name}</h3>

            {vendor.contact_info && (
              <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="break-words">{vendor.contact_info}</span>
              </div>
            )}

            {vendor.service_types && vendor.service_types.length > 0 && (
              <div className="flex items-start gap-2 mt-3">
                <Tag className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {vendor.service_types.map((type) => (
                    <Badge key={type} variant="secondary" className="text-xs">
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {vendor.internal_notes && (
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                {vendor.internal_notes}
              </p>
            )}
          </div>

          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(vendor)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
              <span className="sr-only">Edit vendor</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(vendor)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete vendor</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

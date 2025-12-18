import { useTranslation } from "react-i18next";
import { useState } from "react";
import { DollarSign, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useVendorsByService } from "@/hooks/useVendors";
import type { BookingDetail } from "@/hooks/useBookingDetail";

interface VendorAssignmentProps {
  bookingServices: BookingDetail["booking_services"];
  onAssign: (serviceId: string, vendorId: string | null, price: number | null) => void;
}

export function VendorAssignment({ bookingServices, onAssign }: VendorAssignmentProps) {
  const { t } = useTranslation();

  if (!bookingServices?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {t("concierge.bookingDetail.vendors.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("concierge.bookingDetail.vendors.noServices")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          {t("concierge.bookingDetail.vendors.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookingServices.map((bs) => (
          <ServiceVendorRow
            key={bs.service_id}
            serviceId={bs.service_id}
            serviceName={bs.services?.name || "Unknown Service"}
            serviceCategory={bs.services?.category || ""}
            currentVendorId={bs.vendor_id}
            currentPrice={bs.price}
            onAssign={onAssign}
          />
        ))}
      </CardContent>
    </Card>
  );
}

interface ServiceVendorRowProps {
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  currentVendorId: string | null;
  currentPrice: number | null;
  onAssign: (serviceId: string, vendorId: string | null, price: number | null) => void;
}

function ServiceVendorRow({
  serviceId,
  serviceName,
  serviceCategory,
  currentVendorId,
  currentPrice,
  onAssign,
}: ServiceVendorRowProps) {
  const { t } = useTranslation();
  const [price, setPrice] = useState<string>(currentPrice?.toString() || "");
  const { data: vendors } = useVendorsByService(serviceCategory);

  const handleVendorChange = (vendorId: string) => {
    onAssign(serviceId, vendorId === "none" ? null : vendorId, price ? parseFloat(price) : null);
  };

  const handlePriceBlur = () => {
    const numPrice = price ? parseFloat(price) : null;
    onAssign(serviceId, currentVendorId, numPrice);
  };

  return (
    <div className="p-3 border rounded-lg space-y-3">
      <div className="font-medium">{serviceName}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("concierge.bookingDetail.vendors.assignVendor")}
          </Label>
          <Select
            value={currentVendorId || "none"}
            onValueChange={handleVendorChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("concierge.bookingDetail.vendors.selectVendor")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">
                {t("concierge.bookingDetail.vendors.noVendor")}
              </SelectItem>
              {vendors?.map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            {t("concierge.bookingDetail.vendors.price")}
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="0.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={handlePriceBlur}
              className="pl-8"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

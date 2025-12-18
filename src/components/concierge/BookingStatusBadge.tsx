import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type BookingStatus = "new_request" | "in_review" | "quote_sent" | "confirmed" | "completed";

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const statusStyles: Record<BookingStatus, string> = {
  new_request: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  in_review: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  quote_sent: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  completed: "bg-muted text-muted-foreground",
};

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const { t } = useTranslation();

  return (
    <Badge
      variant="secondary"
      className={cn("font-medium", statusStyles[status], className)}
    >
      {t(`concierge.bookings.statuses.${status}`)}
    </Badge>
  );
}

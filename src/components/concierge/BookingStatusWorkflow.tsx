import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type BookingStatus = Database["public"]["Enums"]["booking_status"];

interface BookingStatusWorkflowProps {
  currentStatus: BookingStatus;
  onStatusChange: (newStatus: BookingStatus) => void;
  isUpdating: boolean;
}

const statusWorkflow: Record<BookingStatus, { next: BookingStatus | null; actionKey: string }> = {
  new_request: { next: "in_review", actionKey: "startReview" },
  in_review: { next: "quote_sent", actionKey: "sendQuote" },
  quote_sent: { next: "confirmed", actionKey: "markConfirmed" },
  confirmed: { next: "completed", actionKey: "markCompleted" },
  completed: { next: null, actionKey: "" },
};

export function BookingStatusWorkflow({
  currentStatus,
  onStatusChange,
  isUpdating,
}: BookingStatusWorkflowProps) {
  const { t } = useTranslation();
  const workflow = statusWorkflow[currentStatus];

  if (!workflow.next) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Check className="h-4 w-4 text-green-600" />
        {t("concierge.bookingDetail.workflow.completed")}
      </div>
    );
  }

  return (
    <Button
      onClick={() => onStatusChange(workflow.next!)}
      disabled={isUpdating}
      className="gap-2"
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowRight className="h-4 w-4" />
      )}
      {t(`concierge.bookingDetail.workflow.${workflow.actionKey}`)}
    </Button>
  );
}

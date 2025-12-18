import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageToggleProps {
  variant?: "icon" | "full";
  className?: string;
}

export function LanguageToggle({ variant = "icon", className }: LanguageToggleProps) {
  const { i18n, t } = useTranslation();

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language?.startsWith("es") ? "es" : "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={variant === "icon" ? "icon" : "sm"} className={className}>
          <Globe className="h-4 w-4" />
          {variant === "full" && (
            <span className="ml-2">{currentLang.toUpperCase()}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => changeLanguage("en")}
          className={currentLang === "en" ? "bg-accent" : ""}
        >
          {t("common.language.en")}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage("es")}
          className={currentLang === "es" ? "bg-accent" : ""}
        >
          {t("common.language.es")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

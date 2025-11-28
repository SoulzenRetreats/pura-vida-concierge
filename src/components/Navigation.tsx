import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl sm:text-3xl font-heading font-bold text-primary">
              Pura Vida
            </span>
            <span className="text-xl sm:text-2xl font-heading text-secondary">
              Concierge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/properties"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              {t('nav.properties')}
            </Link>
            <Link
              to="/experiences"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              {t('nav.experiences')}
            </Link>
            <Link
              to="/trip-types"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              {t('nav.tripTypes')}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => changeLanguage('en')}>
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage('es')}>
                  🇨🇷 Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/booking">
              <Button className="gradient-secondary hover:opacity-90 transition-smooth">
                {t('nav.planMyTrip')}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <Link
              to="/properties"
              className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.properties')}
            </Link>
            <Link
              to="/experiences"
              className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.experiences')}
            </Link>
            <Link
              to="/trip-types"
              className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => setIsOpen(false)}
            >
              {t('nav.tripTypes')}
            </Link>
            <div className="flex gap-2 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeLanguage('en')}
                className="flex-1"
              >
                🇺🇸 English
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeLanguage('es')}
                className="flex-1"
              >
                🇨🇷 Español
              </Button>
            </div>
            <Link to="/booking" onClick={() => setIsOpen(false)}>
              <Button className="w-full gradient-secondary hover:opacity-90 transition-smooth">
                {t('nav.planMyTrip')}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

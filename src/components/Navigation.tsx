import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

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
              Properties
            </Link>
            <Link
              to="/experiences"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Experiences
            </Link>
            <Link
              to="/trip-types"
              className="text-foreground hover:text-primary transition-smooth font-medium"
            >
              Trip Types
            </Link>
            <Link to="/booking">
              <Button className="gradient-secondary hover:opacity-90 transition-smooth">
                Plan My Trip
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
              Properties
            </Link>
            <Link
              to="/experiences"
              className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => setIsOpen(false)}
            >
              Experiences
            </Link>
            <Link
              to="/trip-types"
              className="block py-2 text-foreground hover:text-primary transition-smooth font-medium"
              onClick={() => setIsOpen(false)}
            >
              Trip Types
            </Link>
            <Link to="/booking" onClick={() => setIsOpen(false)}>
              <Button className="w-full gradient-secondary hover:opacity-90 transition-smooth">
                Plan My Trip
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

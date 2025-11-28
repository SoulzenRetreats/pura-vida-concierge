import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-heading font-bold mb-4">
              Pura Vida Concierge
            </h3>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Luxury group vacations and concierge services in Costa Rica's most
              stunning destinations. Experience Jaco and La Fortuna like never before.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/properties"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
                >
                  Properties
                </Link>
              </li>
              <li>
                <Link
                  to="/experiences"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
                >
                  Experiences
                </Link>
              </li>
              <li>
                <Link
                  to="/trip-types"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
                >
                  Trip Types
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
                >
                  Book Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  info@puravidaconcierge.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  +506 1234-5678
                </span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-primary-foreground/80">
                  Jaco & La Fortuna, Costa Rica
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-primary-foreground/80">
          <p>© {new Date().getFullYear()} Pura Vida Concierge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

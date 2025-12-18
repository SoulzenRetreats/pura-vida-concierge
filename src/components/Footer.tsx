import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
export const Footer = () => {
  const {
    t
  } = useTranslation();
  return <footer className="bg-primary text-primary-foreground py-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-3xl font-heading font-bold mb-4">
              Pura Vida Concierge
            </h3>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/properties" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t('nav.properties')}
                </Link>
              </li>
              <li>
                <Link to="/experiences" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t('nav.experiences')}
                </Link>
              </li>
              <li>
                <Link to="/trip-types" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t('nav.tripTypes')}
                </Link>
              </li>
              <li>
                <Link to="/booking" className="text-primary-foreground/80 hover:text-primary-foreground transition-smooth">
                  {t('footer.bookNow')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-xl font-semibold mb-4">{t('footer.contact')}</h4>
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
                  +506 8755 0051 
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
          <p>{t('footer.copyright', {
            year: new Date().getFullYear()
          })}</p>
        </div>
      </div>
    </footer>;
};
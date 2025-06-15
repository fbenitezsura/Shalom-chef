import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';
import Logo from '@modules/common/components/logo/index';
import SocialIcon from '@modules/layout/components/socialIcon';
import Separator from '@modules/layout/components/separator/index';

export default async function Footer() {

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-restaurant-black text-white py-10">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Tagline */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <Logo />
            <p className="text-sm italic max-w-xs text-gray-400 mt-4 text-center md:text-left">
              "La excelencia culinaria no es un destino, sino un viaje continuo"
            </p>
          </div>

          {/* Contact Information */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="font-playfair text-xl font-semibold tracking-wide text-restaurant-gold mb-2">
              Contáctanos
            </h3>
            <div className="flex items-center space-x-2">
              <MapPin size={16} className="text-restaurant-red" />
              <span className="text-sm">Coronel</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone size={16} className="text-restaurant-red" />
              <span className="text-sm">+569 30660016</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail size={16} className="text-restaurant-red" />
              <span className="text-sm">shalomchef.srl@gmail.com</span>
            </div>
          </div>

          {/* Hours */}
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h3 className="font-playfair text-xl font-semibold tracking-wide text-restaurant-gold mb-2">
              Horarios
            </h3>
            <div className="grid grid-cols-2 gap-1 w-full max-w-xs">
              <span className="text-sm font-medium">Lunes - Viernes:</span>
              <span className="text-sm text-gray-400">17:00 - 23:30</span>
            </div>
            <div className="pt-4">
              <span className="text-xs text-restaurant-gold border border-restaurant-gold px-3 py-1 rounded-md">
                Reservaciones recomendadas
              </span>
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="flex items-center justify-center my-8">
          <Separator className="w-1/4 bg-restaurant-gold/30" />
          <div className="mx-4">
            <div className="w-3 h-3 bg-restaurant-red transform rotate-45"></div>
          </div>
          <Separator className="w-1/4 bg-restaurant-gold/30" />
        </div>

        {/* Bottom section */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-4">
          <p className="text-xs text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear}. Todos los derechos reservados.
          </p>

          <div className="flex space-x-3">
            <SocialIcon href="https://facebook.com/profile.php?id=61574469481798" icon={Facebook} />
            <SocialIcon href="https://instagram.com/shalom.chef_oficial" icon={Instagram} />
          </div>
        </div>
      </div>
    </footer>
  )
}

import { MapPin, Phone, Mail, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground mt-12">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl italic">Д</span>
              </div>
              <div>
                <div className="font-bold text-lg">ДОБРЫНИНСКИЙ</div>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Сеть кондитерских и гастрономии с богатой историей и традициями качества.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="text-xs font-bold">VK</span>
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary transition-colors">
                <span className="text-xs font-bold">TG</span>
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="font-bold mb-4">Каталог</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Торты</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Пирожные</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Выпечка</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Хлеб</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Гастрономия</a></li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-bold mb-4">Информация</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">О компании</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Доставка и оплата</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Акции</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Программа лояльности</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-primary text-sm">Контакты</a></li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="font-bold mb-4">Контакты</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <a href="tel:+74951339815" className="text-primary-foreground/70 hover:text-primary text-sm">
                  +7 (495) 133-98-15
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <a href="mailto:info@dobrynka.ru" className="text-primary-foreground/70 hover:text-primary text-sm">
                  info@dobrynka.ru
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Москва, ул. Добрынинская, д. 1
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span className="text-primary-foreground/70 text-sm">
                  Ежедневно с 8:00 до 22:00
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-xs">
            © 2024 Добрынинский. Все права защищены.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-primary-foreground/50 hover:text-primary text-xs">Политика конфиденциальности</a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary text-xs">Пользовательское соглашение</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

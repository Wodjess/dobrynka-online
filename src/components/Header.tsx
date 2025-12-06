import { Menu, Search, User, Heart, ShoppingCart, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="w-full bg-background border-b border-border">
      {/* Top bar */}
      <div className="container py-2 flex items-center justify-between">
        <a href="#" className="nav-link-orange flex items-center gap-1 text-sm">
          <MapPin className="w-4 h-4" />
          <span>Доставка/Самовывоз</span>
        </a>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="nav-link">Торты на заказ</a>
          <a href="#" className="nav-link">Магазины</a>
          <a href="#" className="nav-link">Акции</a>
          <a href="#" className="nav-link-orange">Сделать предзаказ</a>
        </nav>
      </div>

      {/* Main header */}
      <div className="container py-3 flex items-center gap-4">
        {/* Burger menu */}
        <button className="icon-button md:flex">
          <Menu className="w-6 h-6 text-foreground" />
        </button>

        {/* Logo */}
        <a href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl italic">Д</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-primary font-bold text-lg leading-tight">ДОБРЫНИНСКИЙ</div>
            <div className="text-muted-foreground text-xs">КОНДИТЕРСКИЕ И ГАСТРОНОМИЯ</div>
          </div>
        </a>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative flex items-center border border-border rounded-lg px-4 py-2 bg-background">
            <input
              type="text"
              placeholder="Поиск"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <Search className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Phone */}
        <a href="tel:+74951339815" className="hidden lg:flex items-center gap-2 text-foreground hover:text-primary transition-colors">
          <Phone className="w-4 h-4" />
          <span className="text-sm font-medium">+7 (495) 133-98-15</span>
        </a>

        {/* Icons */}
        <div className="flex items-center gap-1">
          <button className="icon-button">
            <User className="w-5 h-5 text-foreground" />
          </button>
          
          <button className="icon-button">
            <Heart className="w-5 h-5 text-foreground" />
            <span className="badge-count">0</span>
          </button>
          
          <button className="icon-button">
            <ShoppingCart className="w-5 h-5 text-foreground" />
            <span className="badge-count">0</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

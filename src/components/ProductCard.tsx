import { Heart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  weight: string;
  price?: number;
  image: string;
  isNew?: boolean;
  discount?: number;
}

const ProductCard = ({ name, weight, price, image, isNew, discount }: ProductCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="product-card group">
      <div className="relative">
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {isNew && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded font-medium">
              Новинка
            </span>
          )}
          {discount && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded font-medium">
              -{discount}%
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors z-10"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-primary text-primary' : 'text-muted-foreground'
            }`}
          />
        </button>

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-foreground mb-2 line-clamp-2 min-h-[40px]">
          {name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            {weight}
          </span>
          
          {price && (
            <span className="text-sm font-bold text-foreground">
              {price} ₽
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

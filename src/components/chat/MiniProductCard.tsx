interface MiniProductCardProps {
  name: string;
  price: number;
  image: string;
  url?: string;
  discount?: number;
}

const MiniProductCard = ({ name, price, image, url, discount }: MiniProductCardProps) => {
  const discountedPrice = discount ? Math.round(price * (1 - discount / 100)) : price;
  
  const handleClick = () => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="flex-shrink-0 w-28 bg-white rounded-lg overflow-hidden shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback image on error
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200";
          }}
        />
      </div>
      <div className="p-2">
        <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1 min-h-[32px]">
          {name}
        </h4>
        <div className="flex items-center gap-1 flex-wrap">
          {price > 0 ? (
            discount ? (
              <>
                <span className="text-[10px] text-muted-foreground line-through">
                  {price} ₽
                </span>
                <span className="text-xs font-bold text-primary">
                  {discountedPrice} ₽
                </span>
              </>
            ) : (
              <span className="text-xs font-bold text-primary">
                {price} ₽
              </span>
            )
          ) : (
            <span className="text-xs text-muted-foreground">
              Цена по запросу
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MiniProductCard;

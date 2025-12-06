interface MiniProductCardProps {
  name: string;
  price: number;
  image: string;
  discount?: number;
}

const MiniProductCard = ({ name, price, image, discount }: MiniProductCardProps) => {
  return (
    <div className="flex-shrink-0 w-28 bg-white rounded-lg overflow-hidden shadow-sm border border-border/50 cursor-pointer hover:shadow-md transition-shadow">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2">
        <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1 min-h-[32px]">
          {name}
        </h4>
        <div className="flex items-center gap-1">
          {discount && (
            <span className="text-[10px] text-muted-foreground line-through">
              {Math.round(price * (1 + discount / 100))} ₽
            </span>
          )}
          <span className="text-xs font-bold text-primary">
            {price} ₽
          </span>
        </div>
      </div>
    </div>
  );
};

export default MiniProductCard;

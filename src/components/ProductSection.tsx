import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  weight: string;
  price?: number;
  image: string;
  isNew?: boolean;
  discount?: number;
}

interface ProductSectionProps {
  title: string;
  linkText?: string;
  products: Product[];
}

const ProductSection = ({ title, linkText = "Посмотреть все товары", products }: ProductSectionProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">{title}</h2>
        <a href="#" className="nav-link-orange hidden sm:inline-flex items-center gap-1">
          {linkText}
        </a>
      </div>

      {/* Products carousel */}
      <div className="relative">
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 btn-carousel z-10 shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[220px] max-w-[220px]">
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute -right-4 top-1/2 -translate-y-1/2 btn-carousel z-10 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile link */}
      <a href="#" className="nav-link-orange sm:hidden flex items-center justify-center mt-4">
        {linkText}
      </a>
    </section>
  );
};

export default ProductSection;

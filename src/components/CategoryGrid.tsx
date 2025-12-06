const categories = [
  {
    id: 1,
    name: "Торты",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop",
    count: 156,
  },
  {
    id: 2,
    name: "Пирожные",
    image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=300&h=200&fit=crop",
    count: 89,
  },
  {
    id: 3,
    name: "Выпечка",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop",
    count: 234,
  },
  {
    id: 4,
    name: "Хлеб",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop",
    count: 45,
  },
  {
    id: 5,
    name: "Напитки",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
    count: 67,
  },
  {
    id: 6,
    name: "Гастрономия",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=300&h=200&fit=crop",
    count: 312,
  },
];

const CategoryGrid = () => {
  return (
    <section className="container py-8">
      <h2 className="section-title mb-6">КАТЕГОРИИ</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <a
            key={category.id}
            href="#"
            className="group relative overflow-hidden rounded-xl aspect-square"
          >
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-primary-foreground font-medium text-sm mb-1">{category.name}</h3>
              <span className="text-primary-foreground/70 text-xs">{category.count} товаров</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;

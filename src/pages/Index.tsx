import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import CategoryGrid from "@/components/CategoryGrid";
import Footer from "@/components/Footer";
import ChatBot from "@/components/chat/ChatBot";
import WelcomeOverlay from "@/components/chat/WelcomeOverlay";
import ChatArrowIndicator from "@/components/chat/ChatArrowIndicator";
const newYearProducts = [
  {
    id: 1,
    name: 'Шоколад молочный Chokodelika "Ореховый"',
    weight: "150 г",
    price: 450,
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=300&h=300&fit=crop",
    isNew: true,
  },
  {
    id: 2,
    name: "Открытка шоколадная №14 С НГ и Рождеством",
    weight: "70 г",
    price: 290,
    image: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop",
  },
  {
    id: 3,
    name: "Открытка шоколадная №6 С Новым годом",
    weight: "70 г",
    price: 290,
    image: "https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=300&h=300&fit=crop",
  },
  {
    id: 4,
    name: 'Шоколад темный с украшением "Таежный"',
    weight: "150 г",
    price: 520,
    image: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=300&h=300&fit=crop",
    isNew: true,
  },
  {
    id: 5,
    name: "Пряник имбирный Елочка",
    weight: "100 г",
    price: 180,
    image: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=300&h=300&fit=crop",
  },
  {
    id: 6,
    name: "Набор конфет Новогодний",
    weight: "250 г",
    price: 890,
    image: "https://images.unsplash.com/photo-1575224300306-1b8da36134ec?w=300&h=300&fit=crop",
    discount: 15,
  },
];

const popularProducts = [
  {
    id: 7,
    name: "Торт Наполеон классический",
    weight: "1000 г",
    price: 1290,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=300&h=300&fit=crop",
  },
  {
    id: 8,
    name: "Торт Медовик",
    weight: "900 г",
    price: 1150,
    image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=300&h=300&fit=crop",
  },
  {
    id: 9,
    name: "Эклер шоколадный",
    weight: "80 г",
    price: 120,
    image: "https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=300&h=300&fit=crop",
  },
  {
    id: 10,
    name: "Круассан с миндальным кремом",
    weight: "110 г",
    price: 180,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop",
  },
  {
    id: 11,
    name: "Чизкейк Нью-Йорк",
    weight: "180 г",
    price: 320,
    image: "https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=300&h=300&fit=crop",
  },
  {
    id: 12,
    name: "Макарон ассорти",
    weight: "120 г",
    price: 450,
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=300&h=300&fit=crop",
  },
];

const discountProducts = [
  {
    id: 13,
    name: "Пирожное Тирамису",
    weight: "150 г",
    price: 280,
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=300&fit=crop",
    discount: 20,
  },
  {
    id: 14,
    name: "Торт Прага",
    weight: "800 г",
    price: 980,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop",
    discount: 10,
  },
  {
    id: 15,
    name: "Кекс лимонный",
    weight: "300 г",
    price: 320,
    image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=300&h=300&fit=crop",
    discount: 15,
  },
  {
    id: 16,
    name: "Рулет маковый",
    weight: "400 г",
    price: 380,
    image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=300&h=300&fit=crop",
    discount: 25,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <WelcomeOverlay />
      <Header />
      <main>
        <HeroBanner />
        <ProductSection 
          title="НОВОГОДНЕЕ МЕНЮ" 
          products={newYearProducts} 
        />
        <CategoryGrid />
        <ProductSection 
          title="ПОПУЛЯРНЫЕ ТОВАРЫ" 
          products={popularProducts} 
        />
        <ProductSection 
          title="АКЦИИ И СКИДКИ" 
          products={discountProducts} 
        />
      </main>
      <Footer />
      <ChatBot />
      <ChatArrowIndicator delay={10000} blinkCount={5} />
    </div>
  );
};

export default Index;

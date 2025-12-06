import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import botLogo from "@/assets/bot-logo.png";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  products?: Array<{
    name: string;
    price: number;
    image: string;
    discount?: number;
  }>;
}

const cakeProducts = [
  { name: "Добрынинский птичка", price: 890, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200", discount: 10 },
  { name: "Торт Наполеон", price: 1250, image: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=200" },
  { name: "Медовик классический", price: 980, image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=200" },
  { name: "Прага шоколадная", price: 1150, image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=200", discount: 15 },
];

const juiceProducts = [
  { name: "Сок яблочный", price: 189, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=200", discount: 20 },
  { name: "Сок апельсиновый", price: 210, image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200" },
  { name: "Морс ягодный", price: 175, image: "https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=200" },
  { name: "Компот домашний", price: 145, image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=200", discount: 10 },
];

const botResponses: { text: string; products?: typeof cakeProducts }[] = [
  {
    text: "Привет, хочешь `СКИДКУ`?) Сделай заказ тут. Буду рада помочь! 😊",
  },
  {
    text: "Рада буду помочь, однако перед тем, чтобы предложить `хороший торт`, сначала я должна узнать:\n1) К какому празднику тебе нужен торт?\n2) Есть ли непереносимость лактозы, сахарный диабет или другие непереносимости?\n3) Сколько человек будет на празднике?",
  },
  {
    text: "Поняла! Я нашла для вас товар `Добрынинский птичка` и пару других тортов, которые вас могли бы заинтересовать. Кстати, если хотите скидку, напишите `хочу скидку`)",
    products: cakeProducts,
  },
  {
    text: "Хорошо, если вы хотите скидку, то я вам предлагаю взять по скидке еще товар для торта. Например: `Сок`, он отлично дополнит праздничную атмосферу 🎉",
    products: juiceProducts,
  },
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentResponseIndex, setCurrentResponseIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send first bot message after opening
      setTimeout(() => {
        addBotMessage(0);
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (index: number) => {
    if (index >= botResponses.length) return;
    
    setIsTyping(true);
    
    setTimeout(() => {
      const response = botResponses[index];
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: response.text,
          isBot: true,
          products: response.products,
        },
      ]);
      setCurrentResponseIndex(index + 1);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: inputValue,
        isBot: false,
      },
    ]);
    setInputValue("");

    // Send next bot response
    if (currentResponseIndex < botResponses.length) {
      addBotMessage(currentResponseIndex);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary-hover text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 z-50 ${
          isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-6 right-6 w-[720px] h-[676px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-50 ${
          isOpen
            ? "scale-100 opacity-100"
            : "scale-0 opacity-0 pointer-events-none"
        }`}
        style={{ transformOrigin: "bottom right" }}
      >
        {/* Header */}
        <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src={botLogo} alt="Bot" className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Добрынинский</h3>
              <p className="text-xs text-white/80">Онлайн-помощница</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 bg-background chat-scrollbar">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              text={message.text}
              isBot={message.isBot}
              products={message.products}
            />
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-3">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Напишите сообщение..."
              className="flex-1 px-4 py-2.5 bg-muted rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatBot;

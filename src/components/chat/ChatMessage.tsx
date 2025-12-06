import MiniProductCard from "./MiniProductCard";

interface Product {
  name: string;
  price: number;
  image: string;
  discount?: number;
}

interface ChatMessageProps {
  text: string;
  isBot: boolean;
  products?: Product[];
}

const ChatMessage = ({ text, isBot, products }: ChatMessageProps) => {
  // Parse text to highlight words in backticks and format lists
  const parseText = (content: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Split by lines first
    const lines = content.split('\n');
    
    lines.forEach((line, lineIndex) => {
      // Check if line is a list item (starts with number followed by ) or .)
      const listMatch = line.match(/^(\d+)\)\s*(.*)$/);
      
      if (listMatch) {
        const [, number, rest] = listMatch;
        parts.push(
          <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1">
            <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium">
              {number}
            </span>
            <span className="flex-1">{parseInlineText(rest)}</span>
          </div>
        );
      } else if (line.trim()) {
        parts.push(
          <p key={`line-${lineIndex}`} className="mb-1">
            {parseInlineText(line)}
          </p>
        );
      }
    });
    
    return parts;
  };

  // Parse inline text for backtick highlights
  const parseInlineText = (text: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /`([^`]+)`/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add highlighted text
      parts.push(
        <span
          key={match.index}
          className="bg-primary/15 text-primary font-medium px-1.5 py-0.5 rounded"
        >
          {match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      <div className={`max-w-[85%] ${isBot ? 'order-2' : 'order-1'}`}>
        {isBot && (
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🍰</span>
            </div>
            <span className="text-xs text-muted-foreground font-medium">Помощница Добрынинского</span>
          </div>
        )}
        
        <div
          className={`rounded-2xl px-4 py-3 ${
            isBot
              ? 'bg-muted text-foreground rounded-tl-sm'
              : 'bg-primary text-white rounded-tr-sm'
          }`}
        >
          <div className="text-sm leading-relaxed">
            {parseText(text)}
          </div>
        </div>

        {/* Products carousel */}
        {products && products.length > 0 && (
          <div className="mt-2 -mx-1">
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
              {products.map((product, index) => (
                <MiniProductCard
                  key={index}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  discount={product.discount}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

// Chat API service for Order Bot integration

const API_URL = "https://api.forecasto.ru/llm-chat/chat";
const USER_ID_COOKIE = "order_bot_user_id";
const CHAT_HISTORY_KEY = "order_bot_chat_history";

export interface ApiProduct {
  ItemID: string;
  ItemName: string;
  ItemPrice: string;
  ItemUrl: string;
}

export interface ChatApiResponse {
  UserID: number;
  Message: string;
  Items: ApiProduct[] | null;
  IsSale: boolean;
}

export interface ChatMessage {
  id: number;
  text: string;
  isBot: boolean;
  products?: Array<{
    name: string;
    price: number;
    image: string;
    url: string;
    discount?: number;
  }>;
}

// Generate random 9-digit user ID
function generateUserId(): number {
  return Math.floor(100000000 + Math.random() * 900000000);
}

// Get or create user ID from cookies
export function getUserId(): number {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === USER_ID_COOKIE) {
      return parseInt(value, 10);
    }
  }
  
  // Generate new ID and save to cookie (1 year expiry)
  const newId = generateUserId();
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  document.cookie = `${USER_ID_COOKIE}=${newId}; expires=${expiryDate.toUTCString()}; path=/`;
  
  return newId;
}

// Extract product image from product page URL
export async function fetchProductImage(productUrl: string): Promise<string> {
  try {
    const response = await fetch(productUrl);
    const html = await response.text();
    
    // Extract image from fancybox-prev link's img src or href
    // Pattern: <a href="..." class="fancybox-prev"><img src="...">
    const fancyboxMatch = html.match(/class="fancybox-prev"[^>]*><img[^>]*src="([^"]+)"/i);
    if (fancyboxMatch && fancyboxMatch[1]) {
      return fancyboxMatch[1];
    }
    
    // Alternative: get href from fancybox-prev link
    const hrefMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*class="fancybox-prev"/i);
    if (hrefMatch && hrefMatch[1]) {
      return hrefMatch[1];
    }
    
    // Fallback placeholder
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200";
  } catch {
    // Return placeholder on error (CORS issues expected)
    return "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200";
  }
}

// Send message to chat API
export async function sendChatMessage(message: string): Promise<ChatApiResponse> {
  const userId = getUserId();
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserID: userId,
      Message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Save chat history to localStorage
export function saveChatHistory(messages: ChatMessage[]): void {
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
}

// Load chat history from localStorage
export function loadChatHistory(): ChatMessage[] {
  const saved = localStorage.getItem(CHAT_HISTORY_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
}

// Clear chat history
export function clearChatHistory(): void {
  localStorage.removeItem(CHAT_HISTORY_KEY);
}

// Transform API response to chat message format
export function transformApiProducts(
  items: ApiProduct[] | null,
  isSale: boolean
): ChatMessage["products"] {
  if (!items || items.length === 0) return undefined;
  
  return items.map((item) => ({
    name: item.ItemName,
    price: parseFloat(item.ItemPrice),
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200", // Placeholder, will be replaced
    url: item.ItemUrl,
    discount: isSale ? 5 : undefined,
  }));
}

import { ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui-custom";
import { Button } from "@/components/ui-custom";

interface MenuCardProps {
  product: {
    id: number;
    name: string;
    description: string | null;
    basePrice: string | number;
    category: string;
    imageUrl: string | null;
  };
}

export function MenuCard({ product }: MenuCardProps) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-foreground shadow-sm backdrop-blur-md">
            {product.category}
          </Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <span className="text-lg font-bold text-primary">
            ${typeof product.basePrice === "string" ? parseFloat(product.basePrice).toFixed(2) : product.basePrice.toFixed(2)}
          </span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
          {product.description || "Delicious item from our menu"}
        </p>
        <Button className="w-full font-bold group-hover:bg-primary group-hover:text-white transition-colors">
          Add to Order <ShoppingBag className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}


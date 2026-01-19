import { useActiveMenu } from "@/hooks/use-foodhub";
import { Card, Button, Badge } from "@/components/ui-custom";
import { Link } from "wouter";
import { ShoppingBag, Star } from "lucide-react";

export default function PublicMenu() {
  const { data: products, isLoading } = useActiveMenu();
  
  const now = new Date();
  const hours = now.getHours();
  let timeLabel = "Open Now";
  
  if (hours >= 5 && hours < 11) timeLabel = "Open Now • Serving Breakfast";
  else if (hours >= 11 && hours < 16) timeLabel = "Open Now • Serving Lunch";
  else if (hours >= 16 && hours < 22) timeLabel = "Open Now • Serving Dinner";
  else timeLabel = "Closed • Opening Soon";

  // Group by category
  const categories = Array.from(new Set(products?.map(p => p.category) || []));

  return (
    <div className="min-h-screen bg-background font-body pb-20">
      {/* Hero Banner */}
      <div className="relative h-[40vh] bg-primary flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        {/* Unsplash image: restaurant interior dark moody */}
        <div className="relative z-10 text-center text-white space-y-4 p-4">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md mb-2">{timeLabel}</Badge>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tighter drop-shadow-xl">
            FoodHub<span className="text-red-300">.</span>
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-90 max-w-lg mx-auto">
            Fresh ingredients. Bold flavors. Unforgettable experiences.
          </p>
          <div className="pt-4">
             <Link href="/login">
               <Button variant="secondary" className="font-bold">Staff Login</Button>
             </Link>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <h2 className="text-2xl font-bold font-display">Our Menu</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
              <Button variant="primary" size="sm" className="rounded-full">All</Button>
              {categories.map(cat => (
                <Button key={cat} variant="ghost" size="sm" className="rounded-full bg-muted/50 hover:bg-muted whitespace-nowrap">
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-80 bg-muted/20 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products?.map(product => (
                <MenuCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuCard({ product }: { product: any }) {
  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-border/50">
      <div className="aspect-[4/3] overflow-hidden relative">
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80"} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-white/90 text-foreground shadow-sm backdrop-blur-md">{product.category}</Badge>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold font-display group-hover:text-primary transition-colors">{product.name}</h3>
          <span className="text-lg font-bold text-primary">${product.basePrice}</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-6">{product.description}</p>
        <Button className="w-full font-bold group-hover:bg-primary group-hover:text-white transition-colors">
          Add to Order <ShoppingBag className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

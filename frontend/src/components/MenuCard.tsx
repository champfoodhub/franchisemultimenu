import React from 'react';

interface MenuCardProps {
  name: string;
  price: number;
  category?: string;
  stock?: number;
  discount?: number;
  isActive?: boolean;
  onEditStock?: () => void;
  onEditDiscount?: () => void;
  isOutOfStock?: boolean;
}

const MenuCard: React.FC<MenuCardProps> = ({
  name,
  price,
  category,
  stock,
  discount = 0,
  isActive = true,
  onEditStock,
  onEditDiscount,
  isOutOfStock = false,
}) => {
  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
        isOutOfStock ? 'opacity-60' : 'hover:shadow-lg'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{name}</h3>
            {category && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                {category}
              </span>
            )}
          </div>
          {isOutOfStock && (
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-3">
          {discount > 0 ? (
            <>
              <span className="text-gray-400 line-through text-sm">${price.toFixed(2)}</span>
              <span className="text-red-600 font-bold text-xl">${discountedPrice.toFixed(2)}</span>
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">
                {discount}% OFF
              </span>
            </>
          ) : (
            <span className="text-red-600 font-bold text-xl">${price.toFixed(2)}</span>
          )}
        </div>

        {/* Stock Info */}
        {stock !== undefined && (
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm ${stock === 0 ? 'text-red-600' : 'text-gray-600'}`}>
              Stock: {stock}
            </span>
            {stock === 0 && (
              <span className="text-xs text-red-600 font-medium">Restock needed</span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {(onEditStock || onEditDiscount) && !isOutOfStock && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            {onEditStock && (
              <button
                onClick={onEditStock}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2 rounded text-sm transition-colors"
              >
                Update Stock
              </button>
            )}
            {onEditDiscount && (
              <button
                onClick={onEditDiscount}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1.5 px-2 rounded text-sm transition-colors"
              >
                Set Discount
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuCard;


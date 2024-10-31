import React from 'react';

import { type Cart, type Product } from '@/api/carts/types';
import { Image, Text, TouchableOpacity, View } from '@/ui';

const DEFAULT_TO_FIXED = 2;

const CartItem = ({ cart }: { cart: Cart }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <View className="m-2 rounded-lg bg-white shadow-sm">
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between border-b border-gray-200 p-4"
      >
        <View>
          <Text className="text-lg font-bold">Cart #{cart.id}</Text>
          <Text className="text-gray-600">User ID: {cart.userId}</Text>
        </View>
        <View>
          <Text className="text-right font-bold text-green-600">
            ${cart.discountedTotal.toFixed(DEFAULT_TO_FIXED)}
          </Text>
          <Text className="text-right text-sm text-gray-500 line-through">
            ${cart.total.toFixed(DEFAULT_TO_FIXED)}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Products List (Expandable) */}
      {expanded && (
        <View className="p-4">
          <View className="mb-2 flex-row justify-between">
            <Text className="text-gray-600">{cart.totalProducts} Products</Text>
            <Text className="text-gray-600">
              Total Qty: {cart.totalQuantity}
            </Text>
          </View>

          {cart.products.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </View>
      )}
    </View>
  );
};

const ProductRow = ({ product }: { product: Product }) => (
  <View className="flex-row items-center border-t border-gray-100 py-2">
    <Image
      source={{ uri: product.thumbnail }}
      className="h-16 w-16 rounded"
      resizeMode="cover"
    />
    <View className="ml-4 flex-1">
      <Text className="font-medium">{product.title}</Text>
      <Text className="text-sm text-gray-600">Qty: {product.quantity}</Text>
      <View className="mt-1 flex-row items-center justify-between">
        <View>
          <Text className="font-bold text-green-600">
            ${product.discountedTotal.toFixed(DEFAULT_TO_FIXED)}
          </Text>
          <Text className="text-sm text-gray-500 line-through">
            ${product.total.toFixed(DEFAULT_TO_FIXED)}
          </Text>
        </View>
        <Text className="text-sm text-red-500">
          -{product.discountPercentage}%
        </Text>
      </View>
    </View>
  </View>
);

export default CartItem;

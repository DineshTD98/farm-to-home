export const productData = {
  Vegetables: [
    'Tomato', 'Potato', 'Onion', 'Carrot', 'Beetroot', 'Cabbage', 'Cauliflower', 
    'Spinach', 'Lady\'s Finger', 'Brinjal', 'Drumstick', 'Pumpkin', 
    'Bitter Gourd', 'Snake Gourd', 'Ridge Gourd', 'Bottle Gourd', 
    'Green Chilli', 'Ginger', 'Garlic', 'Radish', 'Beans', 'Peas', 
    'Sweet Potato', 'Broccoli', 'Capsicum', 'Cucumber', 'Mushroom'
  ],
  Grains: [
    'Rice', 'Wheat', 'Ragi', 'Millet', 'Corn', 'Barley', 'Oats', 'Sorghum',
    'Green Gram', 'Black Gram', 'Red Gram', 'Chickpeas', 'Lentils', 'Horse Gram'
  ],
  Fruits: [
    'Mango', 'Banana', 'Apple', 'Orange', 'Watermelon', 'Papaya', 
    'Guava', 'Grapes', 'Pomegranate', 'Coconut', 'Lemon', 'Jackfruit'
  ],
  Others: [
    'Honey', 'Jaggery', 'Ghee', 'Turmeric', 'Black Pepper', 'Cardamom',
    'Cloves', 'Cinnamon', 'Coconut Oil', 'Milk', 'Egg', 'Pickle'
  ]
};

export const getCategoryByProduct = (productName) => {
  for (const [category, products] of Object.entries(productData)) {
    if (products.includes(productName)) return category;
  }
  return 'Others';
};

export const getAllProducts = () => {
  return productData;
};

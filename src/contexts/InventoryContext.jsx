import { createContext, useContext, useState, useEffect } from "react";

const InventoryContext = createContext();

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    console.warn("useInventory must be used within an InventoryProvider");
    return {
      products: [],
      settings: {},
      getLowStockProducts: () => [],
      getCriticalStockProducts: () => [],
      getExpiringProducts: () => [],
      getCriticalExpiryProducts: () => [],
      getExpiredProducts: () => [],
      getDaysUntilExpiry: () => 0,
      addProduct: () => { },
      updateProduct: () => { },
      deleteProduct: () => { },
      lowStockCount: 0,
      criticalStockCount: 0,
      expiringProductsCount: 0,
      criticalExpiryCount: 0,
      expiredProductsCount: 0
    };
  }
  return context;
};

export const InventoryProvider = ({ children }) => {
  // Global products state - 100 diverse inventory items
  const [products, setProducts] = useState([
    // Electronics (20 items)
    { id: 1, name: "Laptop", stock: 15, unit: "pieces", category: "Electronics", expiryDate: null, price: 899.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 2, name: "Desktop Computer", stock: 8, unit: "pieces", category: "Electronics", expiryDate: null, price: 1299.99, image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=300&h=300&fit=crop" },
    { id: 3, name: "Keyboard", stock: 45, unit: "pieces", category: "Electronics", expiryDate: null, price: 79.99, image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=300&h=300&fit=crop" },
    { id: 4, name: "Mouse", stock: 3, unit: "pieces", category: "Electronics", expiryDate: null, price: 29.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300&h=300&fit=crop" }, // Critical stock
    { id: 5, name: "Monitor 24 inch", stock: 12, unit: "pieces", category: "Electronics", expiryDate: null, price: 249.99, image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1120&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 6, name: "Printer", stock: 6, unit: "pieces", category: "Electronics", expiryDate: null, price: 199.99, image: "https://images.unsplash.com/photo-1708793699492-5fa208f52dcb?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, // Low stock
    { id: 7, name: "Scanner", stock: 4, unit: "pieces", category: "Electronics", expiryDate: null, price: 149.99, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop" }, // Low stock
    { id: 8, name: "Webcam", stock: 25, unit: "pieces", category: "Electronics", expiryDate: null, price: 89.99, image: "https://images.unsplash.com/photo-1623949556303-b0d17d198863?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 9, name: "Headphones", stock: 30, unit: "pieces", category: "Electronics", expiryDate: null, price: 129.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop" },
    { id: 10, name: "Speakers", stock: 18, unit: "pieces", category: "Electronics", expiryDate: null, price: 159.99, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop" },
    { id: 11, name: "Tablet", stock: 9, unit: "pieces", category: "Electronics", expiryDate: null, price: 399.99, image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop" }, // Low stock
    { id: 12, name: "Smartphone", stock: 20, unit: "pieces", category: "Electronics", expiryDate: null, price: 699.99, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop" },
    { id: 13, name: "Router", stock: 14, unit: "pieces", category: "Electronics", expiryDate: null, price: 119.99, image: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 14, name: "USB Cable", stock: 85, unit: "pieces", category: "Electronics", expiryDate: null, price: 12.99, image: "https://images.unsplash.com/photo-1657181253444-66c4745d5a86?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 15, name: "Power Bank", stock: 35, unit: "pieces", category: "Electronics", expiryDate: null, price: 49.99, image: "https://images.unsplash.com/photo-1585995603413-eb35b5f4a50b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 16, name: "Hard Drive 1TB", stock: 16, unit: "pieces", category: "Electronics", expiryDate: null, price: 89.99, image: "https://images.unsplash.com/photo-1593642634315-48f5414c3ad9?w=300&h=300&fit=crop" },
    { id: 17, name: "SSD 500GB", stock: 20, unit: "pieces", category: "Electronics", expiryDate: null, price: 129.99, image: "https://images.unsplash.com/photo-1747567848251-91936bafefef?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U1NEJTIwNTAwR0J8ZW58MHx8MHx8fDA%3D" },
    { id: 18, name: "Plus Box", stock: 28, unit: "pieces", category: "Electronics", expiryDate: null, price: 39.99, image: "https://plus.unsplash.com/premium_photo-1683309565422-77818a287060?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 19, name: "Graphics Card", stock: 5, unit: "pieces", category: "Electronics", expiryDate: null, price: 599.99, image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, // Low stock
    { id: 20, name: "Motherboard", stock: 7, unit: "pieces", category: "Electronics", expiryDate: null, price: 299.99, image: "https://plus.unsplash.com/premium_photo-1681426669771-d2113672a49b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, // Low stock

    // Fruits (15 items)
    { id: 21, name: "Apples", stock: 45, unit: "kg", category: "Fruits", expiryDate: "2024-12-28", price: 3.99, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop" },
    { id: 22, name: "Bananas", stock: 30, unit: "kg", category: "Fruits", expiryDate: "2024-12-25", price: 2.49, image: "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300&h=300&fit=crop" },
    { id: 23, name: "Oranges", stock: 25, unit: "kg", category: "Fruits", expiryDate: "2024-12-30", price: 4.99, image: "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop" },
    { id: 24, name: "Grapes", stock: 8, unit: "kg", category: "Fruits", expiryDate: "2024-12-24", price: 6.99, image: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&h=300&fit=crop" }, // Low stock, expires soon
    { id: 25, name: "Strawberries", stock: 12, unit: "kg", category: "Fruits", expiryDate: "2024-12-23", price: 8.99, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop" },
    { id: 26, name: "Mangoes", stock: 18, unit: "kg", category: "Fruits", expiryDate: "2024-12-26", price: 5.99, image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&h=300&fit=crop" },
    { id: 27, name: "Pineapples", stock: 15, unit: "pieces", category: "Fruits", expiryDate: "2025-01-05", price: 4.99, image: "https://images.unsplash.com/photo-1490885578174-acda8905c2c6?w=300&h=300&fit=crop" },
    { id: 28, name: "Watermelons", stock: 10, unit: "pieces", category: "Fruits", expiryDate: "2025-01-02", price: 12.99, image: "https://images.unsplash.com/photo-1655558132692-7eee4e77182b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8V2F0ZXJtZWxvbnN8ZW58MHx8MHx8fDA%3D" },
    { id: 29, name: "Lemons", stock: 22, unit: "kg", category: "Fruits", expiryDate: "2025-01-10", price: 3.49, image: "https://images.unsplash.com/photo-1590502593747-42a996133562?w=300&h=300&fit=crop" },
    { id: 30, name: "Avocados", stock: 14, unit: "pieces", category: "Fruits", expiryDate: "2024-12-27", price: 1.99, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop" },
    { id: 31, name: "Kiwis", stock: 16, unit: "kg", category: "Fruits", expiryDate: "2025-01-08", price: 7.99, image: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=300&h=300&fit=crop" },
    { id: 32, name: "Peaches", stock: 9, unit: "kg", category: "Fruits", expiryDate: "2024-12-26", price: 6.49, image: "https://images.unsplash.com/photo-1639588473831-dd9d014646ae?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, // Low stock
    { id: 33, name: "Plums", stock: 11, unit: "kg", category: "Fruits", expiryDate: "2024-12-29", price: 5.49, image: "https://images.unsplash.com/photo-1564750497011-ead0ce4b9448?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UGx1bXN8ZW58MHx8MHx8fDA%3D" },
    { id: 34, name: "Cherries", stock: 6, unit: "kg", category: "Fruits", expiryDate: "2024-12-24", price: 12.99, image: "https://plus.unsplash.com/premium_photo-1688671923138-ff74e0f9a810?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2hlcnJpZXN8ZW58MHx8MHx8fDA%3D" }, // Low stock
    { id: 35, name: "Pomegranates", stock: 13, unit: "pieces", category: "Fruits", expiryDate: "2025-01-15", price: 3.99, image: "https://media.istockphoto.com/id/1320186788/photo/pomegranate.webp?a=1&b=1&s=612x612&w=0&k=20&c=jex4B70Q2rHvSKN8Jt0sLIRHEoqqAljMxxYoh3_mT9k=" },

    // Vegetables (15 items)
    { id: 36, name: "Tomatoes", stock: 35, unit: "kg", category: "Vegetables", expiryDate: "2024-12-26", price: 4.49, image: "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VG9tYXRvZXN8ZW58MHx8MHx8fDA%3D" },
    { id: 37, name: "Potatoes", stock: 80, unit: "kg", category: "Vegetables", expiryDate: "2025-02-15", price: 2.99, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=300&fit=crop" },
    { id: 38, name: "Onions", stock: 60, unit: "kg", category: "Vegetables", expiryDate: "2025-01-30", price: 3.49, image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8T25pb25zfGVufDB8fDB8fHww" },
    { id: 39, name: "Carrots", stock: 25, unit: "kg", category: "Vegetables", expiryDate: "2025-01-20", price: 3.99, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop" },
    { id: 40, name: "Broccoli", stock: 18, unit: "kg", category: "Vegetables", expiryDate: "2024-12-25", price: 5.99, image: "https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8QnJvY2NvbGl8ZW58MHx8MHx8fDA%3D" },
    { id: 41, name: "Spinach", stock: 12, unit: "kg", category: "Vegetables", expiryDate: "2024-12-24", price: 6.99, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U3BpbmFjaHxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 42, name: "Lettuce", stock: 20, unit: "pieces", category: "Vegetables", expiryDate: "2024-12-26", price: 2.49, image: "https://images.unsplash.com/photo-1515356956468-873dd257f911?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 43, name: "Cucumbers", stock: 28, unit: "kg", category: "Vegetables", expiryDate: "2024-12-28", price: 3.99, image: "https://images.unsplash.com/photo-1604977042946-1eecc30f269e?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 44, name: "Bell Peppers", stock: 15, unit: "kg", category: "Vegetables", expiryDate: "2024-12-27", price: 7.99, image: "https://images.unsplash.com/photo-1621953723422-6023013f659d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QmVsbCUyMFBlcHBlcnN8ZW58MHx8MHx8fDA%3D" },
    { id: 45, name: "Cauliflower", stock: 14, unit: "pieces", category: "Vegetables", expiryDate: "2024-12-29", price: 4.99, image: "https://media.istockphoto.com/id/182240577/photo/bin-of-cauliflower-heads.webp?a=1&b=1&s=612x612&w=0&k=20&c=LsO82lZblJqimkOLmrcHpaAa2QgNgKbZ-UfTAcpzAdQ=" },
    { id: 46, name: "Cabbage", stock: 22, unit: "pieces", category: "Vegetables", expiryDate: "2025-01-05", price: 3.49, image: "https://media.istockphoto.com/id/452097125/photo/woman-cuts-cabbage-on-cutting-board-in-kitchen.webp?a=1&b=1&s=612x612&w=0&k=20&c=RCTVcrgOf5BhulkGIHC1PF31brCmQwcE2BYLheQrAMQ=" },
    { id: 47, name: "Green Beans", stock: 16, unit: "kg", category: "Vegetables", expiryDate: "2024-12-27", price: 5.49, image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8R3JlZW4lMjBCZWFuc3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 48, name: "Corn", stock: 30, unit: "pieces", category: "Vegetables", expiryDate: "2024-12-30", price: 1.99, image: "https://images.unsplash.com/photo-1634467524884-897d0af5e104?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q29ybnxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 49, name: "Mushrooms", stock: 8, unit: "kg", category: "Vegetables", expiryDate: "2024-12-25", price: 8.99, image: "https://media.istockphoto.com/id/636524502/photo/fresh-common-mushroom-for-sale.webp?a=1&b=1&s=612x612&w=0&k=20&c=h9_qgsCiYUXE17jjQXYErHuPsH21JqtfQgb9hrzobSM=" }, // Low stock
    { id: 50, name: "Garlic", stock: 25, unit: "kg", category: "Vegetables", expiryDate: "2025-03-01", price: 9.99, image: "https://plus.unsplash.com/premium_photo-1675731118551-79b3da05a5d4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8R2FybGljfGVufDB8fDB8fHww" },

    // Dairy (10 items)
    { id: 51, name: "Whole Milk", stock: 40, unit: "liters", category: "Dairy", expiryDate: "2024-12-26", price: 3.99, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop" },
    { id: 52, name: "Skim Milk", stock: 25, unit: "liters", category: "Dairy", expiryDate: "2024-12-25", price: 4.49, image: "https://images.unsplash.com/photo-1669561644516-6171c15fda8e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2tpbSUyME1pbGt8ZW58MHx8MHx8fDA%3D" },
    { id: 53, name: "Cheese Slices", stock: 30, unit: "packets", category: "Dairy", expiryDate: "2025-01-15", price: 5.99, image: "https://media.istockphoto.com/id/1369973042/photo/swiss-hard-cheese-piece-in-wooden-tray-black-background-top-view.webp?a=1&b=1&s=612x612&w=0&k=20&c=b4G0kwTjCob_1xm061Rkcz08zNiFmajwPkriqvWe-7Q=" },
    { id: 54, name: "Butter", stock: 18, unit: "packets", category: "Dairy", expiryDate: "2025-01-20", price: 4.99, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnV0dGVyfGVufDB8fDB8fHww" },
    { id: 55, name: "Yogurt", stock: 35, unit: "cups", category: "Dairy", expiryDate: "2024-12-28", price: 1.99, image: "https://media.istockphoto.com/id/1217972775/photo/female-chef-mixing-yogurt-in-a-bowl.webp?a=1&b=1&s=612x612&w=0&k=20&c=QIZdxpaQdoZN_ObdOxzLzvjqQGfF209XjHy4YXzZtoY=" },
    { id: 56, name: "Cream", stock: 12, unit: "liters", category: "Dairy", expiryDate: "2024-12-27", price: 6.99, image: "https://plus.unsplash.com/premium_photo-1664391870099-a7d4976fd8e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8eW91Z3VydCUyMENyZWFtfGVufDB8fDB8fHww" },
    { id: 57, name: "Cottage Cheese", stock: 15, unit: "containers", category: "Dairy", expiryDate: "2025-01-02", price: 3.99, image: "https://media.istockphoto.com/id/1183707972/photo/paneer-cottage-cheese-close-up.webp?a=1&b=1&s=612x612&w=0&k=20&c=JS5DQNi9_Fi0gYCM_gLa6afnxJGnghbvK-wC28Ql3iM= " },
    { id: 58, name: "Eggs", stock: 60, unit: "dozen", category: "Dairy", expiryDate: "2025-01-10", price: 4.99, image: "https://images.unsplash.com/photo-1586802990181-a5771596eaea?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8RWdnc3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 59, name: "Ice Cream", stock: 22, unit: "containers", category: "Dairy", expiryDate: "2025-03-15", price: 7.99, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop" },
    { id: 60, name: "Sour Cream", stock: 14, unit: "containers", category: "Dairy", expiryDate: "2025-01-05", price: 3.49, image: "https://images.unsplash.com/photo-1605883709265-3cc8ca6b3a3c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

    // Bakery (10 items)
    { id: 61, name: "White Bread", stock: 25, unit: "loaves", category: "Bakery", expiryDate: "2024-12-24", price: 2.99, image: "https://images.unsplash.com/photo-1600102186542-82cbd5e7bdb4?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8V2hpdGUlMjBCcmVhZHxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 62, name: "Whole Wheat Bread", stock: 20, unit: "loaves", category: "Bakery", expiryDate: "2024-12-25", price: 3.49, image: "https://images.unsplash.com/photo-1537200275355-4f0c0714f777?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8V2hvbGUlMjBXaGVhdCUyMEJyZWFkfGVufDB8fDB8fHww" },
    { id: 63, name: "Croissants", stock: 18, unit: "pieces", category: "Bakery", expiryDate: "2024-12-23", price: 1.99, image: "https://images.unsplash.com/photo-1623334044303-241021148842?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q3JvaXNzYW50c3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 64, name: "Bagels", stock: 30, unit: "pieces", category: "Bakery", expiryDate: "2024-12-26", price: 1.49, image: "https://plus.unsplash.com/premium_photo-1720070416636-0e5ef67d3862?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QmFnZWxzfGVufDB8fDB8fHww" },
    { id: 65, name: "Muffins", stock: 24, unit: "pieces", category: "Bakery", expiryDate: "2024-12-25", price: 2.49, image: "https://images.unsplash.com/photo-1585665187093-a3511c2fe57a?q=80&w=976&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { id: 66, name: "Donuts", stock: 36, unit: "pieces", category: "Bakery", expiryDate: "2024-12-24", price: 1.99, image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RG9udXRzfGVufDB8fDB8fHww" },
    { id: 67, name: "Cookies", stock: 45, unit: "packets", category: "Bakery", expiryDate: "2025-02-01", price: 4.99, image: "https://images.unsplash.com/photo-1590080874088-eec64895b423?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q29va2llc3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 68, name: "Cake", stock: 8, unit: "pieces", category: "Bakery", expiryDate: "2024-12-26", price: 24.99, image: "https://media.istockphoto.com/id/2157936579/photo/cheery-cake.webp?a=1&b=1&s=612x612&w=0&k=20&c=20cpyeUEZ-o9JnRxp7vrwCtJrgH1-Q8EpQwNhCwCNRM=" }, // Low stock
    { id: 69, name: "Pastries", stock: 15, unit: "pieces", category: "Bakery", expiryDate: "2024-12-25", price: 3.99, image: "https://images.unsplash.com/photo-1622941367239-8acd68fa946d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8UGFzdHJpZXN8ZW58MHx8MHx8fDA%3D" },
    { id: 70, name: "Pizza Dough", stock: 12, unit: "packets", category: "Bakery", expiryDate: "2024-12-28", price: 2.99, image: "https://plus.unsplash.com/premium_photo-1673439301651-dcf7fccec4d6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8UGl6emElMjBEb3VnaHxlbnwwfHwwfHx8MA%3D%3D" },

    // Grains (10 items)
    { id: 71, name: "White Rice", stock: 150, unit: "kg", category: "Grains", expiryDate: "2025-12-01", price: 2.49, image: "https://images.unsplash.com/photo-1686820740687-426a7b9b2043?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8V2hpdGUlMjBSaWNlfGVufDB8fDB8fHww" },
    { id: 72, name: "Brown Rice", stock: 80, unit: "kg", category: "Grains", expiryDate: "2025-10-15", price: 3.49, image: "https://media.istockphoto.com/id/173589620/photo/brown-rice.webp?a=1&b=1&s=612x612&w=0&k=20&c=RAqRmUjUztvQZKs2xS9QOFWTdZNTDbSytotZRgSdrCc=" },
    { id: 73, name: "Wheat Flour", stock: 120, unit: "kg", category: "Grains", expiryDate: "2025-08-20", price: 1.99, image: "https://plus.unsplash.com/premium_photo-1663851784707-a49e85c2361f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8V2hlYXQlMjBGbG91cnxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 74, name: "Oats", stock: 60, unit: "kg", category: "Grains", expiryDate: "2025-09-10", price: 4.99, image: "https://images.unsplash.com/photo-1614961233913-a5113a4a34ed?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8T2F0c3xlbnwwfHwwfHx8MA%3D%3D" },
    { id: 75, name: "Quinoa", stock: 25, unit: "kg", category: "Grains", expiryDate: "2025-11-05", price: 8.99, image: "https://plus.unsplash.com/premium_photo-1705207702015-0c1f567a14df?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UXVpbm9hfGVufDB8fDB8fHww" },
    { id: 76, name: "Barley", stock: 40, unit: "kg", category: "Grains", expiryDate: "2025-10-01", price: 3.99, image: "https://plus.unsplash.com/premium_photo-1705404738459-c4cb25ad7933?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QmFybGV5fGVufDB8fDB8fHww" },
    { id: 77, name: "Pasta", stock: 85, unit: "packets", category: "Grains", expiryDate: "2025-06-15", price: 2.99, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UGFzdGF8ZW58MHx8MHx8fDA%3D" },
    { id: 78, name: "Noodles", stock: 70, unit: "packets", category: "Grains", expiryDate: "2025-07-20", price: 1.99, image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=300&h=300&fit=crop" },
    { id: 79, name: "Cereal", stock: 45, unit: "boxes", category: "Grains", expiryDate: "2025-05-30", price: 5.99, image: "https://images.unsplash.com/photo-1504308805006-0f7a5f1f0f71?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2VyZWFsfGVufDB8fDB8fHww" },
    { id: 80, name: "Bread Crumbs", stock: 30, unit: "packets", category: "Grains", expiryDate: "2025-04-15", price: 2.49, image: "https://images.unsplash.com/photo-1618766249828-3bcc5a3ec158?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8QnJlYWQlMjBDcnVtYnN8ZW58MHx8MHx8fDA%3D" },

    // Meat (10 items)
    { id: 81, name: "Chicken Breast", stock: 25, unit: "kg", category: "Meat", expiryDate: "2024-12-25", price: 12.99, image: "https://images.unsplash.com/photo-1633096013004-e2cb4023b560?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q2hpY2tlbiUyMEJyZWFzdHxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 82, name: "Ground Beef", stock: 20, unit: "kg", category: "Meat", expiryDate: "2024-12-24", price: 15.99, image: "https://images.unsplash.com/photo-1448907503123-67254d59ca4f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8R3JvdW5kJTIwQmVlZnxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 83, name: "Pork Chops", stock: 15, unit: "kg", category: "Meat", expiryDate: "2024-12-26", price: 14.99, image: "https://media.istockphoto.com/id/1143816283/photo/homemade-barbecue-pork-chops.webp?a=1&b=1&s=612x612&w=0&k=20&c=WaP-PM0k-aKR4knyb7WKuBnAF2YGiYZcVGaO4xxcLzE=" },
    { id: 84, name: "Salmon Fillet", stock: 12, unit: "kg", category: "Meat", expiryDate: "2024-12-23", price: 24.99, image: "https://media.istockphoto.com/id/1207107546/photo/salmon-raw-trout-red-fish-steak-with-ingredients-for-cooking-cooking-salmon-sea-food-healthy.webp?a=1&b=1&s=612x612&w=0&k=20&c=HEEn2OU-H4yTJS3RKZCV2q0IwamQQONofsqFZo9-Huw=" },
    { id: 85, name: "Shrimp", stock: 8, unit: "kg", category: "Meat", expiryDate: "2024-12-24", price: 19.99, image: "https://plus.unsplash.com/premium_photo-1709146097755-f5f9ba107de8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U2hyaW1wfGVufDB8fDB8fHww" }, // Low stock
    { id: 86, name: "Turkey Slices", stock: 18, unit: "packets", category: "Meat", expiryDate: "2024-12-28", price: 8.99, image: "https://media.istockphoto.com/id/184874640/photo/roasted-turkey.webp?a=1&b=1&s=612x612&w=0&k=20&c=nvgl3hc7NGcl_W3_GuLxgqWBeerwKc25lFlgTFgg3R8=" },
    { id: 87, name: "Ham", stock: 14, unit: "kg", category: "Meat", expiryDate: "2024-12-30", price: 18.99, image: "https://images.unsplash.com/photo-1672055826545-d7dcc36cc223?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8SGFtfGVufDB8fDB8fHww" },
    { id: 88, name: "Bacon", stock: 22, unit: "packets", category: "Meat", expiryDate: "2025-01-05", price: 7.99, image: "https://plus.unsplash.com/premium_photo-1693086421131-c0cb5a3bada3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHhzZWFyY2h8NXx8YmFjb258ZW58MHx8MHx8fDA%3D" },
    { id: 89, name: "Sausages", stock: 16, unit: "packets", category: "Meat", expiryDate: "2024-12-27", price: 6.99, image: "https://images.unsplash.com/photo-1585325701165-351af916e581?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2F1c2FnZXN8ZW58MHx8MHx8fDA%3D" },
    { id: 90, name: "Tuna Cans", stock: 50, unit: "cans", category: "Meat", expiryDate: "2026-03-15", price: 3.99, image: "https://media.istockphoto.com/id/464397470/photo/tuna-can.webp?a=1&b=1&s=612x612&w=0&k=20&c=unrnPm7bzJZea_4B4Qevd_khPektSrjwLneRCnSCEkk=" },

    // Beverages (10 items)
    { id: 91, name: "Orange Juice", stock: 30, unit: "liters", category: "Beverages", expiryDate: "2024-12-28", price: 4.99, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop" },
    { id: 92, name: "Apple Juice", stock: 25, unit: "liters", category: "Beverages", expiryDate: "2024-12-30", price: 4.49, image: "https://images.unsplash.com/photo-1626120032630-b51c96a544f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QXBwbGUlMjBKdWljZXxlbnwwfHwwfHx8MA%3D%3D" },
    { id: 93, name: "Coca Cola", stock: 60, unit: "cans", category: "Beverages", expiryDate: "2025-06-15", price: 1.99, image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Q29jYSUyMENvbGF8ZW58MHx8MHx8fDA%3D" },
    { id: 94, name: "Pepsi", stock: 55, unit: "cans", category: "Beverages", expiryDate: "2025-07-20", price: 1.99, image: "https://images.unsplash.com/photo-1629203849820-fdd70d49c38e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGVwc2l8ZW58MHx8MHx8fDA%3D" },
    { id: 95, name: "Water Bottles", stock: 120, unit: "bottles", category: "Beverages", expiryDate: "2025-12-31", price: 0.99, image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8V2F0ZXIlMjBCb3R0bGVzfGVufDB8fDB8fHww" },
    { id: 96, name: "Energy Drinks", stock: 40, unit: "cans", category: "Beverages", expiryDate: "2025-08-10", price: 2.99, image: "https://images.unsplash.com/photo-1560689189-65b6ed6228e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8RW5lcmd5JTIwRHJpbmtzfGVufDB8fDB8fHww" },
    { id: 97, name: "Coffee", stock: 35, unit: "packets", category: "Beverages", expiryDate: "2025-10-01", price: 8.99, image: "https://images.unsplash.com/photo-1666873903780-396269c73a54?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHhzZWFyY2h8M3x8JTIyQ29mZmVlfGVufDB8fDB8fHww" },
    { id: 98, name: "Tea Bags", stock: 80, unit: "boxes", category: "Beverages", expiryDate: "2025-11-15", price: 6.99, image: "https://media.istockphoto.com/id/182407842/photo/teabag-in-hot-water.webp?a=1&b=1&s=612x612&w=0&k=20&c=wki-VWBoxWAn3q2y2lN4yV79zp0_YUMXbiH0hYhp-6c=" },
    { id: 99, name: "Sports Drinks", stock: 45, unit: "bottles", category: "Beverages", expiryDate: "2025-09-05", price: 3.49, image: "https://images.unsplash.com/photo-1741520504868-2cd8f940f977?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U3BvcnRzJTIwRHJpbmtzfGVufDB8fDB8fHww" },
    { id: 100, name: "Smoothies", stock: 20, unit: "bottles", category: "Beverages", expiryDate: "2024-12-26", price: 5.99, image: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=300&h=300&fit=crop" }
  ]);

  // Global settings state
  const [settings, setSettings] = useState({
    lowStockThreshold: 10,
    expiryWarningDays: 7, // Warn when products expire within 7 days
    criticalExpiryDays: 3, // Critical alert when products expire within 3 days
    notifications: {
      lowStock: true,
      expiryWarning: true,
      newOrders: true,
      systemUpdates: false,
      email: true,
      sms: true,
      push: false
    },
    notificationContacts: {
      email: "admin@company.com",
      phone: "+1234567890"
    },
    companyName: "Inventory Management System",
    currency: "₹",
    backup: {
      autoBackup: true,
      backupFrequency: "daily"
    },
    userId: "admin-001"
  });

  // Calculate low stock metrics
  const getLowStockProducts = () => {
    const threshold = settings.lowStockThreshold;
    return products.filter(product => parseInt(product.stock) <= threshold);
  };

  const getCriticalStockProducts = () => {
    const threshold = settings.lowStockThreshold;
    const criticalThreshold = Math.floor(threshold / 2);
    return products.filter(product => parseInt(product.stock) <= criticalThreshold);
  };

  const lowStockCount = getLowStockProducts().length;
  const criticalStockCount = getCriticalStockProducts().length;

  // Expiry date utility functions
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };//calculate days until expiry

  const getExpiringProducts = () => {
    const warningDays = settings.expiryWarningDays;
    return products.filter(product => {
      if (!product.expiryDate) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
      return daysUntilExpiry !== null && daysUntilExpiry <= warningDays && daysUntilExpiry >= 0;
    });
  };//get products expiring within warning days

  const getCriticalExpiryProducts = () => {
    const criticalDays = settings.criticalExpiryDays;
    return products.filter(product => {
      if (!product.expiryDate) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
      return daysUntilExpiry !== null && daysUntilExpiry <= criticalDays && daysUntilExpiry >= 0;
    });
  };//get products expiring within crtical days

  const getExpiredProducts = () => {
    return products.filter(product => {
      if (!product.expiryDate) return false;
      const daysUntilExpiry = getDaysUntilExpiry(product.expiryDate);
      return daysUntilExpiry !== null && daysUntilExpiry < 0;
    });
  };//get already expired products

  const expiringProductsCount = getExpiringProducts().length;
  const criticalExpiryCount = getCriticalExpiryProducts().length;
  const expiredProductsCount = getExpiredProducts().length;

  // Functions to update products
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now() + Math.random()
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts(prev => prev.map(p =>
      p.id === id ? { ...p, ...updatedProduct } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Function to update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const value = {
    products,
    setProducts,
    settings,
    updateSettings,
    getLowStockProducts,
    getCriticalStockProducts,
    lowStockCount,
    criticalStockCount,
    // Expiry date functions
    getDaysUntilExpiry,
    getExpiringProducts,
    getCriticalExpiryProducts,
    getExpiredProducts,
    expiringProductsCount,
    criticalExpiryCount,
    expiredProductsCount,
    addProduct,
    updateProduct,
    deleteProduct
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

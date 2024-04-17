
const API_URL = "http://localhost:3000/api/v1";



const Apis = {
  GetUserLogin: `${API_URL}/auth/login`,
  GetProductById: `${API_URL}/api/product/getWebProductById?id=`,
  GetAllGroceryStaple: `${API_URL}/api/product/getAllGroceryStaple`,
  GetAllProductList: `${API_URL}/api/product/list/`,
  GetAllCategory: "https://jsonplaceholder.typicode.com/users",
};
export { API_URL, Apis };

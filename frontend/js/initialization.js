//Khoi tao danh sach san pham
async function createProduct() {
    try {
        // Gửi yêu cầu GET đến endpoint API để lấy danh sách sản phẩm
        const response = await fetch('http://localhost:3000/api/v1/products');
        
        // Kiểm tra nếu yêu cầu thành công (status code 200)
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        // Chuyển đổi dữ liệu nhận được sang định dạng JSON
        const products = await response.json();

        // Lưu dữ liệu sản phẩm vào localStorage
        localStorage.setItem('products', JSON.stringify(products));
        
        console.log('Products fetched and stored in localStorage.');
    } catch (error) {
        console.error('Error fetching products:', error.message);
    }
}
// Create admin account 
function createAdminAccount() {
    let accounts = localStorage.getItem("accounts");
    if (!accounts) {
        accounts = [];
        accounts.push({
            fullname: "Hoàng Gia Bảo",
            phone: "hgbaodev",
            password: "123456",
            address: 'https://github.com/hgbaodev',
            email: 'musicanime2501@gmail.com',
            status: 1,
            join: new Date(),
            cart: [],
            userType: 1
        })
        accounts.push({
            fullname: "Trần Nhật Sinh",
            phone: "0123456789",
            password: "123456",
            address: '',
            email: '',
            status: 1,
            join: new Date(),
            cart: [],
            userType: 1
        })
        localStorage.setItem('accounts', JSON.stringify(accounts));
    }
}

window.onload = createProduct();
window.onload = createAdminAccount();
async function checkLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            const currentUser = userData.data;
            if (currentUser.role.includes('ADMIN')) {
                document.getElementById("name-acc").innerHTML = currentUser.username;
            } else {
                document.querySelector("body").innerHTML = `<div class="access-denied-section">
                    <img class="access-denied-img" src="./assets/img/access-denied.webp" alt="">
                </div>`;
            }
        } else {
            console.error('Error fetching user data:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
function getToken() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name.trim() === 'kento') {
            return value;
        }
    }
    return '';
}
window.onload = checkLogin();

//do sidebar open and close
const menuIconButton = document.querySelector(".menu-icon-btn");
const sidebar = document.querySelector(".sidebar");
menuIconButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// log out admin user
/*
let toogleMenu = document.querySelector(".profile");
let mune = document.querySelector(".profile-cropdown");
toogleMenu.onclick = function () {
    mune.classList.toggle("active");
};
*/

// tab for section
const sidebars = document.querySelectorAll(".sidebar-list-item.tab-content");
const sections = document.querySelectorAll(".section");

for(let i = 0; i < sidebars.length; i++) {
    sidebars[i].onclick = function () {
        document.querySelector(".sidebar-list-item.active").classList.remove("active");
        document.querySelector(".section.active").classList.remove("active");
        sidebars[i].classList.add("active");
        sections[i].classList.add("active");
    };
}

const closeBtn = document.querySelectorAll('.section');
for(let i=0;i<closeBtn.length;i++){
    closeBtn[i].addEventListener('click',(e) => {
        sidebar.classList.add("open");
    })
}

// Get amount product
function getAmoumtProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    return products.length;
}

// Get amount user
function getAmoumtUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")) : [];
    return accounts.filter(item => item.userType == 0).length;
}

// Get amount user
function getMoney() {
    let tongtien = 0;
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    orders.forEach(item => {
        tongtien += item.tongtien
    });
    return tongtien;
}

document.getElementById("amount-user").innerHTML = getAmoumtUser();
document.getElementById("amount-product").innerHTML = getAmoumtProduct();
document.getElementById("doanh-thu").innerHTML = vnd(getMoney());


// Doi sang dinh dang tien VND
function vnd(price) {
    return price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}
// Phân trang 
let perPage = 12;
let currentPage = 1;
let totalPage = 0;
let perProducts = [];

function displayList(productAll, perPage, currentPage) {
    let start = (currentPage - 1) * perPage;
    let end = (currentPage - 1) * perPage + perPage;
    let productShow = productAll.slice(start, end);
    showProductArr(productShow);
}

function setupPagination(productAll, perPage) {
    document.querySelector('.page-nav-list').innerHTML = '';
    let page_count = Math.ceil(productAll.length / perPage);
    for (let i = 1; i <= page_count; i++) {
        let li = paginationChange(i, productAll, currentPage);
        document.querySelector('.page-nav-list').appendChild(li);
    }
}

function paginationChange(page, productAll, currentPage) {
    let node = document.createElement(`li`);
    node.classList.add('page-nav-item');
    node.innerHTML = `<a href="#">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
    })
    return node;
}
// Gọi API và đổ dữ liệu vào hàm showProductArr
fetch('http://localhost:3000/api/v1/products')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Chuyển đổi phản hồi sang JSON
  })
  .then(data => {
    // Gọi hàm showProductArr với dữ liệu từ API
    showProductArr(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });

// Hiển thị danh sách sản phẩm 
function showProductArr(arr) {
    let productHtml = "";
    if (arr.length === 0) {
        productHtml = `<div class="no-result"><div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div><div class="no-result-h">Không có sản phẩm để hiển thị</div></div>`;
    } else {
        arr.forEach(product => {
            // Check if 'published' property exists and is not null or undefined
            let btnCtl = product.published && product.published.length > 0 ? 
                `<button class="btn-delete" onclick="deleteProduct('${product._id}')"><i class="fa-regular fa-trash"></i></button>` :
                `<button class="btn-delete" onclick="changeStatusProduct('${product._id}')"><i class="fa-regular fa-eye"></i></button>`;
            productHtml += `
            <div class="list">
                <div class="list-left">
                    <img src="${product.images[0].url}" alt="${product.images[0].alt}">
                    <div class="list-info">
                        <h4>${product.name}</h4>
                        <p class="list-note">${product.description}</p>
                        <span class="list-category">${product.category.name}</span>
                    </div>
                </div>
                <div class="list-right">
                    <div class="list-price">
                        <span class="list-current-price">${vnd(product.price)}</span>                   
                    </div>
                    <div class="list-control">
                        <div class="list-tool">
                            <button class="btn-edit" onclick="editProduct('${product._id}')"><i class="fa-light fa-pen-to-square"></i></button>
                            ${btnCtl}
                        </div>                       
                    </div>
                </div> 
            </div>`;
        });
    }
    document.getElementById("show-product").innerHTML = productHtml;
}



function showProduct() {
    // Lấy thể loại từ API
    fetch('http://localhost:3000/api/v1/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(categories => { 
            // Hiển thị thể loại sản phẩm trong dropdown
            let selectOp = document.getElementById('the-loai');
            selectOp.innerHTML = ''; // Xóa các lựa chọn hiện có
            let defaultOption = document.createElement('option');
            defaultOption.text = 'Tất cả';
            selectOp.add(defaultOption);

            categories.forEach(category => {
                let option = document.createElement('option');
                option.value = category.name; // Giả sử tên thể loại được sử dụng làm giá trị
                option.text = category.name; // Giả sử tên thể loại được hiển thị làm văn bản
                selectOp.add(option);
            });

            // Lấy các giá trị nhập khác
            let valeSearchInput = document.getElementById('form-search-product').value;

            // Fetch dữ liệu sản phẩm từ API
            fetch('http://localhost:3000/api/v1/products')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(products => {
                    // Lọc sản phẩm dựa trên thể loại và từ khóa tìm kiếm
                    let result = products;
                    if(selectOp.value != "Tất cả") {
                        result = result.filter((item) => item.category == selectOp.value);
                    }
                    result = valeSearchInput == "" ? result : result.filter(item => {
                        return item.title.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
                    });

                    // Hiển thị sản phẩm đã lọc và thiết lập phân trang
                    displayList(result, perPage, currentPage);
                    setupPagination(result, perPage, currentPage);
                })
                .catch(error => {
                    console.error('There was a problem with fetching products:', error);
                });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

document.getElementById('the-loai').addEventListener('change', function() {
    showProduct();
});

function cancelSearchProduct() {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")).filter(item => item.status == 1) : [];
    document.getElementById('the-loai').value = "Tất cả";
    document.getElementById('form-search-product').value = "";
    displayList(products, perPage, currentPage);
    setupPagination(products, perPage, currentPage);
}

window.onload = showProduct();

// Hàm tạo ID
function createId(arr) {
    let id = arr.length;
    let check = arr.find((item) => item.id == id);
    while (check != null) {
        id++;
        check = arr.find((item) => item.id == id);
    }
    return id;
}
// Xóa sản phẩm 
function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let index = products.findIndex(item => {
        return item.id == id;
    })
    if (confirm("Bạn có chắc muốn xóa?") == true) {
        products[index].status = 0;
        toast({ title: 'Success', message: 'Xóa sản phẩm thành công !', type: 'success', duration: 3000 });
    }
    localStorage.setItem("products", JSON.stringify(products));
    showProduct();
}

function changeStatusProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    let index = products.findIndex(item => {
        return item.id == id;
    })
    if (confirm("Bạn có chắc chắn muốn hủy xóa?") == true) {
        products[index].status = 1;
        toast({ title: 'Success', message: 'Khôi phục sản phẩm thành công !', type: 'success', duration: 3000 });
    }
    localStorage.setItem("products", JSON.stringify(products));
    showProduct();
}

var indexCur;
function editProduct(id) {
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : [];
    let index = products.findIndex(item => item.id == id);
    indexCur = index;

    // Ẩn các phần tử thêm sản phẩm và hiển thị các phần tử chỉnh sửa sản phẩm
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "none";
    });
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "block";
    });
    document.querySelector(".add-product").classList.add("open");

    // Đặt các giá trị của sản phẩm vào các trường nhập liệu tương ứng
    document.querySelector(".upload-image-preview").src = products[index].img;
    document.getElementById("ten-mon").value = products[index].title;
    document.getElementById("gia-moi").value = products[index].price;
    document.getElementById("mo-ta").value = products[index].desc;

    // Gọi hàm fetchCategories để lấy danh sách các loại món ăn và đổ vào dropdown menu chon-mon
    fetchCategories()
        .then(() => {
            // Đặt giá trị của loại món ăn trong sản phẩm vào dropdown menu chon-mon
            document.getElementById("chon-mon").value = products[index].category;
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}
function fetchCategories() {
    fetch('http://localhost:3000/api/v1/categories')
        .then(response => response.json())
        .then(data => {
            // Xử lý phản hồi từ API và trích xuất danh sách các loại món ăn
            let categories = data.map(category => {
                return { name: category.name, _id: category._id };
            });
            // Đổ danh sách các loại món ăn vào dropdown menu chon-mon
            let selectElement = document.getElementById("chon-mon");
            selectElement.innerHTML = ""; // Xóa tất cả các mục hiện có trong dropdown trước khi thêm mới
            categories.forEach(category => {
                let option = document.createElement("option"); 
                option.text = category.name;
                option.value = category._id; // Gán _id của danh mục là giá trị của option
                selectElement.add(option);
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
        });
}

// Gọi hàm fetchCategories khi trang được tải
function getPathImage(path) {
    let patharr = path.split("/");
    return "./assets/img/products/" + patharr[patharr.length - 1];
}

let btnUpdateProductIn = document.getElementById("update-product-button");
btnUpdateProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Get the values from input fields
    let imgProductCur = getPathImage(document.querySelector(".upload-image-preview").src);
    let titleProductCur = document.getElementById("ten-mon").value;
    let curProductCur = document.getElementById("gia-moi").value;
    let descProductCur = document.getElementById("mo-ta").value;
    let categoryText = document.getElementById("chon-mon").value;

    // Validate input fields
    if (titleProductCur === "" || curProductCur === "" || descProductCur === "") {
        toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin sản phẩm!", type: "warning", duration: 3000 });
        return;
    }

    if (isNaN(curProductCur)) {
        toast({ title: "Chú ý", message: "Giá bán phải là số!", type: "warning", duration: 3000 });
        return;
    }

    try {
        // Create product object
        let bodyData = {
            title: titleProductCur,
            description: descProductCur,
            category: categoryText,
            img: imgProductCur,
            price: parseInt(curProductCur)
        };

        // Send PUT request to API
        const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error('Có lỗi xảy ra khi cập nhật sản phẩm.');
        }

        // Process response
        const data = await response.json();
        console.log('Sản phẩm đã được cập nhật:', data);
        toast({ title: "Thành công", message: "Cập nhật sản phẩm thành công!", type: "success", duration: 3000 });
        setDefaultValue(); // Reset input fields
    } catch (error) {
        console.error('Lỗi:', error);
        // Handle error (if needed)
    }
});


let btnAddProductIn = document.getElementById("add-product-button");
btnAddProductIn.addEventListener("click", async (e) => {
    e.preventDefault();

    // Lấy các giá trị từ các trường nhập liệu
    let imgProduct = getPathImage(document.querySelector(".upload-image-preview").src);
    let tenMon = document.getElementById("ten-mon").value;
    let giaBan = document.getElementById("gia-moi").value;
    let moTa = document.getElementById("mo-ta").value;
    let danhMuc = document.getElementById("chon-mon").value;
    let soLuong = document.getElementById("so-luong").value;

    // Validate input fields
    if (tenMon === "" || giaBan === "" || moTa === "" || soLuong === "") {
        toast({ title: "Chú ý", message: "Vui lòng nhập đầy đủ thông tin sản phẩm!", type: "warning", duration: 3000 });
        return;
    }

    if (isNaN(giaBan) || isNaN(soLuong)) {
        toast({ title: "Chú ý", message: "Giá bán và số lượng phải là số!", type: "warning", duration: 3000 });
        return;
    }

    try {
        // Tạo đối tượng sản phẩm
        let bodyData = {
            name: tenMon,
            description: moTa,
            category: danhMuc,
            images: [{ url: imgProduct }], // Đưa imgProduct vào một mảng chứa một đối tượng với thuộc tính url
            price: parseInt(giaBan),
            quantity: parseInt(soLuong)
        };

        // Gửi yêu cầu POST tới API
        const response = await fetch('http://localhost:3000/api/v1/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}` // Giả sử getToken() function trả về token ủy quyền
            },
            body: JSON.stringify(bodyData)
        });

        if (!response.ok) {
            throw new Error('Có lỗi xảy ra khi thêm sản phẩm.');
        }

        // Xử lý phản hồi
        const data = await response.json();
        console.log('Sản phẩm đã được thêm:', data);
        toast({ title: "Thành công", message: "Thêm sản phẩm thành công!", type: "success", duration: 3000 });
        setDefaultValue(); // Đặt lại giá trị mặc định cho các trường nhập liệu
    } catch (error) {
        console.error('Lỗi:', error);
        // Xử lý lỗi (nếu cần)
    }
});



document.querySelector(".modal-close.product-form").addEventListener("click",() => {
    setDefaultValue();
})

function setDefaultValue() {
    document.querySelector(".upload-image-preview").src = "./assets/img/blank-image.png";
    document.getElementById("ten-mon").value = "";
    document.getElementById("gia-moi").value = "";
    document.getElementById("mo-ta").value = "";
    document.getElementById("chon-mon").value = "Món chay";
}

// Open Popup Modal
let btnAddProduct = document.getElementById("btn-add-product"); 
btnAddProduct.addEventListener("click", () => {
    document.querySelectorAll(".add-product-e").forEach(item => {
        item.style.display = "block";
    });
    document.querySelectorAll(".edit-product-e").forEach(item => {
        item.style.display = "none";
    });
    document.querySelector(".add-product").classList.add("open");
    fetchCategories(); // Assuming this function fetches categories for select input
});
// Close Popup Modal
let closePopup = document.querySelectorAll(".modal-close");
let modalPopup = document.querySelectorAll(".modal");

for (let i = 0; i < closePopup.length; i++) {
    closePopup[i].onclick = () => {
        modalPopup[i].classList.remove("open");
    };
}

// On change Image
function uploadImage(input) {
    if (input.files && input.files[0]) {
        var formData = new FormData();
        formData.append('image', input.files[0]);

        // Perform an AJAX request to save the image
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/save-image', true); // Replace '/save-image' with your server endpoint
        xhr.onload = function() {
            if (xhr.status === 200) {
                console.log('Image uploaded successfully.');
            } else {
                console.error('Error uploading image:', xhr.statusText);
            }
        };
        xhr.onerror = function() {
            console.error('Error uploading image:', xhr.statusText);
        };
        xhr.send(formData);
        
        // Display the uploaded image preview
        var reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('.upload-image-preview').setAttribute('src', e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// Đổi trạng thái đơn hàng
function changeStatus(id, el) {
    let orders = JSON.parse(localStorage.getItem("order"));
    let order = orders.find((item) => {
        return item.id == id;
    });
    order.trangthai = 1;
    el.classList.remove("btn-chuaxuly");
    el.classList.add("btn-daxuly");
    el.innerHTML = "Đã xử lý";
    localStorage.setItem("order", JSON.stringify(orders));
    findOrder(orders);
}

// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return dd + "/" + mm + "/" + yyyy;
}

// Show order
function showOrder() {
    fetch('http://localhost:3000/api/v1/orders')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let orderHtml = "<table><thead><tr><th>ID</th><th>User</th><th>Date</th><th>Total Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>";

            if (data.length === 0) {
                orderHtml += `<tr><td colspan="6">Không có dữ liệu</td></tr>`;
            } else {
                data.forEach((item) => {
                    let status = item.status === "Đang chờ xử lý" ? `<span class="status-no-complete">Chưa xử lý</span>` : `<span class="status-complete">Đã xử lý</span>`;
                    let date = formatDate(item.createdAt);
                    orderHtml += `
                        <tr>
                            <td>${item._id}</td>
                            <td>${item.user.username}</td>
                            <td>${date}</td>
                            <td>${vnd(item.totalAmount)}</td>                               
                            <td>${status}</td>
                            <td class="control">
                                <button class="btn-detail" onclick="detailOrder('${item._id}')"><i class="fa-regular fa-eye"></i> Chi tiết</button>
                            </td>
                        </tr>`;
                });
            }

            orderHtml += "</tbody></table>";
            document.getElementById("showOrder").innerHTML = orderHtml;
        })
        .catch(error => {

        });
}



let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
window.onload = showOrder(orders);

// Get Order Details
function getOrderDetails(madon) {
    let orderDetails = localStorage.getItem("orderDetails") ?
        JSON.parse(localStorage.getItem("orderDetails")) : [];
    let ctDon = [];
    orderDetails.forEach((item) => {
        if (item.madon == madon) {
            ctDon.push(item);
        }
    });
    return ctDon;
}

// Show Order Detail
function detailOrder(id) {
    document.querySelector(".modal.detail-order").classList.add("open");
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let products = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("products")) : [];
    // Lấy hóa đơn 
    let order = orders.find((item) => item.id == id);
    // Lấy chi tiết hóa đơn
    let ctDon = getOrderDetails(id);
    let spHtml = `<div class="modal-detail-left"><div class="order-item-group">`;

    ctDon.forEach((item) => {
        let detaiSP = products.find(product => product.id == item.id);
        spHtml += `<div class="order-product">
            <div class="order-product-left">
                <img src="${detaiSP.img}" alt="">
                <div class="order-product-info">
                    <h4>${detaiSP.title}</h4>
                    <p class="order-product-note"><i class="fa-light fa-pen"></i> ${item.note}</p>
                    <p class="order-product-quantity">SL: ${item.soluong}<p>
                </div>
            </div>
            <div class="order-product-right">
                <div class="order-product-price">
                    <span class="order-product-current-price">${vnd(item.price)}</span>
                </div>                         
            </div>
        </div>`;
    });
    spHtml += `</div></div>`;
    spHtml += `<div class="modal-detail-right">
        <ul class="detail-order-group">
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                <span class="detail-order-item-right">${formatDate(order.thoigiandat)}</span>
            </li>
            <li class="detail-order-item">
                <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                <span class="detail-order-item-right">${order.hinhthucgiao}</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
            <span class="detail-order-item-right">${order.tenguoinhan}</span>
            </li>
            <li class="detail-order-item">
            <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại</span>
            <span class="detail-order-item-right">${order.sdtnhan}</span>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Thời gian giao</span>
                <p class="detail-order-item-b">${(order.thoigiangiao == "" ? "" : (order.thoigiangiao + " - ")) + formatDate(order.ngaygiaohang)}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-location-dot"></i> Địa chỉ nhận</span>
                <p class="detail-order-item-b">${order.diachinhan}</p>
            </li>
            <li class="detail-order-item tb">
                <span class="detail-order-item-t"><i class="fa-light fa-note-sticky"></i> Ghi chú</span>
                <p class="detail-order-item-b">${order.ghichu}</p>
            </li>
        </ul>
    </div>`;
    document.querySelector(".modal-detail-order").innerHTML = spHtml;

    let classDetailBtn = order.trangthai == 0 ? "btn-chuaxuly" : "btn-daxuly";
    let textDetailBtn = order.trangthai == 0 ? "Chưa xử lý" : "Đã xử lý";
    document.querySelector(
        ".modal-detail-bottom"
    ).innerHTML = `<div class="modal-detail-bottom-left">
        <div class="price-total">
            <span class="thanhtien">Thành tiền</span>
            <span class="price">${vnd(order.tongtien)}</span>
        </div>
    </div>
    <div class="modal-detail-bottom-right">
        <button class="modal-detail-btn ${classDetailBtn}" onclick="changeStatus('${order.id}',this)">${textDetailBtn}</button>
    </div>`;
}

// Find Order
function findOrder() {
    let tinhTrang = parseInt(document.getElementById("tinh-trang").value);
    let ct = document.getElementById("form-search-order").value;
    let timeStart = document.getElementById("time-start").value;
    let timeEnd = document.getElementById("time-end").value;
    
    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let result = tinhTrang == 2 ? orders : orders.filter((item) => {
        return item.trangthai == tinhTrang;
    });
    result = ct == "" ? result : result.filter((item) => {
        return (item.khachhang.toLowerCase().includes(ct.toLowerCase()) || item.id.toString().toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.thoigiandat) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.thoigiandat) <= new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }
    showOrder(result);
}

function cancelSearchOrder(){
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    document.getElementById("tinh-trang").value = 2;
    document.getElementById("form-search-order").value = "";
    document.getElementById("time-start").value = "";
    document.getElementById("time-end").value = "";
    showOrder(orders);
}
function showDiscount() {
    console.log("đã chạy");
    fetch('http://localhost:3000/api/v1/discountcodes')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
  
            return response.json();
        })
        .then(data => {
            let discountHtml = "<table><thead><tr><th>ID</th><th>Mã giảm giá</th><th>Phần trăm giảm giá</th><th>Ngày bắt đầu</th><th>Ngày kết thúc</th><th>Tình trạng</th><th>Ngày tạo</th><th>Ngày cập nhật</th></tr></thead><tbody>";

            if (data.length === 0) {
                discountHtml += `<tr><td colspan="8">Không có dữ liệu</td></tr>`;
            } else {
                data.forEach((item) => {
                    let status = item.isActive ? `<span class="status-complete">Hoạt động</span>` : `<span class="status-no-complete">Không hoạt động</span>`;
                    let startDate = formatDate(item.startDate);
                    let expiryDate = formatDate(item.expiryDate);
                    discountHtml += `
                        <tr>
                            <td>${item._id}</td>
                            <td>${item.code}</td>
                            <td>${item.discountPercentage}%</td>
                            <td>${startDate}</td>
                            <td>${expiryDate}</td>                               
                            <td>${status}</td>
                            <td>${formatDate(item.createdAt)}</td>
                            <td>${formatDate(item.updatedAt)}</td>
                        </tr>`;
                });
            }
            discountHtml += "</tbody></table>";
            document.getElementById("show-discount").innerHTML = discountHtml;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
// Create Object Thong ke
function createObj() {
    let orders = localStorage.getItem("order") ? JSON.parse(localStorage.getItem("order")) : [];
    let products = localStorage.getItem("products") ? JSON.parse(localStorage.getItem("products")) : []; 
    let orderDetails = localStorage.getItem("orderDetails") ? JSON.parse(localStorage.getItem("orderDetails")) : []; 
    let result = [];
    orderDetails.forEach(item => {
        // Lấy thông tin sản phẩm
        let prod = products.find(product => {return product.id == item.id;});
        let obj = new Object();
        obj.id = item.id;
        obj.madon = item.madon;
        obj.price = item.price;
        obj.quantity = item.soluong;
        obj.category = prod.category;
        obj.title = prod.title;
        obj.img = prod.img;
        obj.time = (orders.find(order => order.id == item.madon)).thoigiandat;
        result.push(obj);
    });
    return result;
}

// Filter 
function thongKe(mode) {
    let categoryTk = document.getElementById("the-loai-tk").value;
    let ct = document.getElementById("form-search-tk").value;
    let timeStart = document.getElementById("time-start-tk").value;
    let timeEnd = document.getElementById("time-end-tk").value;
    if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
        alert("Lựa chọn thời gian sai !");
        return;
    }
    let arrDetail = createObj();
    let result = categoryTk == "Tất cả" ? arrDetail : arrDetail.filter((item) => {
        return item.category == categoryTk;
    });

    result = ct == "" ? result : result.filter((item) => {
        return (item.title.toLowerCase().includes(ct.toLowerCase()));
    });

    if (timeStart != "" && timeEnd == "") {
        result = result.filter((item) => {
            return new Date(item.time) > new Date(timeStart).setHours(0, 0, 0);
        });
    } else if (timeStart == "" && timeEnd != "") {
        result = result.filter((item) => {
            return new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59);
        });
    } else if (timeStart != "" && timeEnd != "") {
        result = result.filter((item) => {
            return (new Date(item.time) > new Date(timeStart).setHours(0, 0, 0) && new Date(item.time) < new Date(timeEnd).setHours(23, 59, 59)
            );
        });
    }    
    showThongKe(result,mode);
}

// Show số lượng sp, số lượng đơn bán, doanh thu
function showOverview(arr){
    document.getElementById("quantity-product").innerText = arr.length;
    document.getElementById("quantity-order").innerText = arr.reduce((sum, cur) => (sum + parseInt(cur.quantity)),0);
    document.getElementById("quantity-sale").innerText = vnd(arr.reduce((sum, cur) => (sum + parseInt(cur.doanhthu)),0));
}

function showThongKe(arr,mode) {
    let orderHtml = "";
    let mergeObj = mergeObjThongKe(arr);
    showOverview(mergeObj);

    switch (mode){
        case 0:
            mergeObj = mergeObjThongKe(createObj());
            showOverview(mergeObj);
            document.getElementById("the-loai-tk").value = "Tất cả";
            document.getElementById("form-search-tk").value = "";
            document.getElementById("time-start-tk").value = "";
            document.getElementById("time-end-tk").value = "";
            break;
        case 1:
            mergeObj.sort((a,b) => parseInt(a.quantity) - parseInt(b.quantity))
            break;
        case 2:
            mergeObj.sort((a,b) => parseInt(b.quantity) - parseInt(a.quantity))
            break;
    }
    for(let i = 0; i < mergeObj.length; i++) {
        orderHtml += `
        <tr>
        <td>${i + 1}</td>
        <td><div class="prod-img-title"><img class="prd-img-tbl" src="${mergeObj[i].img}" alt=""><p>${mergeObj[i].title}</p></div></td>
        <td>${mergeObj[i].quantity}</td>
        <td>${vnd(mergeObj[i].doanhthu)}</td>
        <td><button class="btn-detail product-order-detail" data-id="${mergeObj[i].id}"><i class="fa-regular fa-eye"></i> Chi tiết</button></td>
        </tr>      
        `;
    }
    document.getElementById("showTk").innerHTML = orderHtml;
    document.querySelectorAll(".product-order-detail").forEach(item => {
        let idProduct = item.getAttribute("data-id");
        item.addEventListener("click", () => {           
            detailOrderProduct(arr,idProduct);
        })
    })
}

showThongKe(createObj())

function mergeObjThongKe(arr) {
    let result = [];
    arr.forEach(item => {
        let check = result.find(i => i.id == item.id) // Không tìm thấy gì trả về undefined

        if(check){
            check.quantity = parseInt(check.quantity)  + parseInt(item.quantity);
            check.doanhthu += parseInt(item.price) * parseInt(item.quantity);
        } else {
            const newItem = {...item}
            newItem.doanhthu = newItem.price * newItem.quantity;
            result.push(newItem);
        }
        
    });
    return result;
}

function detailOrderProduct(arr,id) {
    let orderHtml = "";
    arr.forEach(item => {
        if(item.id == id) {
            orderHtml += `<tr>
            <td>${item.madon}</td>
            <td>${item.quantity}</td>
            <td>${vnd(item.price)}</td>
            <td>${formatDate(item.time)}</td>
            </tr>      
            `;
        }
    });
    document.getElementById("show-product-order-detail").innerHTML = orderHtml
    document.querySelector(".modal.detail-order-product").classList.add("open")
}

// User
let addAccount = document.getElementById('signup-button');
let updateAccount = document.getElementById("btn-update-account")

document.querySelector(".modal.signup .modal-close").addEventListener("click",() => {
    signUpFormReset();
})

function openCreateAccount() {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "block"
    })
}

function signUpFormReset() {
    document.getElementById('fullname').value = ""
    document.getElementById('phone').value = ""
    document.getElementById('password').value = ""
    document.querySelector('.form-message-name').innerHTML = '';
    document.querySelector('.form-message-phone').innerHTML = '';
    document.querySelector('.form-message-password').innerHTML = '';
}

// Gọi API và đổ dữ liệu vào hàm showUserArr
fetch('http://localhost:3000/api/v1/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
})
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json(); // Chuyển đổi phản hồi sang JSON
  })
  .then(data => {
    // Gọi hàm showProductArr với dữ liệu từ API
    showProductArr(data);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });


function showUserArr(arr) {
    let accountHtml = '';
    if(arr.length == 0) {
        accountHtml = `<tr><td colspan="6">Không có dữ liệu</td></tr>`;
    } else {
        arr.forEach((user, index) => {
            let tinhtrang = user.status ? `<span class="status-complete">Hoạt động</span>` : `<span class="status-no-complete">Bị khóa</span>`;
            accountHtml += ` 
            <tr>
                <td>${index + 1}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.phone}</td>
                <td>${user.address}</td>
                <td>${tinhtrang}</td>
                <td>${formatDate(user.createdAt)}</td>
                <td>${formatDate(user.updatedAt)}</td>
                <td class="control control-table">
                    <button class="btn-edit" id="edit-account" onclick='editAccount("${user._id}")'><i class="fa-light fa-pen-to-square"></i></button>
                    <button class="btn-delete" id="delete-account" onclick='deleteAcount("${user._id}")'><i class="fa-regular fa-trash"></i></button>
                </td>
            </tr>`;
        });
    }
    document.getElementById('show-user').innerHTML = accountHtml;
}


    async function showUser() {
        try {
            // Kiểm tra xem người dùng đã đăng nhập và có token không
            const token = getToken();
            if (!token) {
                // Nếu không có token, chuyển hướng hoặc hiển thị thông báo yêu cầu đăng nhập
                // Ví dụ:
                window.location.href = '/login'; // Chuyển hướng đến trang đăng nhập
                return;
            }
    
            const response = await fetch('http://localhost:3000/api/v1/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.ok) {
                const accounts = await response.json();
                // Tiếp tục xử lý dữ liệu và hiển thị danh sách người dùng
                let tinhTrang = parseInt(document.getElementById("tinh-trang-user").value);
                let ct = document.getElementById("form-search-user").value;
                let timeStart = document.getElementById("time-start-user").value;
                let timeEnd = document.getElementById("time-end-user").value;
    
                if (timeEnd < timeStart && timeEnd != "" && timeStart != "") {
                    alert("Lựa chọn thời gian sai !");
                    return;
                }
    
                let result = tinhTrang == 2 ? accounts : accounts.filter(item => item.status == tinhTrang);
    
                result = ct == "" ? result : result.filter((item) => {
                    return (item.fullname.toLowerCase().includes(ct.toLowerCase()) || item.phone.toString().toLowerCase().includes(ct.toLowerCase()));
                });
    
                if (timeStart != "" && timeEnd == "") {
                    result = result.filter((item) => {
                        return new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0);
                    });
                } else if (timeStart == "" && timeEnd != "") {
                    result = result.filter((item) => {
                        return new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59);
                    });
                } else if (timeStart != "" && timeEnd != "") {
                    result = result.filter((item) => {
                        return (new Date(item.join) >= new Date(timeStart).setHours(0, 0, 0) && new Date(item.join) <= new Date(timeEnd).setHours(23, 59, 59)
                        );
                    });
                }
                showUserArr(result);
            } else {
                console.error('Error fetching user data:', response.statusText);
                // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi
            }
        } catch (error) {
            console.error('Error:', error);
            // Xử lý lỗi, ví dụ: hiển thị thông báo lỗi
        }
    }
    
    
function cancelSearchUser() {
    let accounts = localStorage.getItem("accounts") ? JSON.parse(localStorage.getItem("accounts")).filter(item => item.userType == 0) : [];
    showUserArr(accounts);
    document.getElementById("tinh-trang-user").value = 2;
    document.getElementById("form-search-user").value = "";
    document.getElementById("time-start-user").value = "";
    document.getElementById("time-end-user").value = "";
}

window.onload = showUser();
window.onload = showDiscount();
function deleteAcount(phone) {
    let accounts = JSON.parse(localStorage.getItem('accounts'));
    let index = accounts.findIndex(item => item.phone == phone);
    if (confirm("Bạn có chắc muốn xóa?")) {
        accounts.splice(index, 1)
    }
    localStorage.setItem("accounts", JSON.stringify(accounts));
    showUser();
}

let indexFlag;
function editAccount(phone) {
    document.querySelector(".signup").classList.add("open");
    document.querySelectorAll(".add-account-e").forEach(item => {
        item.style.display = "none"
    })
    document.querySelectorAll(".edit-account-e").forEach(item => {
        item.style.display = "block"
    })
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let index = accounts.findIndex(item => {
        return item.phone == phone
    })
    indexFlag = index;
    document.getElementById("fullname").value = accounts[index].fullname;
    document.getElementById("phone").value = accounts[index].phone;
    document.getElementById("password").value = accounts[index].password;
    document.getElementById("user-status").checked = accounts[index].status == 1 ? true : false;
}

updateAccount.addEventListener("click", (e) => {
    e.preventDefault();
    let accounts = JSON.parse(localStorage.getItem("accounts"));
    let fullname = document.getElementById("fullname").value;
    let phone = document.getElementById("phone").value;
    let password = document.getElementById("password").value;
    if(fullname == "" || phone == "" || password == "") {
        toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 3000 });
    } else {
        accounts[indexFlag].fullname = document.getElementById("fullname").value;
        accounts[indexFlag].phone = document.getElementById("phone").value;
        accounts[indexFlag].password = document.getElementById("password").value;
        accounts[indexFlag].status = document.getElementById("user-status").checked ? true : false;
        localStorage.setItem("accounts", JSON.stringify(accounts));
        toast({ title: 'Thành công', message: 'Thay đổi thông tin thành công !', type: 'success', duration: 3000 });
        document.querySelector(".signup").classList.remove("open");
        signUpFormReset();
        showUser();
    }
})

addAccount.addEventListener("click", (e) => {
    e.preventDefault();
    let fullNameUser = document.getElementById('fullname').value;
    let phoneUser = document.getElementById('phone').value;
    let passwordUser = document.getElementById('password').value;
    
    // Check validate
    let fullNameIP = document.getElementById('fullname');
    let formMessageName = document.querySelector('.form-message-name');
    let formMessagePhone = document.querySelector('.form-message-phone');
    let formMessagePassword = document.querySelector('.form-message-password');

    formMessageName.innerHTML = '';
    formMessagePhone.innerHTML = '';
    formMessagePassword.innerHTML = '';

    if (fullNameUser.length === 0) {
        formMessageName.innerHTML = 'Vui lòng nhập họ và tên';
        fullNameIP.focus();
    } else if (fullNameUser.length < 3) {
        fullNameIP.value = '';
        formMessageName.innerHTML = 'Vui lòng nhập họ và tên lớn hơn 3 kí tự';
    }
    
    if (phoneUser.length === 0) {
        formMessagePhone.innerHTML = 'Vui lòng nhập số điện thoại';
    } else if (phoneUser.length !== 10) {
        formMessagePhone.innerHTML = 'Vui lòng nhập số điện thoại 10 số';
        document.getElementById('phone').value = '';
    }
    
    if (passwordUser.length === 0) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu';
    } else if (passwordUser.length < 6) {
        formMessagePassword.innerHTML = 'Vui lòng nhập mật khẩu lớn hơn 6 kí tự';
        document.getElementById('password').value = '';
    }

    if (fullNameUser && phoneUser && passwordUser && formMessageName.innerHTML === '' && formMessagePhone.innerHTML === '' && formMessagePassword.innerHTML === '') {
        let user = {
            fullname: fullNameUser,
            phone: phoneUser,
            password: passwordUser,
            address: '',
            email: '',
            status: 1,
            join: new Date(),
            cart: [],
            userType: 0
        };

        console.log(user);
        let accounts = localStorage.getItem('accounts') ? JSON.parse(localStorage.getItem('accounts')) : [];
        let checkloop = accounts.some(account => {
            return account.phone == user.phone;
        });

        if (!checkloop) {
            accounts.push(user);
            localStorage.setItem('accounts', JSON.stringify(accounts));
            toast({ title: 'Thành công', message: 'Tạo thành công tài khoản!', type: 'success', duration: 3000 });
            document.querySelector(".signup").classList.remove("open");
            showUser();
            signUpFormReset();
        } else {
            toast({ title: 'Cảnh báo!', message: 'Tài khoản đã tồn tại!', type: 'error', duration: 3000 });
        }
    }
});


document.getElementById("logout-acc").addEventListener('click', (e) => {
    e.preventDefault();
    document.cookie = 'kento=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location = "/";
})
async function fetchCategories() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        const categories = await response.json();
        return categories;
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        return [];
    }
}

async function getProductData() {
    try {
        // Gửi yêu cầu GET đến endpoint API để lấy danh sách sản phẩm
        const response = await fetch('http://localhost:3000/api/v1/products');

        // Kiểm tra nếu yêu cầu thành công (status code 200)
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        // Chuyển đổi dữ liệu nhận được sang định dạng JSON
        const products = await response.json();

        return products; // Trả về danh sách sản phẩm

    } catch (error) {
        console.error('Error fetching products:', error.message);
        return []; // Trả về mảng rỗng nếu có lỗi
    }
}
document.addEventListener('DOMContentLoaded', renderMenu);

async function renderMenu() {
    const categories = await fetchCategories();
    const menuList = document.querySelector('.menu-list');
    if (menuList && categories.length > 0) {
        categories.forEach(category => {
            const listItem = document.createElement('li');
            listItem.classList.add('menu-list-item');
            listItem.innerHTML = `<a href="javascript:;" class="menu-link" onclick="showCategory('${category._id}')">${category.name}</a>`;
            menuList.appendChild(listItem);
        });
    }
}

// Doi sang dinh dang tien VND
function vnd(price) {
    return price && price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

// Close popup 
const body = document.querySelector("body");
let modalContainer = document.querySelectorAll('.modal');
let modalBox = document.querySelectorAll('.mdl-cnt');
let formLogSign = document.querySelector('.forms');

// Click vùng ngoài sẽ tắt Popup
modalContainer.forEach(item => {
    item.addEventListener('click', closeModal);
});

modalBox.forEach(item => {
    item.addEventListener('click', function (event) {
        event.stopPropagation();
    })
});

function closeModal() {
    modalContainer.forEach(item => {
        item.classList.remove('open');
    });
    console.log(modalContainer)
    body.style.overflow = "auto";
}

function increasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (parseInt(qty.value) < qty.max) {
        qty.value = parseInt(qty.value) + 1;
    } else {
        qty.value = qty.max;
    }
}

function decreasingNumber(e) {
    let qty = e.parentNode.querySelector('.input-qty');
    if (qty.value > qty.min) {
        qty.value = parseInt(qty.value) - 1;
    } else {
        qty.value = qty.min;
    }
}

//Xem chi tiet san pham
async function detailProduct(index) {
    try {
        const products = await getProductData();
        const infoProduct = products.find(product => product._id === index);

        // Trích xuất đường dẫn hình ảnh từ mảng images
        const imageUrl = infoProduct.images.length > 0 ? infoProduct.images[0].url : '';

        const modalHtml = `<div class="modal-header">
            <img class="product-image" src="${imageUrl}" alt="">
            </div>
            <div class="modal-body">
                <h2 class="product-title">${infoProduct.name}</h2>
                <div class="product-control">
                    <div class="priceBox">
                        <span class="current-price">${vnd(infoProduct.price)}</span>
                    </div>
                    <div class="buttons_added">
                        <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                        <input class="input-qty" max="100" min="1" name="" type="number" value="1">
                        <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                    </div>
                </div>
                <p class="product-description">${infoProduct.description}</p>
            </div>
            <div class="notebox">
                <p class="notebox-title">Ghi chú</p>
                <textarea class="text-note" id="popup-detail-note" placeholder="Nhập thông tin cần lưu ý..."></textarea>
            </div>
            <div class="modal-footer">
                <div class="price-total">
                    <span class="thanhtien">Thành tiền</span>
                    <span class="price">${vnd(infoProduct.price)}</span>
                </div>
                <div class="modal-footer-control">
                    <button class="button-dathangngay" data-product="${infoProduct._id}">Đặt hàng ngay</button>
                    <button class="button-dat" id="add-cart" onclick="animationCart()"><i class="fa-light fa-basket-shopping"></i></button>
                </div>
            </div>`;

        document.querySelector('#product-detail-content').innerHTML = modalHtml;
        const modal = document.querySelector('.modal.product-detail');
        modal.classList.add('open');
        body.style.overflow = "hidden";

        // Cập nhật giá tiền khi tăng số lượng sản phẩm
        const tgbtn = document.querySelectorAll('.is-form');
        const qty = document.querySelector('.product-control .input-qty');
        const priceText = document.querySelector('.price');
        tgbtn.forEach(element => {
            element.addEventListener('click', () => {
                const price = infoProduct.price * parseInt(qty.value);
                priceText.innerHTML = vnd(price);
            });
        });

        // Thêm sản phẩm vào giỏ hàng

        const productbtn = document.querySelector('.button-dat');
        productbtn.addEventListener('click', async (e) => {
            try {
                const response = await fetch('http://localhost:3000/api/v1/auth/me', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${getToken()}`
                    }
                });

                if (response.ok) {
                    // Đã đăng nhập
                    addCart(infoProduct._id);
                } else {
                    // Chưa đăng nhập
                    toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
                }
            } catch (error) {

            }
        });



        // Mua ngay sản phẩm
        dathangngay();
    } catch (error) {
        console.error('Error loading product details:', error.message);
    }
}



function animationCart() {
    document.querySelector(".count-product-cart").style.animation = "slidein ease 1s"
    setTimeout(() => {
        document.querySelector(".count-product-cart").style.animation = "none"
    }, 1000)
}

// Them SP vao gio hang
async function addCart(index) {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            let currentuser = JSON.parse(sessionStorage.getItem('currentuser')) || { cart: [] };

            // Thêm sản phẩm vào giỏ hàng
            let quantity = document.querySelector('.input-qty').value;
            let popupDetailNote = document.querySelector('#popup-detail-note').value;
            let note = popupDetailNote == "" ? "Không có ghi chú" : popupDetailNote;
            let productcart = {
                id: index,
                quantity: parseInt(quantity),
                note: note
            };
            let cart = currentuser.cart;
            let vitri = cart.findIndex(item => item.id == productcart.id);
            if (vitri == -1) {
                cart.push(productcart);
            } else {
                cart[vitri].quantity += parseInt(productcart.quantity);
            }

            sessionStorage.setItem('currentuser', JSON.stringify(currentuser));
            updateAmount();
            closeModal();
            toast({ title: 'Success', message: 'Thêm thành công sản phẩm vào giỏ hàng', type: 'success', duration: 3000 });
        } else {
            // Chưa đăng nhập, hiển thị thông báo cảnh báo
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    } catch (error) {
        console.error('Error checking authentication:', error.message);
    }
}



//Show gio hang
async function showCart() {
    const currentuser = sessionStorage.getItem('currentuser') ? JSON.parse(sessionStorage.getItem('currentuser')) : { cart: [] };

    if (currentuser.cart.length !== 0) {
        document.querySelector('.gio-hang-trong').style.display = 'none';
        document.querySelector('button.thanh-toan').classList.remove('disabled');
        let productcarthtml = '';

        for (const item of currentuser.cart) {
            const product = await getProduct(item.id); 
            if (product) {
                productcarthtml += `<li class="cart-item" data-id="${product._id}">
                    <div class="cart-item-info">
                        <p class="cart-item-title">
                            ${product.name}
                        </p>
                        <span class="cart-item-price price" data-price="${product.price}">
                            ${vnd(parseInt(product.price))}
                        </span>
                    </div>
                    <p class="product-note"><i class="fa-light fa-pencil"></i><span>${item.note}</span></p>
                    <div class="cart-item-control">
                        <button class="cart-item-delete" onclick="deleteCartItem('${product._id}', this)">Xóa</button>
                        <div class="buttons_added">
                            <input class="minus is-form" type="button" value="-" onclick="decreasingNumber(this)">
                            <input class="input-qty" max="100" min="1" name="" type="number" value="${item.quantity}">
                            <input class="plus is-form" type="button" value="+" onclick="increasingNumber(this)">
                        </div>
                    </div>
                </li>`;
            } else {
                console.error(`Product with ID ${item.id} not found.`);
            }
        }

        document.querySelector('.cart-list').innerHTML = productcarthtml;
        updateCartTotal();
        saveAmountCart();
    } else {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
    }

    let modalCart = document.querySelector('.modal-cart');
    let containerCart = document.querySelector('.cart-container');
    let themmon = document.querySelector('.them-mon');

    modalCart.onclick = function () {
        closeCart();
    };

    themmon.onclick = function () {
        closeCart();
    };

    containerCart.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}


// Delete cart item
function deleteCartItem(id, el) {
    let cartParent = el.parentNode.parentNode;
    cartParent.remove();
    let currentUser = JSON.parse(sessionStorage.getItem('currentuser'));
    let vitri = currentUser.cart.findIndex(item => item.id = id)
    currentUser.cart.splice(vitri, 1);

    // Nếu trống thì hiển thị giỏ hàng trống
    if (currentUser.cart.length == 0) {
        document.querySelector('.gio-hang-trong').style.display = 'flex';
        document.querySelector('button.thanh-toan').classList.add('disabled');
    }
    sessionStorage.setItem('currentuser', JSON.stringify(currentUser));
    updateCartTotal();
}

//Update cart total
async function updateCartTotal() {
    try {
        const total = await getCartTotal();
        document.querySelector('.text-price').innerText = vnd(total);
    } catch (error) {
        console.error(error);
    }
}

async function getCartTotal() {
    try {
        let currentUser = JSON.parse(sessionStorage.getItem('currentuser'));
        let tongtien = 0;
        if (currentUser != null) {
            for (let item of currentUser.cart) {
                let product = await getProduct(item.id);
                tongtien += parseInt(item.quantity) * parseInt(product.price);
            }
        }
        return tongtien;
    } catch (error) {
        throw error;
    }
}



// Get Product 
async function getProduct(item) {
    const products = await getProductData();
    let infoProductCart = products.find(sp => item === sp._id);
    let product = {
        ...infoProductCart,
        ...item
    };
    return product;
}


window.onload = updateAmount();
window.onload = updateCartTotal();

// Lay so luong hang

function getAmountCart() {
    let currentuser = JSON.parse(sessionStorage.getItem('currentuser'))
    let amount = 0;
    currentuser.cart.forEach(element => {
        amount += parseInt(element.quantity);
    });
    return amount;
}

//Update Amount Cart 
function updateAmount() {
    if (sessionStorage.getItem('currentuser') != null) {
        let amount = getAmountCart();
        document.querySelector('.count-product-cart').innerText = amount;
    }
}

// Save Cart Info
function saveAmountCart() {
    let cartAmountbtn = document.querySelectorAll(".cart-item-control .is-form");
    let listProduct = document.querySelectorAll('.cart-item');
    let currentUser = JSON.parse(sessionStorage.getItem('currentuser'));
    cartAmountbtn.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            let id = listProduct[parseInt(index / 2)].getAttribute("data-id");
            let productId = currentUser.cart.find(item => {
                return item.id == id;
            });
            productId.quantity = parseInt(listProduct[parseInt(index / 2)].querySelector(".input-qty").value);
            sessionStorage.setItem('currentuser', JSON.stringify(currentUser));
            updateCartTotal();
        })
    });
}

// Open & Close Cart
function openCart() {
    showCart();
    document.querySelector('.modal-cart').classList.add('open');
    body.style.overflow = "hidden";
}

function closeCart() {
    document.querySelector('.modal-cart').classList.remove('open');
    body.style.overflow = "auto";
    updateAmount();
}

// Open Search Advanced
document.querySelector(".filter-btn").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".advanced-search").classList.toggle("open");
    document.getElementById("home-service").scrollIntoView();
})

document.querySelector(".form-search-input").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("home-service").scrollIntoView();
})

function closeSearchAdvanced() {
    document.querySelector(".advanced-search").classList.toggle("open");
}

//Open Search Mobile 
function openSearchMb() {
    document.querySelector(".header-middle-left").style.display = "none";
    document.querySelector(".header-middle-center").style.display = "block";
    document.querySelector(".header-middle-right-item.close").style.display = "block";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "none", "important")
    }
}

//Close Search Mobile 
function closeSearchMb() {
    document.querySelector(".header-middle-left").style.display = "block";
    document.querySelector(".header-middle-center").style.display = "none";
    document.querySelector(".header-middle-right-item.close").style.display = "none";
    let liItem = document.querySelectorAll(".header-middle-right-item.open");
    for (let i = 0; i < liItem.length; i++) {
        liItem[i].style.setProperty("display", "block", "important")
    }
}

//Signup && Login Form

// Chuyen doi qua lai SignUp & Login 
let signup = document.querySelector('.signup-link');
let login = document.querySelector('.login-link');
let signup2 = document.querySelector('.signup-link-2');
let login2 = document.querySelector('.login-link-2');
let forgot = document.querySelector('.forgot-link');
let container = document.querySelector('.signup-login .modal-container');

login.addEventListener('click', () => {
    document.querySelector('.form-content.login').style.display = "block";
    document.querySelector('.form-content.sign-up').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    container.classList.add('active');
})

signup.addEventListener('click', () => {
    document.querySelector('.form-content.sign-up').style.display = "block";
    document.querySelector('.form-content.login').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    container.classList.remove('active');
})
login2.addEventListener('click', () => {
    document.querySelector('.form-content.login').style.display = "block";
    document.querySelector('.form-content.sign-up').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    container.classList.add('active');
})

signup2.addEventListener('click', () => {
    document.querySelector('.form-content.sign-up').style.display = "block";
    document.querySelector('.form-content.login').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    container.classList.remove('active');
})
forgot.addEventListener('click', () => {
    document.querySelector('.form-content.forgot').style.display = "block";
    document.querySelector('.form-content.login').style.display = "none";
    document.querySelector('.form-content.sign-up').style.display = "none";
    container.classList.add('active');
})


let signupbtn = document.getElementById('signup');
let loginbtn = document.getElementById('login');
let formsg = document.querySelector('.modal.signup-login');

signupbtn.addEventListener('click', () => {
    document.querySelector('.form-content.sign-up').style.display = "block";
    document.querySelector('.form-content.login').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    formsg.classList.add('open');
    container.classList.remove('active');
    document.body.style.overflow = "hidden";
});

loginbtn.addEventListener('click', () => {
    document.querySelector('.form-message-check-login').innerHTML = '';
    document.querySelector('.form-content.login').style.display = "block";
    document.querySelector('.form-content.sign-up').style.display = "none";
    document.querySelector('.form-content.forgot').style.display = "none";
    formsg.classList.add('open');
    container.classList.add('active');
    document.body.style.overflow = "hidden";
});


// Dang nhap & Dang ky

// Chức năng đăng ký
let signupButton = document.getElementById('signup-button');
let loginButton = document.getElementById('login-button');
let forgotButton = document.getElementById('forgot-button');
signupButton.addEventListener('click', async () => {
    event.preventDefault();
    let usernameUser = document.getElementById('username').value;
    let emailUser = document.getElementById('email').value;
    let passwordUser = document.getElementById('password').value;
    let passwordConfirmation = document.getElementById('password_confirmation').value;
    let checkSignup = document.getElementById('checkbox-signup').checked;
    // Check validate
    if (usernameUser.length == 0) {
        document.querySelector('.form-message-username').innerHTML = 'Vui lòng tài khoản';
        document.getElementById('username').focus();
    } else {
        document.querySelector('.form-message-username').innerHTML = '';
    }
    if (emailUser.length === 0) {
        document.querySelector('.form-message-email').innerHTML = 'Vui lòng nhập email';
    } else {
        document.querySelector('.form-message-email').innerHTML = '';
    }
    if (passwordUser.length == 0) {
        document.querySelector('.form-message-password').innerHTML = 'Vui lòng nhập mật khẩu';
    } else {
        document.querySelector('.form-message-password').innerHTML = '';
    }
    if (passwordConfirmation.length == 0) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Vui lòng nhập lại mật khẩu';
    } else if (passwordConfirmation !== passwordUser) {
        document.querySelector('.form-message-password-confi').innerHTML = 'Mật khẩu không khớp';
        document.getElementById('password_confirmation').value = '';
    } else {
        document.querySelector('.form-message-password-confi').innerHTML = '';
    }
    if (checkSignup != true) {
        document.querySelector('.form-message-checkbox').innerHTML = 'Vui lòng check đăng ký';
    } else {
        document.querySelector('.form-message-checkbox').innerHTML = '';
    }

    const userData = {
        username: usernameUser,
        email: emailUser,
        password: passwordUser
    };

    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const responseData = await response.json();
        if (response.ok) {
            toast({ title: 'Thành công', message: 'Tạo thành công tài khoản !', type: 'success', duration: 3000 });
            closeModal();
            kiemtradangnhap();
            updateAmount();
        } else {
            let errorMessage = 'Đã xảy ra lỗi khi tạo tài khoản.';

            if (responseData && responseData.data && Array.isArray(responseData.data)) {
                errorMessage = '';
                responseData.data.forEach(error => {
                    errorMessage += `${error.msg}<br>`;
                });
            }
            toast({ title: 'Thất bại', message: errorMessage, type: 'error', duration: 3000 });
        }
    } catch (error) {
        console.error('Error:', error);
        toast({ title: 'Lỗi', message: 'Đã xảy ra lỗi khi gửi yêu cầu đăng ký tài khoản.', type: 'error', duration: 3000 });
    }
}
)

// Dang nhap
loginButton.addEventListener('click', async () => {
    event.preventDefault();
    let usernamelog = document.getElementById('username-login').value;
    let passlog = document.getElementById('password-login').value;

    if (usernamelog.length == 0) {
        document.querySelector('.form-message.usernamelog').innerHTML = 'Vui lòng nhập tài khoản';
    } else {
        document.querySelector('.form-message.usernamelog').innerHTML = '';
    }

    if (passlog.length == 0) {
        document.querySelector('.form-message-check-login').innerHTML = 'Vui lòng nhập mật khẩu';
    } else {
        document.querySelector('.form-message-check-login').innerHTML = '';
    }

    if (usernamelog && passlog) {
        const userData = {
            username: usernamelog,
            password: passlog
        };

        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const responseData = await response.json();
            if (response.ok) {
                document.cookie = "kento=" + responseData.data + "; expires=" + new Date(Date.now() + 3600 * 1000).toUTCString() + "; path=/;";
                toast({ title: 'Success', message: 'Đăng nhập thành công', type: 'success', duration: 3000 });
                closeModal();
                kiemtradangnhap();
                checkAdmin();
                updateAmount();

            } else {
                toast({ title: 'Error', message: responseData.data, type: 'error', duration: 3000 });
            }
        } catch (error) {
            console.error('Error:', error);
            toast({ title: 'Lỗi', message: 'Đã xảy ra lỗi khi gửi yêu cầu đăng nhập.', type: 'error', duration: 3000 });
        }
    }
});

forgotButton.addEventListener('click', async () => {
    event.preventDefault();
    let emailForgot = document.getElementById('email-forgot').value;

    if (emailForgot.length === 0) {
        document.querySelector('.form-message-email-forgot').innerHTML = 'Vui lòng nhập email';
    } else {
        document.querySelector('.form-message-email-forgot').innerHTML = '';

        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/forgotpassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: emailForgot })
            });

            const responseData = await response.json();
            if (response.ok) {
                toast({ title: 'Success', message: responseData.data, type: 'success', duration: 3000 });
            } else {
                toast({ title: 'Error', message: responseData.data, type: 'error', duration: 3000 });
            }
        } catch (error) {
            toast({ title: 'Lỗi', message: 'Đã xảy ra lỗi khi gửi yêu cầu quên mật khẩu.', type: 'error', duration: 3000 });
        }
    }
});


// Kiểm tra xem có tài khoản đăng nhập không ?
async function kiemtradangnhap() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.querySelector('.auth-container').innerHTML = `<span class="text-dndk">Tài khoản</span>
            <span class="text-tk">${userData.data.username} <i class="fa-sharp fa-solid fa-caret-down"></span>`
            document.querySelector('.header-middle-right-menu').innerHTML = `<li><a href="javascript:;" onclick="myAccount()"><i class="fa-light fa-circle-user"></i> Tài khoản của tôi</a></li>
                <li><a href="javascript:;" onclick="orderHistory()"><i class="fa-regular fa-bags-shopping"></i> Đơn hàng đã mua</a></li>
                <li class="border"><a id="logout" href="javascript:;"><i class="fa-light fa-right-from-bracket"></i> Thoát tài khoản</a></li>`
            document.querySelector('#logout').addEventListener('click', logOut);
        } else {
        }
    } catch (error) {
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

function logOut() {
    document.cookie = 'kento=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location = "/";
}


async function checkAdmin() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            if (userData.data && userData.data.role && userData.data.role.includes('ADMIN')) {
                const node = document.createElement('li');
                node.innerHTML = `<a href="./admin.html"><i class="fa-light fa-gear"></i> Quản lý cửa hàng</a>`;
                document.querySelector('.header-middle-right-menu').prepend(node);
            }
        } else {
        }
    } catch (error) {
    }
}


window.onload = kiemtradangnhap();
window.onload = checkAdmin();

// Chuyển đổi trang chủ và trang thông tin tài khoản
function myAccount() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.remove('open');
    document.getElementById('account-user').classList.add('open');
    userInfo();
}

// Chuyển đổi trang chủ và trang xem lịch sử đặt hàng 
function orderHistory() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('account-user').classList.remove('open');
    document.getElementById('trangchu').classList.add('hide');
    document.getElementById('order-history').classList.add('open');
    renderOrderProduct();
}

function emailIsValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function phoneIsValid(phone) {
    return /^(0|\+84)\d{9,10}$/.test(phone);
}

async function userInfo() {
    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            const user = userData.data;
            document.getElementById('infousername').value = user.username || '';
            document.getElementById('infoemail').value = user.email || '';
            document.getElementById('infophone').value = user.phone || '';
            document.getElementById('infoaddress').value = user.address || '';
        } else {
        }
    } catch (error) {
    }
}


// Thay doi thong tin
async function changeInformation() {
    try {
        const meResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (meResponse.ok) {
            const userData = await meResponse.json();
            const user = userData.data;

            let infoemail = document.getElementById('infoemail').value;
            let infophone = document.getElementById('infophone').value;
            let infoaddress = document.getElementById('infoaddress').value;

            if (infoemail.length > 0) {
                if (!emailIsValid(infoemail)) {
                    document.querySelector('.inforemail-error').innerHTML = 'Vui lòng nhập lại email!';
                    infoemail.value = '';
                } else {
                    user.email = infoemail;
                }
            }

            if (infophone.length > 0) {
                if (!phoneIsValid(infophone)) {
                    document.querySelector('.inforphone-error').innerHTML = 'Vui lòng nhập lại số điện thoại!';
                    infophone.value = '';
                } else {
                    user.phone = infophone;
                }
            }

            if (infoaddress.length > 0) {
                user.address = infoaddress;
            }

            const updateResponse = await fetch(`http://localhost:3000/api/v1/users/${user._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify(user)
            });

            const responseData = await updateResponse.json();
            if (updateResponse.ok) {
                kiemtradangnhap();
                toast({ title: 'Success', message: 'Cập nhật thông tin thành công!', type: 'success', duration: 3000 });
            } else {
                toast({ title: 'Error', message: responseData.data, type: 'error', duration: 3000 });
            }
        } else {
            console.error('Error fetching user data:', meResponse.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Đổi mật khẩu 
async function changePassword() {
    let passwordCur = document.getElementById('password-cur-info');
    let passwordAfter = document.getElementById('password-after-info');
    let passwordConfirm = document.getElementById('password-comfirm-info');
    let check = true;
    if (passwordCur.value.length == 0) {
        document.querySelector('.password-cur-info-error').innerHTML = 'Vui lòng nhập mật khẩu hiện tại';
        check = false;
    } else {
        document.querySelector('.password-cur-info-error').innerHTML = '';
    }

    if (passwordAfter.value.length == 0) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        check = false;
    } else {
        document.querySelector('.password-after-info-error').innerHTML = '';
    }

    if (passwordConfirm.value.length == 0) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (passwordAfter.value !== passwordConfirm.value) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu xác nhận không khớp';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (check) {
        try {
            const response = await fetch('http://localhost:3000/api/v1/auth/changepassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    oldpassword: passwordCur.value,
                    newpassword: passwordAfter.value
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                console.log(responseData);
                toast({ title: 'Success', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
            } else {
                let errorMessage = 'Đã xảy ra lỗi khi đổi mật khẩu.';
                if (responseData && responseData.data) {
                    if (typeof responseData.data === 'string') {
                        errorMessage = responseData.data;
                    } else if (Array.isArray(responseData.data)) {
                        errorMessage = '';
                        responseData.data.forEach(error => {
                            errorMessage += `${error.msg}<br>`;
                        });
                    }
                }
                toast({ title: 'Error', message: errorMessage || 'Đã xảy ra lỗi khi đổi mật khẩu.', type: 'error', duration: 3000 });
            }

        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu:', error);
            toast({ title: 'Error', message: 'Đã xảy ra lỗi khi đổi mật khẩu.', type: 'error', duration: 3000 });
        }
    }
}

async function getProductInfo(id) {
    const products = await getProductData();
    return products.find(item => {
        return item._id == id;
    })
}

// Quan ly don hang
async function renderOrderProduct() {
    try {
        // Gọi API để lấy thông tin người dùng hiện tại
        const userResponse = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (userResponse.ok) {
            // Lấy dữ liệu người dùng từ phản hồi API
            const userData = await userResponse.json();
            const userId = userData.data._id; // Lấy user id từ dữ liệu đã lấy

            // Gọi API để lấy tất cả đơn hàng
            const orderResponse = await fetch('http://localhost:3000/api/v1/orders', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (orderResponse.ok) {
                const orders = await orderResponse.json();
                let orderHtml = "";

                // Lọc ra các đơn hàng thuộc về người dùng hiện tại
                const userOrders = orders.filter(order => order.user?._id === userId);

                if (userOrders.length === 0) {
                    orderHtml = `<div class="empty-order-section"><img src="./assets/img/empty-order.jpg" alt="" class="empty-order-img"><p>Chưa có đơn hàng nào</p></div>`;
                } else {
                    for (const item of userOrders) {
                        let productHtml = `<div class="order-history-group">`;
                        for (const sp of item.items) {
                            // Lấy thông tin sản phẩm từ hàm getProductInfo
                            const imageUrl = sp.product.images[0].url;

                            // Kiểm tra nếu sản phẩm tồn tại
                            
                                // Tạo HTML cho mỗi sản phẩm trong đơn hàng
                                productHtml += `<div class="order-history">
                                    <div class="order-history-left">
                                        <img src="${imageUrl}" alt=""> 
                                        <div class="order-history-info">
                                            <h4>${sp.product.name}</h4>
                                            <p class="order-history-note"><i class="fa-light fa-pen"></i> ${item.note}</p>
                                            <p class="order-history-quantity">x${sp.quantity}</p>
                                        </div>
                                    </div>
                                    <div class="order-history-right">
                                        <div class="order-history-price">
                                            <span class="order-history-current-price">${vnd(sp.price)}</span>
                                        </div>                         
                                    </div>
                                </div>`;
                            
                        }
                        let textCompl = item.status == 'Đang xử lý' ? "Đã xử lý" : "Đang chờ xử lý";
                        let classCompl = item.status == 'Đang xử lý' ? "complete" : "no-complete";
                        productHtml += `<div class="order-history-control">
                            <div class="order-history-status">
                                <span class="order-history-status-sp ${classCompl}">${textCompl}</span>
                                <button id="order-history-detail" onclick="detailOrder('${item._id}')"><i class="fa-regular fa-eye"></i> Xem chi tiết</button>
                            </div>
                            <div class="order-history-total">
                                <span class="order-history-total-desc">Tổng tiền: </span>
                                <span class="order-history-toltal-price">${vnd(item.totalAmount)}</span>
                            </div>
                        </div>`;
                        productHtml += `</div>`;
                        orderHtml += productHtml;
                    }
                }
                document.querySelector(".order-history-section").innerHTML = orderHtml;
            } else {
                // Xử lý khi có lỗi khi gọi API lấy đơn hàng
                console.error('Đã có lỗi khi gọi API lấy đơn hàng.');
            }
        } else {
            // Xử lý khi có lỗi khi gọi API lấy thông tin người dùng
            console.error('Đã có lỗi khi gọi API lấy thông tin người dùng.');
        }
    } catch (error) {
        // Xử lý khi có lỗi không xác định
        console.error('Đã có lỗi không xác định khi thực hiện render đơn hàng.', error);
    }
}


// Get Order Details
function getOrderDetails(madon) {
    let orderDetails = sessionStorage.getItem("orderDetails") ? JSON.parse(sessionStorage.getItem("orderDetails")) : [];
    let ctDon = [];
    orderDetails.forEach(item => {
        if (item.madon == madon) {
            ctDon.push(item);
        }
    });
    return ctDon;
}

// Format Date
function formatDate(date) {
    let fm = new Date(date);
    let yyyy = fm.getFullYear();
    let mm = fm.getMonth() + 1;
    let dd = fm.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    return dd + '/' + mm + '/' + yyyy;
}

// Xem chi tiet don hang
async function detailOrder(id) {
    try {
        // Gọi API để lấy thông tin người dùng hiện tại
        const responseUser = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (responseUser.ok) {
           
            // Gọi API để lấy chi tiết đơn hàng
            const responseOrder = await fetch(`http://localhost:3000/api/v1/orders/${id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });

            if (responseOrder.ok) {
                // Lấy dữ liệu chi tiết đơn hàng từ dữ liệu trả về
                const orderData = await responseOrder.json();
                const detail = orderData.data[0]; // Lấy dữ liệu từ mảng data

                // Tạo HTML để hiển thị thông tin chi tiết đơn hàng
                document.querySelector(".modal.detail-order").classList.add("open");
                let detailOrderHtml = `<ul class="detail-order-group">
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-calendar-days"></i> Ngày đặt hàng</span>
                        <span class="detail-order-item-right">${formatDate(detail.createdAt)}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-truck"></i> Hình thức giao</span>
                        <span class="detail-order-item-right">${detail.type}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-clock"></i> Ngày nhận hàng</span>
                        <span class="detail-order-item-right">${(detail.shiptime == "" ? "" : (detail.shiptime + " - ")) + formatDate(detail.updatedAt)}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-location-dot"></i> Địa điểm nhận</span>
                        <span class="detail-order-item-right">${detail.address}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-thin fa-person"></i> Người nhận</span>
                        <span class="detail-order-item-right">${detail.client}</span>
                    </li>
                    <li class="detail-order-item">
                        <span class="detail-order-item-left"><i class="fa-light fa-phone"></i> Số điện thoại nhận</span>
                        <span class="detail-order-item-right">${detail.phonenum}</span>
                    </li>
                </ul>`;

                // Hiển thị thông tin chi tiết đơn hàng trong modal
                document.querySelector(".detail-order-content").innerHTML = detailOrderHtml;
            } else {
                // Xử lý khi có lỗi khi gọi API lấy chi tiết đơn hàng
                console.error('Đã có lỗi khi gọi API lấy chi tiết đơn hàng.');
            }
        } else {
            // Xử lý khi có lỗi khi gọi API lấy thông tin người dùng
            console.error('Đã có lỗi khi gọi API lấy thông tin người dùng.');
        }
    } catch (error) {
        // Xử lý khi có lỗi không xác định
        console.error('Đã có lỗi không xác định khi thực hiện lấy chi tiết đơn hàng.', error);
    }
}



// Create id order 
function createId(arr) {
    let id = arr.length + 1;
    let check = arr.find(item => item.id == "DH" + id)
    while (check != null) {
        id++;
        check = arr.find(item => item.id == "DH" + id)
    }
    return "DH" + id;
}

// Back to top
window.onscroll = () => {
    let backtopTop = document.querySelector(".back-to-top")
    if (document.documentElement.scrollTop > 100) {
        backtopTop.classList.add("active");
    } else {
        backtopTop.classList.remove("active");
    }
}

// Auto hide header on scroll
const headerNav = document.querySelector(".header-bottom");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
    if (lastScrollY < window.scrollY) {
        headerNav.classList.add("hide")
    } else {
        headerNav.classList.remove("hide")
    }
    lastScrollY = window.scrollY;
})

// Page
function renderProducts(showProduct) {
    let productHtml = '';
    if (showProduct.length === 0) {

        document.getElementById("home-title").style.display = "none";
        productHtml = `<div class="no-result">
            <div class="no-result-h">Tìm kiếm không có kết quả</div>
            <div class="no-result-p">Xin lỗi, chúng tôi không thể tìm được kết quả hợp với tìm kiếm của bạn</div>
            <div class="no-result-i"><i class="fa-light fa-face-sad-cry"></i></div>
        </div>`;
    } else {
        document.getElementById("home-title").style.display = "block";
        showProduct.forEach((product) => {
            productHtml += `<div class="col-product">
                <article class="card-product" >
                    <div class="card-header">
                        <a href="#" class="card-image-link" onclick="detailProduct('${product._id}')">
                            <img class="card-image" src="${product.images[0].url}" alt="${product.name}">
                        </a>
                    </div>
                    <div class="food-info">
                        <div class="card-content">
                            <div class="card-title">
                                <a href="#" class="card-title-link" onclick="detailProduct('${product._id}')">${product.name}</a>
                            </div>
                        </div>
                        <div class="card-footer">
                            <div class="product-price">
                                <span class="current-price">${vnd(product.price)}</span>
                            </div>
                            <div class="product-buy">
                                <button onclick="detailProduct('${product._id}')" class="card-button order-item"><i class="fa-regular fa-cart-shopping-fast"></i> Đặt món</button>
                            </div> 
                        </div>
                    </div>
                </article>
            </div>`;
        });
    }
    document.getElementById('home-products').innerHTML = productHtml;
}


async function searchProducts(mode) {
    try {
        // Lấy dữ liệu từ API
        const products = await getProductData();

        let valeSearchInput = document.querySelector('.form-search-input').value;
        let valueCategory = document.getElementById("advanced-search-category-select").value;
        let minPrice = document.getElementById("min-price").value;
        let maxPrice = document.getElementById("max-price").value;
        if (parseInt(minPrice) > parseInt(maxPrice) && minPrice != "" && maxPrice != "") {
            alert("Giá đã nhập sai !");
        }

        let result = valueCategory == "Tất cả" ? products : products.filter((item) => {
            return item.category == valueCategory;
        });

        result = valeSearchInput == "" ? result : result.filter(item => {
            return item.name.toString().toUpperCase().includes(valeSearchInput.toString().toUpperCase());
        })

        if (minPrice == "" && maxPrice != "") {
            result = result.filter((item) => item.price <= maxPrice);
        } else if (minPrice != "" && maxPrice == "") {
            result = result.filter((item) => item.price >= minPrice);
        } else if (minPrice != "" && maxPrice != "") {
            result = result.filter((item) => item.price <= maxPrice && item.price >= minPrice);
        }

        document.getElementById("home-service").scrollIntoView();
        switch (mode) {
            case 0:
                // Không cần thay đổi vì đã lấy dữ liệu mới từ API
                document.querySelector('.form-search-input').value = "";
                document.getElementById("advanced-search-category-select").value = "Tất cả";
                document.getElementById("min-price").value = "";
                document.getElementById("max-price").value = "";
                break;
            case 1:
                result.sort((a, b) => a.price - b.price)
                break;
            case 2:
                result.sort((a, b) => b.price - a.price)
                break;
        }
        showHomeProduct(result);
    } catch (error) {
        console.error('Error searching products:', error.message);
    }
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
    renderProducts(productShow);
}

function showHomeProduct(products) {
    // Lọc các sản phẩm không bị xóa
    let productAll = products.filter(item => !item.isDeleted);
    // Hiển thị danh sách sản phẩm và thiết lập phân trang
    displayList(productAll, perPage, currentPage);
    setupPagination(productAll, perPage, currentPage);
}


window.onload = async function () {
    const products = await getProductData();
    showHomeProduct(products);
};


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
    node.innerHTML = `<a href="javascript:;">${page}</a>`;
    if (currentPage == page) node.classList.add('active');
    node.addEventListener('click', function () {
        currentPage = page;
        displayList(productAll, perPage, currentPage);
        let t = document.querySelectorAll('.page-nav-item.active');
        for (let i = 0; i < t.length; i++) {
            t[i].classList.remove('active');
        }
        node.classList.add('active');
        document.getElementById("home-service").scrollIntoView();
    })
    return node;
}

async function showCategory(categoryId) {
    try {
        // Lấy dữ liệu sản phẩm từ API
        const products = await getProductData();

        document.getElementById('trangchu').classList.remove('hide');
        document.getElementById('account-user').classList.remove('open');
        document.getElementById('order-history').classList.remove('open');

        console.log(products);
        // Lọc các sản phẩm thuộc danh mục được chọn
        let productSearch = products.filter(value => {
            return value.category._id === categoryId;
        });

        let currentPageSeach = 1;
        displayList(productSearch, perPage, currentPageSeach);
        setupPagination(productSearch, perPage, currentPageSeach);
        document.getElementById("home-title").scrollIntoView();
    } catch (error) {
        console.error('Error showing category:', error.message);
    }
}
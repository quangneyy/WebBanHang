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
const PHIVANCHUYEN = 30000;
let priceFinal = document.getElementById("checkout-cart-price-final");
// Trang thanh toan
async function thanhtoanpage(option, product) {
    // Xu ly ngay nhan hang
    let today = new Date();
    let ngaymai = new Date();
    let ngaykia = new Date();
    ngaymai.setDate(today.getDate() + 1);
    ngaykia.setDate(today.getDate() + 2);
    let dateorderhtml = `<a href="javascript:;" class="pick-date active" data-date="${today}">
        <span class="text">Hôm nay</span>
        <span class="date">${today.getDate()}/${today.getMonth() + 1}</span>
        </a>
        <a href="javascript:;" class="pick-date" data-date="${ngaymai}">
            <span class="text">Ngày mai</span>
            <span class="date">${ngaymai.getDate()}/${ngaymai.getMonth() + 1}</span>
        </a>

        <a href="javascript:;" class="pick-date" data-date="${ngaykia}">
            <span class="text">Ngày kia</span>
            <span class="date">${ngaykia.getDate()}/${ngaykia.getMonth() + 1}</span>
    </a>`;
    document.querySelector('.date-order').innerHTML = dateorderhtml;

    let pickdate = document.getElementsByClassName('pick-date');
    for (let i = 0; i < pickdate.length; i++) {
        pickdate[i].onclick = function () {
            document.querySelector(".pick-date.active").classList.remove("active");
            this.classList.add('active');
        };
    }

    let totalBillOrder = document.querySelector('.total-bill-order');
    let totalBillOrderHtml = "";

    // Xu ly don hang
    switch (option) {
        case 1:
            // Hiển thị đơn hàng
            showProductCart();
            // Tính tiền và cập nhật giao diện
            try {
                let cartTotal = await getCartTotal();
                 
                let totalBill = cartTotal + PHIVANCHUYEN;
                totalBillOrderHtml = `<div class="priceFlx">
                    <div class="text">
                        Tiền hàng 
                        <span class="count">${getAmountCart()} món</span>
                    </div>
                    <div class="price-detail">
                        <span id="checkout-cart-total">${vnd(cartTotal)}</span>
                    </div>
                </div>
                <div class="priceFlx chk-ship">
                    <div class="text">Phí vận chuyển</div>
                    <div class="price-detail chk-free-ship">
                        <span>${vnd(PHIVANCHUYEN)}</span>
                    </div>
                </div>`;
                priceFinal.innerText = vnd(totalBill);
                totalBillOrder.innerHTML = totalBillOrderHtml;
            } catch (error) {
                console.error(error);
            }
            break;

        case 2:
            // Hiển thị sản phẩm mua ngay
            showProductBuyNow(product);
            // Tính tiền và cập nhật giao diện
            try {
                let productTotal = product.quantity * product.price;
                 
                let totalBillWithoutShipping = productTotal + PHIVANCHUYEN;
                totalBillOrderHtml = `<div class="priceFlx">
                    <div class="text">
                        Tiền hàng 
                        <span class="count">${product.quantity} món</span>
                    </div>
                    <div class="price-detail">
                        <span id="checkout-cart-total">${vnd(productTotal)}</span>
                    </div>
                </div>
                <div class="priceFlx chk-ship">
                    <div class="text">Phí vận chuyển</div>
                    <div class="price-detail chk-free-ship">
                        <span>${vnd(PHIVANCHUYEN)}</span>
                    </div>
                </div>`;
                priceFinal.innerText = vnd(totalBillWithoutShipping);
                totalBillOrder.innerHTML = totalBillOrderHtml;
            } catch (error) {
                console.error(error);
            }
            break;
    }

    // Xu ly hinh thuc giao hang
    let giaotannoi = document.querySelector('#giaotannoi');
    let tudenlay = document.querySelector('#tudenlay');
    let tudenlayGroup = document.querySelector('#tudenlay-group');
    let chkShip = document.querySelectorAll(".chk-ship");
    
    tudenlay.addEventListener('click', async () => {
        giaotannoi.classList.remove("active");
        tudenlay.classList.add("active");
        chkShip.forEach(item => {
            item.style.display = "none";
        });
        tudenlayGroup.style.display = "block";
        switch (option) {
            case 1:
                try {
                    let cartTotal = await getCartTotal();
                    priceFinal.innerText = vnd(cartTotal);
                } catch (error) {
                    console.error(error);
                }
                break;
            case 2:
                priceFinal.innerText = vnd((product.quantity * product.price));
                break;
        }
    });

    giaotannoi.addEventListener('click', async () => {
        tudenlay.classList.remove("active");
        giaotannoi.classList.add("active");
        tudenlayGroup.style.display = "none";
        chkShip.forEach(item => {
            item.style.display = "flex";
        });
        switch (option) {
            case 1:
                try {
                    let cartTotal = await getCartTotal();

                    priceFinal.innerText = vnd(cartTotal + PHIVANCHUYEN);
                } catch (error) {
                    console.error(error);
                }
                break;
            case 2:

                priceFinal.innerText = vnd((product.quantity * product.price) + PHIVANCHUYEN);
                break;
        }
    });
    

    // Su kien khu nhan nut dat hang
    document.querySelector(".complete-checkout-btn").onclick = () => {
        switch (option) {
            case 1:
                xulyDathang();
                break;
            case 2:
                xulyDathang(product);
                break;
        }
    };
}

// Hien thi hang trong gio
async function showProductCart() {
    let currentuser = JSON.parse(sessionStorage.getItem('currentuser'));
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = '';
    for (const item of currentuser.cart) {
        let product = await getProduct(item);
        listOrderHtml += `<div class="food-total">
            <div class="count">${item.quantity}x</div>
            <div class="info-food">
                <div class="name-food">${product.name}</div>
            </div>
        </div>`;
    }
    listOrder.innerHTML = listOrderHtml;
}


// Hien thi hang mua ngay
function showProductBuyNow(product) {
    let listOrder = document.getElementById("list-order-checkout");
    let listOrderHtml = `<div class="food-total">
        <div class="count">${product.quantity}x</div>
        <div class="info-food">
            <div class="name-food">${product.title}</div>
        </div>
    </div>`;
    listOrder.innerHTML = listOrderHtml;
}

//Open Page Checkout
let nutthanhtoan = document.querySelector('.thanh-toan')
let checkoutpage = document.querySelector('.checkout-page');
nutthanhtoan.addEventListener('click', () => {
    checkoutpage.classList.add('active');
    thanhtoanpage(1);
    closeCart();
    body.style.overflow = "hidden"
})

// Đặt hàng ngay
function dathangngay() {
    let productInfo = document.getElementById("product-detail-content");
    let datHangNgayBtn = productInfo.querySelector(".button-dathangngay");
    datHangNgayBtn.onclick = () => {
        if(sessionStorage.getItem('currentuser')) {
            let productId = datHangNgayBtn.getAttribute("data-product");
            let quantity = parseInt(productInfo.querySelector(".buttons_added .input-qty").value);
            let notevalue = productInfo.querySelector("#popup-detail-note").value;
            let ghichu = notevalue == "" ? "Không có ghi chú" : notevalue;
            let products = JSON.parse(sessionStorage.getItem('products'));
            let a = products.find(item => item.id == productId);
            a.quantity = parseInt(quantity);
            a.note = ghichu;
            checkoutpage.classList.add('active');
            thanhtoanpage(2,a);
            closeCart();
            body.style.overflow = "hidden"
        } else {
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    }
}

// Close Page Checkout
function closecheckout() {
    checkoutpage.classList.remove('active');
    body.style.overflow = "auto"
}

// Thong tin cac don hang da mua - Xu ly khi nhan nut dat hang
async function xulyDathang(product) {
    let diachinhan = "";
    let hinhthucgiao = "";
    let thoigiangiao = "";
    let giaotannoi = document.querySelector("#giaotannoi");
    let tudenlay = document.querySelector("#tudenlay");
    let giaongay = document.querySelector("#giaongay");
    let giaovaogio = document.querySelector("#deliverytime");
    let currentUser = JSON.parse(sessionStorage.getItem('currentuser'));
    let note = ""; // Khai báo biến để lưu ghi chú

    try {
        const response = await fetch('http://localhost:3000/api/v1/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
       
        if (response.ok) {
            // Đã đăng nhập
            const userData = await response.json();
            const userId = userData._id; // Lấy user id từ dữ liệu đã lấy
            console.log(userId);
            // Hinh thuc giao & Dia chi nhan hang
            if (giaotannoi.classList.contains("active")) {
                diachinhan = document.querySelector("#diachinhan").value;
                hinhthucgiao = giaotannoi.innerText;
            }
            if (tudenlay.classList.contains("active")) {
                let chinhanh1 = document.querySelector("#chinhanh-1");
                let chinhanh2 = document.querySelector("#chinhanh-2");
                if (chinhanh1.checked) {
                    diachinhan = "273 An Dương Vương, Phường 3, Quận 5";
                }
                if (chinhanh2.checked) {
                    diachinhan = "04 Tôn Đức Thắng, Phường Bến Nghé, Quận 1";
                }
                hinhthucgiao = tudenlay.innerText;
            }

            // Thoi gian nhan hang
            if (giaongay.checked) {
                thoigiangiao = "Giao ngay khi xong";
            }

            if (giaovaogio.checked) {
                thoigiangiao = document.querySelector(".choise-time").value;
            }

            let orderDetails = sessionStorage.getItem("orderDetails") ? JSON.parse(sessionStorage.getItem("orderDetails")) : [];
            let order = sessionStorage.getItem("order") ? JSON.parse(sessionStorage.getItem("order")) : [];
            let madon = createId(order);
            let tongtien = 0;

            try {
                if (product === undefined) {
                    for (const item of currentUser.cart) {
                        item.madon = madon;
                        item.price = await getpriceProduct(item.id); // Chờ lấy giá sản phẩm
                        tongtien += item.price * item.quantity;
                        orderDetails.push(item);
                        note = item.note; // Lấy ghi chú từ mục sản phẩm
                    }
                } else {
                    product.madon = madon;
                    product.price = await getpriceProduct(product.id); // Chờ lấy giá sản phẩm
                    tongtien += product.price * product.quantity;
                    orderDetails.push(product);
                    note = product.note; // Lấy ghi chú từ sản phẩm
                }

                let tennguoinhan = document.querySelector("#tennguoinhan").value;
                let sdtnhan = document.querySelector("#sdtnhan").value;

                if (tennguoinhan === "" || sdtnhan === "" || diachinhan === "") {
                    toast({ title: 'Chú ý', message: 'Vui lòng nhập đầy đủ thông tin !', type: 'warning', duration: 4000 });
                } else {
                    const payload = {
                        user: userId,
                        items: orderDetails.map(item => ({
                            product: item.id,
                            quantity: item.quantity,
                            price: item.price
                        })),
                        totalAmount: tongtien,
                        type: hinhthucgiao,
                        shiptime: thoigiangiao,
                        address: diachinhan,
                        client: tennguoinhan,
                        phonenum: sdtnhan,
                        status: 'Đang chờ xử lý',
                        isPaid: false,
                        note: note // Thêm ghi chú vào payload
                    };

                    const response = await fetch('http://localhost:3000/api/v1/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${getToken()}`
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error('Đã có lỗi xảy ra khi gửi đơn hàng.');
                    }

                    const responseData = await response.json();
                    console.log(responseData);
                    toast({ title: 'Thành công', message: 'Đặt hàng thành công !', type: 'success', duration: 1000 });
                    setTimeout(() => {
                        window.location = "/";
                    }, 2000);
                }
            } catch (error) {
                console.error(error);
                toast({ title: 'Lỗi', message: 'Đã có lỗi xảy ra trong quá trình xử lý đơn hàng. Vui lòng thử lại sau.', type: 'error', duration: 4000 });
            }
        } else {
            // Chưa đăng nhập
            toast({ title: 'Warning', message: 'Chưa đăng nhập tài khoản !', type: 'warning', duration: 3000 });
        }
    } catch (error) {
        console.error(error);
        toast({ title: 'Lỗi', message: 'Đã có lỗi xảy ra khi gửi yêu cầu.', type: 'error', duration: 4000 });
    }
}




async function getpriceProduct(id) {
    try {
        const products = await getProductData();
        const currentUser = JSON.parse(sessionStorage.getItem('currentuser'));
        if (!currentUser || !currentUser.cart) {
            throw new Error("No user or cart data found in sessionStorage");
        }
        const cartItem = currentUser.cart.find(item => item.id === id);
        if (!cartItem) {
            throw new Error("Product with the provided ID not found in the user's cart");
        }
        const product = products.find(item => item._id === cartItem.id);
        if (!product) {
            throw new Error("Product with the provided ID not found in the product list");
        }
        return product.price;
    } catch (error) {
        console.error(error);
        return null; 
    }
}

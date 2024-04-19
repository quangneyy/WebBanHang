async function resetPassword(event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của form (tải lại trang)

    let passwordAfter = document.getElementById('password-after-info-reset').value;
    let passwordConfirm = document.getElementById('password-comfirm-info-reset').value;
    let token = new URLSearchParams(window.location.search).get('token');
    let check = true;

    if (passwordAfter.length === 0) {
        document.querySelector('.password-after-info-error').innerHTML = 'Vui lòng nhập mật khẩu mới';
        check = false;
    } else {
        document.querySelector('.password-after-info-error').innerHTML = '';
    }

    if (passwordConfirm.length === 0) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Vui lòng nhập mật khẩu xác nhận';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (passwordAfter !== passwordConfirm) {
        document.querySelector('.password-after-comfirm-error').innerHTML = 'Mật khẩu xác nhận không khớp';
        check = false;
    } else {
        document.querySelector('.password-after-comfirm-error').innerHTML = '';
    }

    if (check) {
        try {
            const response = await fetch(`http://localhost:3000/api/v1/auth/resetpassword/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password: passwordAfter
                })
            });

            const responseData = await response.json();
            if (response.ok) {
                toast({ title: 'Success', message: 'Đổi mật khẩu thành công!', type: 'success', duration: 3000 });
                window.location.href = 'index.html'; 
            } else {
                toast({ title: 'Error', message: responseData.data, type: 'error', duration: 3000 });
            }

        } catch (error) {
            toast({ title: 'Error', message: 'Đã xảy ra lỗi khi đổi mật khẩu.', type: 'error', duration: 3000 });
        }
    }
}

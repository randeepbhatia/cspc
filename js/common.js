$(function(){

    $('.signin').on('click', function(){
        var opt = {
            formId: 'loginForm',
            onSuccess: function(d){
                console.log('login', d);
                redirect(($.cookie('sitepath') || '') + "checkauth.html", true);
            },
            onError: function(e){
                console.log('login error', e);
            }
        };
        doAjaxSignin(opt);
    });

    $('.signout').on('click', function(){
        doLogout();
        redirect(($.cookie('sitepath') || '') + 'index.html');
    });

    $('#registerbtn').on('click', function(){
        if($('#password').val() !== $('#password_confirmation').val()){
            alert("'Password' and 'Confirm Password' must match");
            return;
        }
        doRegister('registerForm');
    });

    // update the cart item count label on page if any
    updateCartCountLable();
});

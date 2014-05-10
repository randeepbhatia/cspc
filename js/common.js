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
})

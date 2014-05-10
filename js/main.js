var CSPC = CSPC || {};

//---------- config ------------
CSPC.restUrl = "http://54.220.241.101:8080/cpsc/rest/";
CSPC.authFailRedirectOn = false;

$.cookie.json = true;
$.cookie.defaults = {
    expires: 1,
    path: '/'
};
//---------- config end ------------

function log(){
    arguments.length && console && console.log(arguments);
}

function loadScript(url) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=initializeMapApi';
    document.body.appendChild(script);
}

String.prototype.substitute = function(sub){
    return this.replace(/\{(.+?)\}/g, function($0, $1) {
        return $1 in sub ? sub[$1] : $0;
    });
};

function strSubstitute(str, sub) {
    return str.replace(/\{(.+?)\}/g, function($0, $1) {
        return $1 in sub ? sub[$1] : $0;
    });
};

function doAjaxSignin(data){
    var loginUrl = CSPC.restUrl + "login";

    function onSuccess(d){
        _doLogin(d);
        data.onSuccess(d);
    }

    //TODO
    onSuccess({'name': 'Randeep S', 'email': 'abc@def.com'});
    return;

    if(data.formId){
        $.post( loginUrl, $("#"+data.formId).serialize()).done(onSuccess).fail(data.onError);
    }
}

function doLogout(){
    $.removeCookie('uLogonData');
    log('loggin user out. Result = ' + $.cookie('uLogonData') === undefined);
}

function _doLogin(data){
    $.cookie('uLogonData', data);
    log('loggin user IN. Result = ' + $.cookie('uLogonData') !== undefined);
}

function doRegister(formId){
    var registerUrl = CSPC.restUrl + "register";

    function onSuccess(d){
        log("register success", d);
    }

    function onError(e){
        log("register success", e);
    }

    if(formId){
        $.post( registerUrl, $("#"+formId).serialize()).done(onSuccess).fail(onError);
    }
}

function isLoggedIn(){
    log("requested user login status. returning=" + $.cookie('uLogonData') !== undefined);
    return $.cookie('uLogonData') !== undefined;
}

function isAccountTypeSeller(){
    if(!isLoggedIn()){
        throw Error("user not logged in");
    }
    //TODO
    return false;
    //return $.cookie('uLogonData').acttype !== 'u';
}

function getAcctTypeBasedRediretUrl(){
    if(isAccountTypeSeller()){
        return "seller/products.html";
    } else {
        return "products.html";
    }
}

function redirect(url, keepCurrPageInHistory){
    if(keepCurrPageInHistory){
        // behaves as if a link was clicked
        window.location.href = url;
    } else {
        // behaves as if http redirect happened
        window.location.replace(url);
    }
}

function redirectAuthFailToHome(){
    if(CSPC.authFailRedirectOn === true && !isLoggedIn()){
        redirect(($.cookie('sitepath') || '') + 'index.html', true);
    }
}

function addToCart(prodInfo){
    !prodInfo && (prodInfo={name:'abc'});
    var cart = $.cookie('cart') || {items : []};
    if(cart.items.indexOf(prodInfo.name) === -1){
        cart.items.push(prodInfo.name);
    }

    $('.cartcount').html(cart.items.length);
    $.cookie('cart', cart);
}

function deleteFromCart(prodId){

}

function getCartItemsCount(){
    var cart = $.cookie('cart');
    var cartCount = 0;
    if(cart && cart.items){
        cartCount = cart.items.length;
    }
    return cartCount;
}

function updateCartCountLable(){
    $('.cartcount').html(getCartItemsCount());
}

function clearCart(){
    $.removeCookie('cart');
}
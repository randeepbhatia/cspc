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

function doLogin(data){
    // clear previous login data in case left behind
    doLogout();

    var loginUrl = CSPC.restUrl + "login";

    function onSuccess(d){
        if(!d.error){
            data.onSuccess(d);
            onAuthSuccess(d);
        } else {
            onError(d);
        }

    }

    function onError(e){
        data.onError(e);
        $.cookie('error',e);
        redirect(($.cookie('sitepath') || '') + "checkauth.html");
    }

    if(data.formId){
        $.post( loginUrl, $("#"+data.formId).serialize()).done(onSuccess).fail(onError);
    }
}

function onAuthSuccess(data){
    $.cookie('uLogonData', data);
    $.removeCookie('error');
    log('loggin user IN. Result = ' + $.cookie('uLogonData') !== undefined);
    redirect(($.cookie('sitepath') || '') + "checkauth.html");
}

function doLogout(){
    $.removeCookie('uLogonData');
    log('loggin user out. Result = ' + $.cookie('uLogonData') === undefined);
}

function doRegister(formId){
    var registerUrl = CSPC.restUrl + "register";

    function onSuccess(d){
        log("register success", d);
        var successData = d && d.response && d.response.wrappedUser;
        if(successData){
            onAuthSuccess(successData);
        } else {
            onError(d);
        }
    }

    function onError(e){
        log("register error", e);
        alert("Some error occured while registering.\nCheck internet connection,\nCheck server is online\nTry some other email address");
    }

    if(formId){
        $.post( registerUrl, $("#"+formId).serialize()).done(onSuccess).fail(onError);
    }
}

function getAllProducts(onSuccess){
    $.get( CSPC.restUrl + "products", onSuccess);
}

function saveNewProduct(data, onSuccess, onError){
    $.post( CSPC.restUrl + "product/insert", data).done(onSuccess).fail(onError);
}

function placeOrder(){
    $.post(CSPC.restUrl);
}

function isLoggedIn(){
    var logonData = $.cookie('uLogonData');
    log("requested user login status. returning=" + $.cookie('uLogonData') !== undefined);
    return logonData !== undefined && logonData.accountType && !logonData.error;
}

function isAccountTypeSeller(){
    if(!isLoggedIn()){
        throw Error("user not logged in");
    }
    return $.cookie('uLogonData').accountType === 's';
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
    var cart = $.cookie('cart') || {items : []};
    if(cart.items.indexOf(prodInfo) === -1){
        cart.items.push(prodInfo);
    }

    $('.cartcount').html(cart.items.length);
    $.cookie('cart', cart);
}

function deleteFromCart(itemIndex, prodId){
    var cart = $.cookie('cart');
    if(cart && cart.items){
        /*cart.items.forEach(function(item, i){
            if(item.productName === prodId){
                prodIndex.push(i);
            }
        });*/
        cart.items.splice(itemIndex, 1);
    }

    $.cookie('cart', cart);
    updateCartCountLable();
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
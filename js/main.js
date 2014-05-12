var CSPC = CSPC || {};

//---------- config ------------

//ATTENTION: Please change this value to point to server host for restApi calls
CSPC.restHost = "http://54.220.241.101:8080";

CSPC.restUrl = CSPC.restHost + "/cpsc/rest/";
CSPC.sitepath = "/CPSC/";
CSPC.authFailRedirectOn = true;

$.cookie.json = true;
$.cookie.defaults = {
    expires: 2,
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

    var loginUrl = CSPC.restUrl + "user";

    function onSuccess(d){

        var doPostSuccessLogin = function(da){
            data.onSuccess(da);
            onAuthSuccess(da);
        };

        if(!d.error){
            var successData = d && d.response && d.response.wrappedUser;
            doPostSuccessLogin(successData);
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
        $.get( loginUrl, $("#"+data.formId).serialize(), onSuccess);
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

function getSpecificSellerProducts(sellerid, onSuccess, onError){
    if(!sellerid){
        return;
    }
    $.get( CSPC.restUrl + "user/products", {email: sellerid}).done(onSuccess).fail(onError);
}

function saveNewProduct(data, onSuccess, onError){
    if(data && !data.email){
        data.email = getLoggedInUserData('email');
    }
    $.post( CSPC.restUrl + "product/insert", data).done(onSuccess).fail(onError);
}

function updateSellerProduct(data, onSuccess, onError){
    if(data && !data.email){
        data.email = getLoggedInUserData('email');
    }
    $.post( CSPC.restUrl + "product/update", {product: JSON.stringify(data)}).done(onSuccess).fail(onError);
}

function deleteSellerProduct(prodId, onSuccess, onError){
    $.post( CSPC.restUrl + "product/delete", {productName: JSON.stringify(prodId)}).done(onSuccess).fail(onError);
}

function searchProduct(searchTerm, onSuccess, onError){
    $.get( CSPC.restUrl + "product/search", {productName: searchTerm}).done(onSuccess).fail(onError);
}

function placeOrder(onSuccess, onError){
    var cart = $.cookie('cart');
    var cartItemRequiredData = [];
    if(!cart || !cart.items || !cart.items.length){
        console.log("ALERT! cant place order on empty cart");
        return;
    }

    for(var i in cart.items){
        var item = cart.items[i];
        cartItemRequiredData.push({
            productName: item.productName,
            quantity: item.quantity
        });
    }

    var onSuccessCb = function(d){
        if(d.error){
            onErrorCb();
            return;
        }
        onSuccess();
    };

    var onErrorCb = function(){
        onError();
    }
    $.post(CSPC.restUrl + 'order/insert', {
        json: JSON.stringify(cartItemRequiredData),
        email: getLoggedInUserData('email'),
        price: $.cookie('cart').ordertotal || 0.00
    }).done(onSuccessCb).fail(onErrorCb);
}

function isLoggedIn(){
    var logonData = $.cookie('uLogonData');
    log("requested user login status. returning=" + $.cookie('uLogonData') !== undefined);
    return logonData !== undefined && logonData.accountType && !logonData.error;
}

function getLoggedInUserData(field){
    if(!isLoggedIn()){
        console.log("user is not logged in. no user data available.");
        return;
    }

    var userData = $.cookie('uLogonData');
    if(!userData){
        return null;
    } else if(typeof field === 'string' && field !== ''){
        return userData[field];
    } else {
        return userData;
    }

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
        redirect(($.cookie('sitepath') || CSPC.sitepath ||'') + 'index.html', true);
    }
}

function addToCart(prodInfo){
    var cart = $.cookie('cart') || {items : []};
    var exists = false;

    for(var i = 0; i < cart.items.length; i++){
        if(cart.items[i].productName === prodInfo.productName){
            exists = true;
            cart.items[i].quantity++;
        }
    }

    if(!exists){
        prodInfo.quantity = 1;
        cart.items.push(prodInfo);
    }

    $.cookie('cart', cart);
    updateCartCountLable();
}

function deleteFromCart(itemIndex, prodId){
    var cart = $.cookie('cart');
    if(cart && cart.items){
        cart.items.splice(itemIndex, 1);
    }

    if(cart){
        $.cookie('cart', cart);
    }
    updateCartCountLable();
}

function updateCart(itemIndex, newQuantity){
    var cart = $.cookie('cart');

    if(cart && cart.items){
        cart.items[itemIndex].quantity = newQuantity;
    }

    if(cart){
        $.cookie('cart', cart);
    }

    return cart;
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
var CSPC = CSPC || {};

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
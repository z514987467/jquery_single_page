// CookieManager.js, for managing browser cookies
function CookieManager() {
}

CookieManager.getCookieValue = function(cookieName) {
    var cookie = document.cookie;
    var chkdCookie = cookie.split(" ").join("");
    var nvpair = chkdCookie.split(";")
	var splitValues;

    for (var i = 0; i < nvpair.length; ++i) {
        splitValues = nvpair[i].split("=")
        if (splitValues[0] == cookieName) {
			return splitValues[1];
		}
    }
	return null;
}

CookieManager.setCookieValue = function (cookieName, cookieValue, cookieExpireDays) {
    var futdate = new Date()		//Get the current time and date
    var expdate = futdate.getTime()  //Get the milliseconds since Jan 1, 1970
    if (!cookieExpireDays || cookieExpireDays == "") {
        cookieExpireDays = 364;
    }
    expdate += cookieExpireDays * 24 * 60 * 60 * 1000  //expires in about one year
    futdate.setTime(expdate);
    var newCookie = cookieName + "=" + cookieValue + "; path=/;"
    newCookie += " expires=" + futdate.toGMTString();
    window.document.cookie = newCookie;
}

CookieManager.eraseCookie = function(cookieName) {
    document.cookie = cookieName + "=;expires=-1; path=/";
}

CookieManager.setCookieModule = function(mylink, qs, css, t) {
    var newCookie = "module_mode=yes;path=/;"// domain=dev.xxx.us;"	//Set the new cookie values up 
    var newCookie2 = "module_url=" + mylink + "; path=/;"
    var newCookie3 = "module_css=" + css + "; path=/;"
    var newCookie4 = "module_qs=" + qs + "; path=/;"
    var newCookie5 = "module_t=" + t + "; path=/;"
    window.document.cookie = newCookie
    window.document.cookie = newCookie2
    window.document.cookie = newCookie3
    window.document.cookie = newCookie4
    window.document.cookie = newCookie5
}

CookieManager.areCookiesEnabled = function() {
	if (document.forms[0]) {
		if (document.forms[0].areCookiesEnabled) {
			if (document.forms[0].areCookiesEnabled.value.toLowerCase() == "false") {
				return false;
			}
		}
	}
	return true;
}
// LocalStorageManager.js
function LocalStorageManager()
{
	this.pInstance = null;
	this.pLocalStorage = null;
}

LocalStorageManager.getInstance = function ()
{
	if (!this.pInstance)
	{
		this.pInstance = new LocalStorageManager();
	}
	return this.pInstance;
};

LocalStorageManager.prototype.init = function () {
	try {
	    if (typeof (Storage) != "undefined") {
	        this.pLocalStorage = localStorage;
	    }
	    else {
	        console.warn("ERROR - LocalStorageManager.init() - Browser does not support local storage, or a browser security policy has been set to prevent local storage access.");
	    }
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.init() - Browser does not support local storage, or a browser security policy has been set to prevent local storage access: " + err.message);
	}
};

LocalStorageManager.prototype.flush = function () {
	try {
		if (this.pLocalStorage) {
			this.pLocalStorage.clear();
		}
		else
		{
			console.error("ERROR - LocalStorageManager.flush() - Browser does not support local storage, or a browser security policy has been set to prevent local storage access.");
		}
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.flush() - Browser does not support local storage, or a browser security policy has been set to prevent local storage access: " + err.message);
	}
};

LocalStorageManager.prototype.setProperty = function (propertyName, propertyValue) {
    try {
        //if this broswer can not support HTML5, we should use cookie to store data
        if (typeof (this.pLocalStorage) == "undefined")
        {
            CookieManager.setCookieValue(propertyName, propertyValue, 1);
        }
        else
        {
            this.pLocalStorage[propertyName] = propertyValue;
        }
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.setProperty() - Unable to set the local storage property. Likely the browser does not support local storage, or a browser security policy has been set to prevent local storage access: " + err.message);
	}
};

LocalStorageManager.prototype.getProperty = function (propertyName) {
    try {
        //if this broswer can not support HTML5, we should use cookie to store data
        if (typeof (this.pLocalStorage) == "undefined") {
            return CookieManager.getCookieValue(propertyName);
        }
        else {
            if (typeof (this.pLocalStorage[propertyName]) != "undefined") {
                return this.pLocalStorage[propertyName];
            }
            else {
                return null;
            }
        }
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.setProperty() - Unable to set the local storage property. Likely the browser does not support local storage, or a browser security policy has been set to prevent local storage access: " + err.message);
		return null;
	}
};

LocalStorageManager.prototype.deleteProperty = function (propertyName) {
    try {
        
        //if this broswer can not support HTML5, we should use cookie to store data
        if (typeof (this.pLocalStorage) == "undefined") {
            CookieManager.eraseCookie(propertyName);
        }
        else {
            if (typeof (this.pLocalStorage[propertyName]) != "undefined") {
                this.pLocalStorage.removeItem(propertyName);
            }
        }
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.setProperty() - Unable to set the local storage property. Likely the browser does not support local storage, or a browser security policy has been set to prevent local storage access: " + err.message);
		return null;
	}
};

LocalStorageManager.serialize = function (sourceObject, callback) {
	try {
		return JSON.stringify(sourceObject, callback);
		//return JSON.stringify(sourceObject);
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.serialize() - Unable to serialize object: " + err.message);
		return "";
	}
};

LocalStorageManager.deserialize = function (sourceJSON) {
    try {
        return (sourceJSON == null || sourceJSON=="")?null:JSON.parse(sourceJSON);
	}
	catch (err) {
		console.error("ERROR - LocalStorageManager.deserialize() - Unable to deserialize object: " + err.message);
	}
};

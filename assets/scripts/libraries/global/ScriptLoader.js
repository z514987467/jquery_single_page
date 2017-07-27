//ScriptLoader.js, Asyc load js
function ScriptLoader() {
    this.pInstance = null;
    this.pLoadedLibraries = [];
    this.pNumToLoad = 0;
    this.pNumLoaded = 0;
    this.pLoadDetails = {numToLoad: 0, numLoaded: 0, requestQueue: [], callbacks: []};
    this.pVersion = $("#version").val();
    this.pLoadInProgress = false;
}

ScriptLoader.getInstance = function () {
    if (!this.pInstance) {
        this.pInstance = new ScriptLoader();
    }
    return this.pInstance;
};

ScriptLoader.prototype.includeLibraries = function (libraryList, callback) {
    try {
        var i, n;
        var parent = this;
        var script;

        if (APPCONFIG.ENV == "localhost" || APPCONFIG.ENV == "127.0.0.1") {
            callback(true); // For local development, don't use script manager, just use script files included in default.html
        }
        else if (typeof (libraryList) != "undefined" && libraryList != null) {
            this.pLoadDetails.requestQueue = this.pLoadDetails.requestQueue.concat(libraryList);
            this.pLoadDetails.numToLoad += libraryList.length;
            this.pLoadDetails.callbacks.push(callback);

            if (this.pLoadInProgress == false) {
                // If load process is not already going, then kick it off, 
                // otherwise the change will automatically get picked up after the next script file is finished loading
                this.pLoadInProgress = true;
                this.loadNextLibrary();
            }
        }
    }
    catch (err) {
        console.error("ERROR - ScriptLoader.includeLibraries(): " + err.message);
    }
};

// Load script libraries in a sequential manner, so that script load operations complete in the order they are declared.
// Prevents dependancy issues from libraries loading out of order, when one depends on another already being in place.
ScriptLoader.prototype.loadNextLibrary = function () {

    var requestQueue = this.pLoadDetails.requestQueue;
    var parent = this;
    var i, n;

    if (this.pLoadDetails.numLoaded < this.pLoadDetails.numToLoad) {
        if (typeof (this.pLoadedLibraries[requestQueue[this.pLoadDetails.numLoaded]]) == "undefined") {
            // Not yet loaded
            function proxy(modulePath, version) {
                $.ajax({
                    url: "/scripts/" + modulePath + "?v=" + APPCONFIG.VERSION,
                    dataType: "script",
                    cache: true,
                    success: function (data, status, jqxhr) {
                        parent.pLoadDetails.numLoaded++;
                        parent.pLoadedLibraries[modulePath] = true;
                        parent.loadNextLibrary();
                    }
                });
            }

            proxy(requestQueue[this.pLoadDetails.numLoaded], this.pVersion);
        }
        else {
            // Already loaded from a previous request, can skip over
            this.pLoadDetails.numLoaded++;
            this.loadNextLibrary();
        }

    }
    else {
        for (i = 0, n = this.pLoadDetails.callbacks.length; i < n; i++) {
            this.pLoadDetails.callbacks[i](true);
        }
        this.pLoadInProgress = false;
        this.pLoadDetails.numLoaded = 0;
        this.pLoadDetails.numToLoad = 0;
        this.pLoadDetails.requestQueue = [];
        this.pLoadDetails.callbacks = [];
    }
}

ScriptLoader.prototype.includeModule = function (moduleName, callback) {
    var loadedLibraries = [];

    switch (moduleName) {
        case "core":
            this.includeLibraries([
                "screen/controller/utility/GuideController.js",
                "screen/controller/utility/PagerController.js",
                "screen/controller/utility/SessionTimeoutController.js"
            ], callback);
            break;
        case "home":
            this.includeLibraries([
                "screen/controller/home/HomeController.js"
            ], callback);
            break;
        case "event":
            this.includeLibraries([
                "screen/controller/event/EventController.js",
                "screen/controller/event/SafeEventController.js",
                "screen/controller/event/SystemEventController.js"
            ], callback);
            break;
        case "log":
            this.includeLibraries([
                "screen/controller/log/LogController.js",
                "screen/controller/log/LoginLogController.js",
                "screen/controller/log/OperationLogController.js"
            ], callback);
            break;
        case "device":
            this.includeLibraries([
                "screen/controller/device/DeviceController.js",
                "screen/controller/device/BasicDeviceController.js",
                "screen/controller/device/AdvanceDeviceController.js",
                "screen/controller/device/ModeDeviceController.js"
            ], callback);
            break;
        case "mac":
            this.includeLibraries([
                "screen/controller/rule/MacRuleController.js"
            ], callback);
            break;
        case "custom":
            this.includeLibraries([
            "screen/controller/rule/CustomRuleController.js"
            ], callback);
            break;
        case "whitelist":
            this.includeLibraries([
                "screen/controller/rule/WhitelistController.js",
            ], callback);
            break;
        case "blacklist":
            this.includeLibraries([
                "screen/controller/rule/BlacklistController.js"
            ], callback);
            break;
        case "nettopo":
            this.includeLibraries([
                "screen/controller/nettopo/NettopoController.js"
            ], callback);
            break;
        case "user":
            this.includeLibraries([
                "screen/controller/user/UserController.js"
            ], callback);
            break;
        case "protocol":
            this.includeLibraries([
                "screen/controller/audit/ProtocolAuditController.js",
                "screen/controller/audit/protocol.js"
            ], callback);
            break;
        case "flow":
            this.includeLibraries([
                "screen/controller/audit/FlowAuditController.js",
                "screen/controller/audit/FlowDetailAuditController.js"
            ], callback);
            break;
        case "interface":
            this.includeLibraries([
                "screen/controller/interface/InterfaceController.js"
            ], callback);
            break;
        case "opcda":
            this.includeLibraries([
                "screen/controller/rule/OpcdaController.js"
            ], callback);
            break;
    }
};

//Validation.js, for validate data
function Validation() {
}

Validation.validateIP = function (input) {
    try {
        var reg = /^(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)\.(25[0-5]|2[0-4]\d|[0-1]\d{2}|[1-9]?\d)$/;
        if (reg.test(input)) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.error("ERROR - Validation.validateIP() - Unable to validate ip: " + err.message);
    }
}

Validation.validateSubnet = function (input) {
    try {
        var IPPattern = /^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/
        if (!IPPattern.test(input)) return false;

        /* 检查域值 */
        var IPArray = input.split(".");
        var ip1 = parseInt(IPArray[0]);
        var ip2 = parseInt(IPArray[1]);
        var ip3 = parseInt(IPArray[2]);
        var ip4 = parseInt(IPArray[3]);
        //检查长度
        if (IPArray.length > 4) {
            return false;
        }
        /* 每个域值范围0-255 */
        if (ip1 < 0 || ip1 > 255
            || ip2 < 0 || ip2 > 255
            || ip3 < 0 || ip3 > 255
            || ip4 < 0 || ip4 > 255) {
            return false;
        }
        if (input.length < 3 && ip1 > 32) {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateSubnet() - Unable to validate subnet mask: " + err.message);
    }
}

Validation.validateMAC = function (input) {
    try {

        var reg = /^(([a-fA-F\d]{2}:){5}[a-fA-F\d]{2})|(([a-fA-F\d]{2}-){5}[a-fA-F\d]{2})$/;
        if (reg.test(input)) {
            if (input.length > 17) {
                return false;
            }
            return true;
        }
        return false;
    }
    catch (err) {
        console.error("ERROR - Validation.validateIP() - Unable to validate ip: " + err.message);
    }
}

Validation.validateComplexIP = function (input) {
    try {
        var IPArray = input.split(",");
        for (var i = 0; i < IPArray.length; i++) {
            var tmpIPArray = IPArray[i].split("-");
            if (tmpIPArray.length == 2 && (!Validation.validateIP(tmpIPArray[0]) || !Validation.validateIP(tmpIPArray[1]))) {
                return false;
            }
            var tmpSubnet = IPArray[i].split("/");
            if (tmpSubnet.length == 2 && (!Validation.validateIP(tmpSubnet[0]) || !Validation.validateSubnet(tmpSubnet[1]))) {
                return false;
            }
            if (tmpIPArray.length != 2 && tmpSubnet.length != 2 && !Validation.validateIP(IPArray[i])) {
                return false;
            }
        }

        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateComplexIP() - Unable to validate complex IP: " + err.message);
    }
}

Validation.validateDateTime = function (input) {
    try {
        var reg = /^(\d{1,4})(-|\/)([0,1]\d{1})(-|\/)([0,1,2,3]\d{1}) (\d{1,2}):(\d{1,2}):(\d{1,2})$/;
        if (!reg.test(input)) {
            return false;
        }

        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateDateTime() - Unable to validate datetime: " + err.message);
    }
}

Validation.validateUserName = function (input) {
    try {
        var reg = /^[a-zA-Z]{1}[\w]{3,24}$/;
        if (!reg.test(input)) {
            return false;
        }

        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateDateTime() - Unable to validate datetime: " + err.message);
    }
}

Validation.validatePassword = function (input) {
    try {
        var reg = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#]).{6,16}$/;
        if (!reg.test(input)) {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateDateTime() - Unable to validate datetime: " + err.message);
    }
}

Validation.validatePort = function (input) {
    try {
        var reg = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
        if (reg.test(input)) {
            return true;
        }
        return false;
    }
    catch (err) {
        console.error("ERROR - Validation.validatePort() - Unable to validate port: " + err.message);
    }
}

//IPv4比较 比较两个ip的大小,如果大于，返回1，等于返回0，小于返回-1
Validation.compareIP = function (ipBegin, ipEnd) {
    try {
        if (!Validation.validateIP(ipBegin) || !Validation.validateIP(ipEnd)) {
            return 0;
        }
        var temp1;
        var temp2;
        temp1 = ipBegin.split(".");
        temp2 = ipEnd.split(".");
        for (var i = 0; i < 4; i++) {
            if (parseInt(temp1[i]) > parseInt(temp2[i])) {
                return 1;
            } else if (parseInt(temp1[i]) < parseInt(temp2[i])) {
                return -1;
            }
        }
        return 0;
    } catch (err) {
        console.error("ERROR - Validation.compareIP() - Unable to compare ip: " + err.message);
    }
}

//判断是否是环回地址
Validation.validateLoopbackIP = function (input) {
    try {
        if (!Validation.validateIP(input)) {
            return false;
        }
        if (input.split(".")[0] == "127") {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.error("ERROR - Validation.validateLoopbackIP() - Unable to validate ip: " + err.message);
    }
}

Validation.validateIP2 = function (input) {
    try {
        if (!Validation.validateIP(input) || Validation.compareIP(input, "1.0.0.0") == -1 || Validation.compareIP(input, "223.255.255.255") == 1) {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateIP() - Unable to validate ip: " + err.message);
    }
}

Validation.validateSubnet2 = function (input) {
    try {
        if (!Validation.validateSubnet(input) || input == "0.0.0.0") {
            return false;
        }
        return true;
    }
    catch (err) {
        console.error("ERROR - Validation.validateIP() - Unable to validate ip: " + err.message);
    }
}

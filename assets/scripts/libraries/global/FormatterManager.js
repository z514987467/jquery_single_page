//FormatterManager.js, for managing formatter
function FormatterManager() {
}

FormatterManager.formatDateFromUTC = function (utc) {
    if (typeof (utc) != "undefined" && utc != null && utc != "") {
        var date = new Date(utc);
        return date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
    }
    else {
        return "";
    }
}

FormatterManager.formatToLocaleDateTime = function (datetime) {
    if (typeof (datetime) != "undefined" && datetime != null && datetime.toUpperCase() != "NULL" && datetime != "") {
        return datetime.replace(/T/, " ").replace(/Z/, " ");
    }
    else {
        return "";
    }
}

FormatterManager.formatMillisecondsFromTime = function (time) {    
    if (typeof (time) != "undefined" && time != null && time != "") {
    }
}
FormatterManager.formatMilliseconds = function (milliseconds) {
    if (typeof (milliseconds) != "undefined" && milliseconds != null && milliseconds != "") {
        var seconds = parseInt(Math.floor(milliseconds/1000));// ����
        var minutes = 0;// ��
        var hours = 0;// Сʱ
        if (seconds > 60) {
            minutes = parseInt(seconds / 60);
            seconds = parseInt(seconds % 60);
            if (minutes > 60) {
                hours = parseInt(minutes / 60);
                minutes = parseInt(minutes % 60);
            }
        }
        var result = parseInt(seconds);
        if (result < 10) {
            result = "0" + result;
        }
        if (minutes > 0) {
            var minutes = parseInt(minutes);
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            result = minutes + ":" + result;
        }
        else {
            result = "00:" + result;
        }

        if (hours > 0) {
            var hours = parseInt(hours);
            if (hours < 10) {
                hours = "0" + hours;
            }
            result = hours + ":" + result;
        }
        else {
            result = "00:" + result;
        }

        return result;
    }
    else {
        return "00:00:00";
    }
}

FormatterManager.formatTime = function (dateTime) {
    var hours;
    var minutes;
    var ampm;
    var isMilitaryTime = false;

    if (typeof (dateTime) != "undefined" && dateTime != null) {
        dateTime = new Date(dateTime);
        hours = dateTime.getHours();
        minutes = dateTime.getMinutes();
        seconds = dateTime.getSeconds();
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (isMilitaryTime) {
            return hours + ":" + minutes;
        }
        else {
            if (hours == 0) {
                hours = 12;
            }
            else if (hours > 12) {
                hours -= 12;
            }
            return hours + ":" + minutes + ":" + seconds;
        }
    }
}

FormatterManager.formatDate = function (dateTime) {
    var hours;
    var minutes;
    var ampm;
    var isMilitaryTime = false;

    if (typeof (dateTime) != "undefined" && dateTime != null) {
        dateTime = new Date(dateTime);
        year = dateTime.getFullYear();
        month = dateTime.getMonth() + 1;
        day = dateTime.getDate();
        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        return year + "-" + month + "-" + day;
    }
    else {
        return "";
    }
}

FormatterManager.formatToLongTime = function (dateTime) {
    var hours;
    var minutes;
    var ampm;
    var isMilitaryTime = false;

    if (typeof (dateTime) != "undefined" && dateTime != null) {
        dateTime = dateTime.replace(/T/, " ").replace(/Z/, " ").replace(/-/g, '/');
        dateTime = new Date(dateTime);
        hours = dateTime.getHours();
        minutes = dateTime.getMinutes();
        seconds = dateTime.getSeconds();
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        return hours + ":" + minutes + ":" + seconds;
    }
}

FormatterManager.formatDateTime = function (dateTime, formatter) {
    var year;
    var month;
    var day;
    var hours;
    var minutes;
    var second;
    var ampm;

    var result;
    if (typeof (dateTime) != "undefined" && dateTime != null) {
        //get year/month/day/hour/minute/day
        var newDateTime = new Date(dateTime);
        year = newDateTime.getFullYear();
        month = newDateTime.getMonth() + 1;
        day = newDateTime.getDate();
        hours = newDateTime.getHours();
        minutes = newDateTime.getMinutes();
        seconds = newDateTime.getSeconds();
        //cacl with 2bits
        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        ampm = (hours >= 12) ? "PM" : "AM";
        if (formatter == undefined && formatter == "") {
            return dateTime;
        }

        //if the formatter does not contain the hour/minute, automaticlly add it.
        if (formatter.indexOf('mm') < 1 || (formatter.indexOf('HH') < 1 && formatter.indexOf('hh') < 1)) {
            formatter = formatter.substr(0, 10) + " " + "HH:mm tt";
        }

        //format year/month/day/minute
        result = formatter.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("mm", minutes);

        //format hour(add/remove am or pm);
        if (formatter.lastIndexOf('t') > 0 || formatter.lastIndexOf("T") > 0) {
            if (hours == 0) {
                hours = 12;
            }
            else if (hours > 12) {
                hours -= 12;
            }
            hours = (hours < 10) ? "0" + hours : hours;
            result = result.replace("tt", ampm).replace("TT", ampm);
        }
        //format hour/second second(add/remove);
        if (formatter.lastIndexOf('h') > 0 || formatter.lastIndexOf("H") > 0) {
            result = result.replace("hh", hours).replace("HH", hours);
        }
        if (formatter.lastIndexOf('s') > 0 || formatter.lastIndexOf("S") > 0) {
            result = result.replace("ss", seconds).replace("SS", seconds);
        }
        hours = (hours < 10) ? "0" + hours : hours;

        result = result.replace("ss", "").replace("SS", "").replace("tt", "").replace("TT", "");

    }

    return result;
}

FormatterManager.formatDateTimeFromLocale = function (dateTime, formatter) {
    var year;
    var month;
    var day;
    var hours;
    var minutes;
    var second;
    var ampm;

    var result;
    if (typeof (dateTime) != "undefined" && dateTime != null) {
        dateTime = dateTime.replace(/T/, " ").replace(/Z/, " ").replace(/-/g, '/');
        //get year/month/day/hour/minute/day
        var newDateTime = new Date(dateTime);
        year = newDateTime.getFullYear();
        month = newDateTime.getMonth() + 1;
        day = newDateTime.getDate();
        hours = newDateTime.getHours();
        minutes = newDateTime.getMinutes();
        seconds = newDateTime.getSeconds();
        //cacl with 2bits
        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        ampm = (hours >= 12) ? "PM" : "AM";
        if (formatter == undefined && formatter == "") {
            return dateTime;
        }

        //format year/month/day/minute
        result = formatter.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("mm", minutes);

        //format hour(add/remove am or pm);
        if (formatter.lastIndexOf('t') > 0 || formatter.lastIndexOf("T") > 0) {
            if (hours == 0) {
                hours = 12;
            }
            else if (hours > 12) {
                hours -= 12;
            }
            hours = (hours < 10) ? "0" + hours : hours;
            result = result.replace("tt", ampm).replace("TT", ampm);
        }
        //format hour/second second(add/remove);
        if (formatter.lastIndexOf('h') > 0 || formatter.lastIndexOf("H") > 0) {
            result = result.replace("hh", hours).replace("HH", hours);
        }
        if (formatter.lastIndexOf('s') > 0 || formatter.lastIndexOf("S") > 0) {
            result = resut.replace("ss", seconds).replace("SS", seconds);
        }
        hours = (hours < 10) ? "0" + hours : hours;

        result = result.replace("ss", "").replace("SS", "").replace("tt", "").replace("TT", "");

    }

    return result;
}

FormatterManager.formatDateFromLocale = function (dateTime, formatter) {
    var year;
    var month;
    var day;
    var hours;
    var minutes;
    var seconds;

    var result;
    if (typeof (dateTime) != "undefined" && dateTime != null) {
        //get year/month/day
        var newDateTime = dateTime;
        if (typeof (dateTime) == "string") {
            newDateTime = new Date(dateTime.replace(/-/g, '/'));
        }
        year = newDateTime.getFullYear();
        month = newDateTime.getMonth() + 1;
        day = newDateTime.getDate();
        //cacl with 2bits
        month = (month < 10) ? "0" + month : month;
        day = (day < 10) ? "0" + day : day;
        hours = dateTime.getHours();
        minutes = dateTime.getMinutes();
        seconds = dateTime.getSeconds();
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        if (formatter == undefined && formatter == "") {
            return dateTime;
        }

        //format year/month/day and remove hour/minute/second
        result = formatter.replace("yyyy", year).replace("MM", month).replace("dd", day).replace("ss", seconds).replace("SS", "").replace("tt", "").replace("TT", "").replace("hh", "").replace("HH", hours).replace("mm", minutes);

    }

    return result;
}

FormatterManager.stripHTML = function (markup) {
    // Strip HTML markers, and remove extra spaces
    markup = markup.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
    // Replace common entity codes. Elements stripped first so to remove chance of unsafe markup being parsed.
    markup = $('<textarea/>').html(markup).val();
    return markup;
}


FormatterManager.stripText = function (v, length) {
    try {
        if (typeof (v) == "undefined") {
            return "";
        }
        if (Math.floor(v.length / 2) < length) {
            return v;
        }
        var strReg = /[^\x00-\xff]/g;
        var _str = v.replace(strReg, "**");
        var _len = _str.length;
        if (_len > length) {
            var _newLen = Math.floor(length / 2);
            var _strLen = v.length;
            for (var i = _newLen; i <= _strLen; i++) {
                var _newStr = v.substr(0, i).replace(strReg, "**");
                if (_newStr.length >= length) {
                    return v.substr(0, i) + "...";
                    break;
                }
            }
        } else {
            return v;
        }
    } catch (err) {
        if (v.length > length) {
            return v.substr(0, length) + "...";
        }
        return v;
    }
}

FormatterManager.calculateBroadcast = function(ip,mask){
    //validate ip
    ip_input=ip.match(/\d+\.\d+\.\d+\.\d+/g);
    mask_input=mask.match(/\d+\.\d+\.\d+\.\d+/g)
    if (ip_input==null || ip_input.length < 1|| mask_input==null || mask_input.length < 1){
        return "";
    }

    ip = ip.match(/\d+/g);
    for(var i=0;i<4;i++){
        if (isNaN(ip[i]) || ip[i] > 255 || ip[i] < 0){
            return "";
        }
    }
    //validate mask
    mask = mask.match(/\d+/g);
    for(var i=0;i<4;i++){
        if (isNaN(mask[i]) || mask[i] > 255 || mask[i] < 0){
            return "";
        }
    }
    var broadcast = new Array();
    broadcast.push(ip[0] | (~ mask[0] & 0xff));
    broadcast.push(ip[1] | (~ mask[1] & 0xff));
    broadcast.push(ip[2] | (~ mask[2] & 0xff));
    broadcast.push(ip[3] | (~ mask[3] & 0xff));
    return broadcast.join(".");
}

FormatterManager.calculateNetwork = function(ip,mask){
    //validate ip
    ip_input=ip.match(/\d+\.\d+\.\d+\.\d+/g);
    mask_input=mask.match(/\d+\.\d+\.\d+\.\d+/g)
    if (ip_input==null || ip_input.length < 1|| mask_input==null || mask_input.length < 1){
        return "";
    }

    ip = ip.match(/\d+/g);
    for(var i=0;i<4;i++){
        if (isNaN(ip[i]) || ip[i] > 255 || ip[i] < 0){
            return "";
        }
    }
    //validate mask
    mask = mask.match(/\d+/g);
    for(var i=0;i<4;i++){
        if (isNaN(mask[i]) || mask[i] > 255 || mask[i] < 0){
            return "";
        }
    }
    var network = new Array();
    network.push(mask[0] & ip[0]);
    network.push(mask[1] & ip[1]);
    network.push(mask[2] & ip[2]);
    network.push(mask[3] & ip[3]);
    return network.join(".");
}
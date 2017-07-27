/**
 * GLOBAL CONSTANTS - APP CONFIGURATION FILE
 */
var APPCONFIG = {
    ENV: window.location.hostname.toLowerCase(), //THE CURRENT ENV FOR THE CODE TO DEPLOY TO
    DEFAULT_LOCALE: "zh-cn",
    VERSION: 0.7,
    TOKEN_CHECK_INTERVAL: 60000,
    LOGIN_RESPONSE: "loginResponse",
    GUIDE_CHECK: "beginnerGuide",
    "default": {
        HTTP_METHOD: "GET",
        LOGIN_URL: "login.html",
        HOMEPAGE_URL: "index.html",
        "GET_SYS_TIME": "/data/home/getSysTime.json",
        "CHECK_USER": "/data/user/checkUser.json",
        "GET_HOME_BASE": "/data/home/indexRefreshCount.json",
        "GET_HOME_FLOW": "/data/home/base.json",
        "GET_HOME_PRODUCT": "/data/home/getproductinfo.json",
        "GET_PORT_LED": "/data/home/getLedStatus.json",
        //user
        "CHANGE_USER_PWD": "/data/user/changePassword.json",
        "DELETE_USER": "/data/user/deleteUser.json",
        "ADD_USER": "/data/user/addUser.json",
        "GET_USER": "/data/user/getUser.json",
        "GET_USER_LIST": "/data/user/getAllUser.json",
        "LOGOUT": "/data/user/logout.json",
        //event
        "GET_EVENT_INFO": "/data/event/eventCountRefresh.json",
        //safe event
        "GET_SAFE_EVENT_LIST": "/data/event/safeEventRes.json",
        "SEARCH_SAFE_EVENT": "/data/event/safeEventSearch.json",
        "GET_SAFE_EVENT": "/data/event/safeEventRecordDetail.json",
        "FLAG_SAFE_EVENT_LIST": "/data/event/safeEventReadTag.json",
        "DELETE_SAFE_EVENT_LIST": "/data/event/safeEventClearTag.json",
        "FLAG_SAFE_EVENT": "/data/event/safeOneEventRead.json",
        "EXPORT_SAFE_EVENT": "/data/event/safeEventExportData.json",
        "SAFE_EVENT_FILEPATH": "/download/.json",
        //system event
        "GET_SYS_EVENT_LIST": "/data/event/sysEventRes.json",
        "SEARCH_SYS_EVENT": "/data/event/sysEventSearch.json",
        "GET_SYS_EVENT": "/data/event/sysEventRecordDetail.json",
        "FLAG_SYS_EVENT_LIST": "/data/event/sysEventReadTag.json",
        "DELETE_SYS_EVENT_LIST": "/data/event/sysEventClearTag.json",
        "FLAG_SYS_EVENT": "/data/event/sysOneEventRead.json",
        "EXPORT_SYS_EVENT": "/data/event/sysEventExportData.json",
        "SYS_EVENT_FILEPATH": "/download/.json",
        //log
        "GET_LOG_INFO": "/data/log/getLogCount.json",
        //login log
        "GET_LOGIN_LOG_LIST": "/data/log/loginLogRes.json",
        "EXPORT_LOGIN_LOG": "/data/log/loginLogExportData.json",
        "SEARCH_LOGIN_LOG_LIST": "/data/log/loginLogSearch.json",
        "LOGIN_LOG_FILEPATH": "/download/.json",
        //operation log
        "GET_LOGIN_OPER_LIST": "/data/log/operLogRes.json",
        "EXPORT_OPER_LOG": "/data/log/operLogExportData.json",
        "SEARCH_OPER_LOG_LIST": "/data/log/operLogSearch.json",
        "OPER_LOG_FILEPATH": "/data/log/download/",
        //device
        //basice setting
        "GET_DEVICE_INFO": "/data/device/getDeviceInfo.json",
        "UPDATE_DEVICE_IP": "/data/device/setDpiIp.json",
        "UPDATE_DEVICE_TIME_MANUAL": "/data/device/setTimeSynManualInput.json",
        "UPDATE_DEVICE_TIME_AUTO": "/data/device/setTimeSynAuto.json",
        "GET_DEVICE_LOGIN_INFO": "/data/device/getLoginPara.json",
        "UPDATE_DEVICE_LOGIN_SETTING": "/data/device/loginSetting.json",
        "UPGRADE_DEVICE": "/data/device/dpiUpdate.json",
        "GET_DEVICE_RUN_MODE": "/data/device/getDeviceRunMode.json",
        //advance setting
        "REBOOT_DEVICE": "/data/device/rebootDpi.json",
        "SHUTDOWN_DEVICE": "/data/device/closeDpi.json",
        "RESET_DEVICE": "/data/device/defaultPara.json",
        "GET_DEVICE_REMOTE": "/data/device/isOpenRemoteCtl.json",
        "UPDATE_DEVICE_REMOTE": "/data/device/updateCtlFlag.json",
        "GET_DEVICE_NET": "/data/device/getTimeSynDestIp.json",
        "GET_DEVICE_REMOTE_LIST": "/data/device/accessIp.json",
        "ADD_DEVICE_REMOTE_IP": "/data/device/addAccessIp.json",
        "DEPLOY_DEVICE_REMOTE_IP": "/data/device/deployAccessIp.json",
        "DELETE_DEVICE_REMOTE_IP": "/data/device/deleteAccessIp.json",
        "GET_DEVICE_MODE": "/data/device/getCurMode.json",
        "CHANGE_DEVICE_MODE": "/data/device/changeModelRes.json",
        //rule
        //ip/mac
        "GET_RULE_MAC_LIST": "/data/rule/ipMacRes.json",
        "UPDATE_RULE_MAC": "/data/rule/updateIpMac.json",
        "ADD_RULE_MAC": "/data/rule/addIpMac.json",
        "DELETE_RULE_MAC": "/data/rule/deleteIpMac.json",
        "CLEAR_RULE_MAC": "/data/rule/clearAllIpMac.json",
        "DEPLOY_RULE_MAC": "/data/rule/deployIpMac.json",
        //blacklist
        "UPLOAD_BLACKLIST_FILEPATH": "/data/rule/black-list-add.html.json",
        "GET_BLACKLIST_LIST": "/data/rule/blacklistRes.json",
        "GET_BLACKLIST": "/data/rule/blacklistDetail.json",
        "ADD_BLACKLIST_ALL": "/data/rule/startAllBlacklist.json",
        "CLEAR_BLACKLIST_ALL": "/data/rule/deleteAllBlacklist.json",
        "UPDATE_BLACKLIST": "/data/rule/startOneBlacklist.json",
        "GET_BLACKLIST_COUNT": "/data/rule/getdeployNum.json",
        //whitelist
        "GET_WHITELIST": "/data/rule/whitelistShowDeploy.json",
        "CLEAR_WHITELIST": "/data/rule/whitelistClear.json",
        "GET_WHITELIST_DEVICE": "/data/rule/whitelistDevice.json",
        "GET_WHITELIST_RULE": "/data/rule/whitelistRes.json",
        "START_WHITELIST_STUDY": "/data/rule/whiteliststartstudy.json",
        "STOP_WHITELIST_STUDY": "/data/rule/whiteliststopstudy.json",
        "GET_WHITELIST_STUDY_STATU": "/data/rule/whiteliststatus.json",
        "UPDATE_WHITELIST_STUDY": "/data/rule/whitelistDeploy.json",
        "UPDATE_WHITELIST_STUDY_ALL": "/data/rule/whitelistStartAll.json",
        //TopoList
        "GET_TOPO_DEVICES": "/data/nettopo/getAllTopdev.json",
        "SAVE_TOPO_DEVICES": "/data/nettopo/updateTopdevInfo.json",
        "GET_TOPO_PATH": "/data/nettopo/getTopdevPath.json",
        //Audit
        //Protocol
        "GET_PROTOCOL_LIST": "/data/audit/getFlowDataHeadSearch.json",
        "GET_PROTOCOL": "/data/audit/getDetail.json",
        "GET_FLOW_LIST": "/data/audit/getDetail.json"
    },
    "default1": {
        HTTP_METHOD: "GET",

        LOGIN_URL: "login.html",
        HOMEPAGE_URL: "index.html",
        //local version
        GET_IMAGE:"/api/v2.0/users/getImage",
        GET_SECRET_KEY: "/api/v2.0/users/getSecretKey",
        GET_SYS_TIME: "/api/getSysTime",
        CHECK_USER: "/api/v2.0/login",
        GET_USER: "/api/getUser",
        GET_HOME_BASE: "/api/indexRefreshCount",
        GET_HOME_PRODUCT: "/api/getproductinfo",
        GET_HOME_FLOW: "/api/data/home/base.json",
        GET_DEVICE_RUN_MODE: "/api/getDeviceRunMode",
        LOGOUT: "/api/v2.0/logout",
        USER_TOKEN:"/api/v2.0/users/usertoken",
        WHOAMI:"api/v2.0/users/whoami",
        //user
        CHANGE_USER_PWD: "/api/changePassword",
        DELETE_USER: "/api/deleteUser",
        ADD_USER: "/api/addUser",
        GET_USER_LIST: "/api/getAllUser",
        //event
        GET_EVENT_INFO: "/api/eventCountRefresh",
        //safe event
        GET_SAFE_EVENT_LIST: "/api/safeEventRes",
        SEARCH_SAFE_EVENT: "/api/safeEventSearch",
        GET_SAFE_EVENT: "/api/safeEventRecordDetail",
        FLAG_SAFE_EVENT_LIST: "/api/safeEventReadTag",
        DELETE_SAFE_EVENT_LIST: "/api/safeEventClearTag",
        FLAG_SAFE_EVENT: "/api/safeOneEventRead",
        EXPORT_SAFE_EVENT: "/api/safeEventExportData",
        SAFE_EVENT_FILEPATH: "/api/download/",
        //system event
        GET_SYS_EVENT_LIST: "/api/sysEventRes",
        SEARCH_SYS_EVENT: "/api/sysEventSearch",
        GET_SYS_EVENT: "/api/sysEventRecordDetail",
        FLAG_SYS_EVENT_LIST: "/api/sysEventReadTag",
        DELETE_SYS_EVENT_LIST: "/api/sysEventClearTag",
        FLAG_SYS_EVENT: "/api/sysOneEventRead",
        EXPORT_SYS_EVENT: "/api/sysEventExportData",
        SYS_EVENT_FILEPATH: "/api/download/",
        //log
        GET_LOG_INFO: "/api/getLogCount",
        //login log
        GET_LOGIN_LOG_LIST: "/api/loginLogRes",
        EXPORT_LOGIN_LOG: "/api/loginLogExportData",
        SEARCH_LOGIN_LOG_LIST: "/api/loginLogSearch",
        LOGIN_LOG_FILEPATH: "/api/download/",
        //operation log
        GET_LOGIN_OPER_LIST: "/api/operLogRes",
        EXPORT_OPER_LOG: "/api/operLogExportData",
        SEARCH_OPER_LOG_LIST: "/api/operLogSearch",
        OPER_LOG_FILEPATH: "/api/download/",
        //device
        //basice setting
        GET_DEVICE_INFO: "/api/getDeviceInfo",
        UPDATE_DEVICE_IP: "/api/setDpiIp",
        UPDATE_DEVICE_TIME_MANUAL: "/api/setTimeSynManualInput",
        UPDATE_DEVICE_TIME_AUTO: "/api/setTimeSynAuto",
        GET_DEVICE_LOGIN_INFO: "/api/getLoginPara",
        UPDATE_DEVICE_LOGIN_SETTING: "/api/loginSetting",
        UPGRADE_DEVICE: "/api/dpiUpdate",
        //advance setting 
        REBOOT_DEVICE: "/api/rebootDpi",
        SHUTDOWN_DEVICE: "/api/closeDpi",
        RESET_DEVICE: "/api/defaultPara",
        GET_DEVICE_REMOTE: "/api/isOpenRemoteCtl",
        UPDATE_DEVICE_REMOTE: "/api/updateCtlFlag",
        GET_DEVICE_NET: "/api/getTimeSynDestIp",
        GET_DEVICE_REMOTE_LIST: "/api/accessIp",
        ADD_DEVICE_REMOTE_IP: "/api/addAccessIp",
        DEPLOY_DEVICE_REMOTE_IP: "/api/deployAccessIp",
        DELETE_DEVICE_REMOTE_IP: "/api/deleteAccessIp",
        GET_DEVICE_MODE: "/api/getCurMode",
        CHANGE_DEVICE_MODE: "/api/changeModelRes",
        GET_DEVICE_SYSLOG_REMOTE: "/api/mw_showSyslogSwitch",
        GET_DEVICE_SYSLOG_REMOTE_LIST: "/api/mw_showSyslogServer",
        CHANGE_DEVICE_SYSLOG_REMOTE: "/api/mw_setSyslogSwitch",
        ADD_DEVICE_SYSLOG_REMOTE: "/api/mw_addSyslogServer",
        DELETE_DEVICE_SYSLOG_REMOTE: "/api/mw_deleteSyslogServer",
        GET_CURRUN_MODE: "/api/getCurRunmode",
        GET_CHANGE_RUN_MODEIRES: "/api/changeRunmode",
        GET_OPCDA: "/api/getOpcda",
        SET_OPCDA: "/api/setOpcda",
        //ip/mac
        GET_RULE_MAC_LIST: "/api/ipMacRes",
        UPDATE_RULE_MAC: "/api/startIpMacOne",
        ADD_RULE_MAC: "/api/addIpMac",
        DELETE_RULE_MAC: "/api/deleteIpMac",
        ENABLE_RULE_MAC: "/api/startAllIpMac",
        DISABLE_RULE_MAC: "/api/clearAllIpMac",
        GET_RULE_MAC_EVENT: "/api/getIpmacAction",
        SET_RULE_MAC_EVENT: "/api/startAllIpMac",
        GET_RULE_MAC_IDS: "/api/getAllIPMACList",
        START_RULE_IPMAC_MULTI: "/api/startSomeIpMac",
        SET_RULE_UNKNOWNIPMAC_MULTI: "/api/IPMACExtraAreaIp",
        DELETE_RULE_MAC_MULTI: "/api/deleteIpMac",
        //blacklist
        UPLOAD_BLACKLIST_FILEPATH: "/api/black-list-add.html",
        GET_BLACKLIST_LIST: "/api/blacklistRes",//©����
        GET_BLACKLIST: "/api/blacklistDetail",//©��������
        ADD_BLACKLIST_ALL: "/api/startAllBlacklist",//�������к�����
        CLEAR_BLACKLIST_ALL: "/api/deleteAllBlacklist",//������к�����
        UPDATE_BLACKLIST: "/api/startOneBlacklist",//���µ���������
        GET_BLACKLIST_COUNT: "/api/getdeployNum",
        UPDATE_BLACKLIST_ALLEVENT: "/api/blacklistSetAll",
        UPDATE_BLACKLIST_EVENT: "/api/blacklistUpdate",
        GET_BLACKLIST_IDS: "/api/getAllBlacklist",
        START_BLACKLIST_MULTI: "/api/startSomeBlacklist",
        //whitelist
        GET_WHITELIST: "/api/whitelistShowDeploy",
        CLEAR_WHITELIST: "/api/whitelistClear",
        GET_WHITELIST_DEVICE: "/api/whitelistDevice",
        GET_WHITELIST_RULE: "/api/whitelistRes",
        GET_WHITELIST_TOTAL: "/api/whitelistTotalRes",
        START_WHITELIST_STUDY: "/api/whiteliststartstudy",
        STOP_WHITELIST_STUDY: "/api/whiteliststopstudy",
        GET_WHITELIST_STUDY_STATU: "/api/whiteliststatus",
        UPDATE_WHITELIST_STUDY: "/api/whitelistDeploy",
        UPDATE_WHITELIST_STUDY_ALL: "/api/whitelistStartAll",
        UPDATE_WHITELIST_RULE: "/api/whitelistRes",
        UPDATE_WHITELIST_ALLEVENT: "/api/whitelistSetAll",
        UPDATE_WHITELIST_EVENT: "/api/whitelistUpdate",
        //custom
        IMPORT_ADL_FILE: "/api/ADLFileUpload",
        EXPORT_ADL_FILE: "/api/ADLFileExport",
        APPLY_ADL_FILE: "/api/ADLFileApply",
        CLEAR_ADL_FILE: "/api/ADLFileClear",
        DEL_ADL_FILE: "/api/ADLFileDel",
        GET_ADL_FILES: "/api/ADLFileGet",
        DETAIL_ADL_FILE: "/api/ADLFileShowDetail",
        //TopoList
        GET_TOPO_DEVICES: "/api/getAllTopdev",//��ȡ����TOPO�豸��Ϣ
        SAVE_TOPO_DEVICES: "/api/updateTopdevInfo",//��ȡ����TOPO�豸��Ϣ
        GET_TOPO_PATH: "/api/getTopdevPath",//��ȡ����TOPO
        //Audit
        //Protocol 
        GET_PROTOCOL_LIST: "/api/getFlowDataHeadSearch",
        GET_PROTOCOL: "/api/getDetail",
        GET_TOTAL_FLOW: "/api/getCurTimeTraffic",
        GET_TOTAL_FLOW_POINT: "/api/getCurTimeTrafficLatestPoint",
        GET_PROTOCOL_TOTAL_FLOW: "/api/getProtTrafficPercent",
        GET_DEVICE_TOTAL_FLOW: "/api/getDevTrafficPercent",
        GET_FLOW_LIST: "/api/getDevTrafficTable",
        GET_DEVICE_FLOW: "/api/getDevDetailTraffic",
        GET_DEVICE_PROTOCOL_FLOW: "/api/getDevDetailProtPer",
        GET_DEVICE_FLOW_LIST: "/api/getDevDetailProtTable",
        GET_DEVICE_FLOW_POINT: "/api/getDevDetailTrafficLatestPoint",

        //interface setting
        GET_PORT_LED: "/api/getLedStatus",
        GET_PORT_LIST: "/api/getPortAllConfig",
        GET_ROUTE_LIST: "/api/getRouteAllConfig",
        UPDATE_PORTS: "/api/setPortAllConfig",
        ADD_ROUTE: "/api/addRouteConfig",
        DELETE_ROUTES: "/api/delRouteConfig",

        TEST_PROJECT_NODE: "/api/TESTPROJECTNODE"
    }
};


// Constants.js
function Constants() {

}
//URL formatter
Constants.URL_FORMATTER_PREFIX_MAP =
    [
        "http://",
        "https://",
        "ftp://"
    ];
Constants.TEMPLATES = {
    HOME_DASHBOARD: "home_dashboard",
    USER_EDIT: "user_edit",
    EVENT_LIST: "event_list",
    EVENT_SAFE: "event_safe",
    EVENT_SYSTEM: "event_system",
    EVENT_SAFE_DIALOG: "event_safeDialog",
    LOG_LIST: "log_list",
    LOG_LOGIN: "log_login",
    LOG_OPERATION: "log_operation",
    DEVICE_LIST: "device_list",
    DEVICE_BASIC: "device_basic",
    DEVICE_ADVANCE: "device_advance",
    DEVICE_MODE: "device_mode",
    RULE_MAC: "rule_mac",
    RULE_CUSTOM: "rule_custom",
    RULE_CUSTOM_DIALOG:"rule_customDialog",
    RULE_WHITELIST: "rule_whitelist",
    RULE_BLACKLIST: "rule_blacklist",
    RULE_BLACKLIST_DIALOG: "rule_blacklistDialog",
    NETTOPO_LIST: "nettopo_list",
    AUDIT_PROTOCOL: "audit_protocol",
    AUDIT_PROTOCOL_HTTP: "audit_protocol_http",
    AUDIT_PROTOCOL_FTP: "audit_protocol_ftp",
    AUDIT_PROTOCOL_POP3: "audit_protocol_pop3",
    AUDIT_PROTOCOL_SMTP: "audit_protocol_smtp",
    AUDIT_PROTOCOL_TELNET: "audit_protocol_telnet",
    AUDIT_PROTOCOL_SNMP: "audit_protocol_snmp",
    AUDIT_PROTOCOL_MODBUS: "audit_protocol_modbus",
    AUDIT_PROTOCOL_OPCDA: "audit_protocol_opcda",
    AUDIT_PROTOCOL_S7: "audit_protocol_s7",
    AUDIT_PROTOCOL_DNP3: "audit_protocol_dnp3",
    AUDIT_PROTOCOL_IEC104: "audit_protocol_iec104",
    AUDIT_PROTOCOL_MMS: "audit_protocol_mms",
    AUDIT_PROTOCOL_PROFINETIO: "audit_protocol_profinetio",
    AUDIT_PROTOCOL_PNRTDCP: "audit_protocol_pnrtdcp",
    AUDIT_PROTOCOL_GOOSE: "audit_protocol_goose",
    AUDIT_PROTOCOL_SV: "audit_protocol_sv",
    AUDIT_PROTOCOL_ENIPTCP: "audit_protocol_eniptcp",
    AUDIT_PROTOCOL_ENIPUDP: "audit_protocol_enipudp",
    AUDIT_PROTOCOL_ENIPIO: "audit_protocol_enipio",
    AUDIT_PROTOCOL_OPCUA: "audit_protocol_opcua",
    AUDIT_FLOW: "audit_flow",
    AUDIT_FLOW_DETAIL: "audit_flowDetail",
    UTILITY_PAGER1: "utility_pager1",
    UTILITY_PAGER2: "utility_pager2",
    UTILITY_GUIDE_STEP_START: "utility_guide_start",
    UTILITY_GUIDE_STEP1: "utility_guide_step1",
    UTILITY_GUIDE_STEP2: "utility_guide_step2",
    UTILITY_GUIDE_STEP3: "utility_guide_step3",
    UTILITY_GUIDE_STEP4: "utility_guide_step4",
    UTILITY_GUIDE_STEP5: "utility_guide_step5",
    UTILITY_GUIDE_STEP6: "utility_guide_step6",
    UTILITY_GUIDE_STEP7: "utility_guide_step7",
    UTILITY_GUIDE_STEP_END: "utility_guide_end",
    UTILITY_ERROR: "utility_error",
    INTERFACE_EDIT:"interface_edit",
    RULE_OPCDA:"rule_opcda"
};

Constants.PORT_IMAGETYPE = {
    PORT_YES: "/images/jackbox_yes.png",
    PORT_NO: "/images/jackbox_no.png"
};

Constants.PageType = {
    HOME: "HOME_DASHBOARD",
    EVENT: "EVENT_LIST",
    LOG: "LOG_LIST",
    DEVICE: "DEVICE_LIST",
    MAC: "RULE_MAC",
    CUSTOM: "RULE_CUSTOM",
    WHITELIST: "RULE_WHITELIST",
    BLACKLIST: "RULE_BLACKLIST",
    NETTOPO: "NETTOPO_LIST",
    USER: "USER_EDIT",
    PROTOCOL: "PROTOCOL_LIST",
    FLOW: "FLOW_LIST",
    INTERFACE:"INTERFACE_EDIT",
    OPCDA:"RULE_OPCDA"
};

Constants.Languages = {
    Chinese: 1,
    English: 2
};
 
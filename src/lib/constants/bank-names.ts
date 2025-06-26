import { WithdrawalToAccountType } from "../enums/transactions/withdrawal-to-account-type.enum";

export const BANK_NAMES = [
  "1001", // AllBank (A Thrift Bank), Inc.
  "1002", // Alipay / Lazada Wallet
  "1003", // Asia United Bank Corporation
  "1004", // Bank of China
  "1005", // BDO Unibank
  "1006", // BanKo, A Subsidiary of BPI
  "1007", // Bangko Mabuhay
  "1008", // Bank of Commerce
  "1009", // BPI / BPI Family Savings Bank
  "1010", // Binangonan Rural Bank(BRBDigital)
  "1011", // China Banking Corporation
  "1012", // China Bank Savings, Inc.
  "1013", // CTBC Bank(Philippines) Corporation / 161445 CTBC Bank (Philippines), Inc.
  "1014", // Bayad
  "1015", // Cebuana Lhuillier Bank / Cebuana Xpress
  "1016", // Camalig Bank
  "1017", // CIMB Philippines, Inc.
  "1018", // CARD Bank Inc.
  "1019", // Dungganon Bank(A Microfinance Rural Bank), Inc.
  "1020", // Development Bank of the Philippines
  "1021", // Dumaguete City Development Bank
  "1022", // Coins.ph(DCPay)
  "1023", // Equicom Savings Bank, Inc.
  "1024", // Entrepreneur Rural Bank, Inc./ ENTRP
  "1025", // East West Banking Corporation
  "1026", // Komo / EastWest Rural Bank
  "1027", // GrabPay
  "1028", // SH Gcash / G-Xchange
  "1029", // GoTyme Bank
  "1030", // Infoserve / Nationlink
  "1031", // ING Bank N.V.
  "1032", // I-Remit / iCASH
  "1033", // ISLA Bank(A Thrift Bank), Inc.
  "1034", // LANDBANK / OFBank
  "1035", // Luzon Development Bank
  "1036", // Legazpi Savings Bank
  "1037", // Mindanao Consolidated CoopBank
  "1038", // Metropolitan Bank and Trust Co.
  "1039", // Maybank Philippines, Inc.
  "1040", // Malayan Bank Savings and Mortgage Bank, Inc.
  "1041", // Maya Bank, Inc.
  "1042", // Netbank (Community Rural Bank of Romblon, Inc.)
  "1043", // BDO Network Bank
  "1044", // OmniPay, Inc.
  "1045", // Partner Rural Bank(Cotabato), Inc.
  "1046", // Pacific Ace Savings Bank
  "1047", // Philippine Business Bank, Inc., A Savings Bank
  "1048", // Philippine Bank of Communications
  "1049", // Philippine National Bank(PNB)
  "1050", // PayMaya Philippines, Inc.
  "1051", // PalawanPay / Philippine Payments and Settlements Corporation / PPS-PEPP Financial Services Corporation
  "1052", // Producers Bank
  "1053", // Philippine Savings Bank
  "1054", // Philippine Trust Company
  "1055", // Philippine Veterans Bank
  "1056", // Queenbank / Queen City Development Bank, Inc.
  "1057", // Quezon Capital Rural Bank
  "1058", // CARD MRI RIZAL BANK INC.
  "1059", // Robinsons Bank Corporation
  "1060", // RCBC/ DiskarTech
  "1061", // Sterling Bank of Asia, Inc(A Savings Bank)
  "1062", // Standard Chartered Bank
  "1063", // Seabank
  "1064", // Security Bank Corporation
  "1065", // CARD SME Bank
  "1066", // ShopeePay
  "1067", // Starpay
  "1068", // Sun Savings Bank, Inc.
  "1069", // TayoCash
  "1070", // Tonik Bank
  "1071", // TraxionPay/ DigiCOOP / COOPNET
  "1072", // Union Bank of the Philippines
  "1073", // United Coconut Planters Bank(UCPB)
  "1074", // UnionDigital Bank
  "1075", // USSC Money Services
  "1076", // UNObank
  "1077", // UCPB Savings Bank
  "1078", // Wealth Development Bank
  "1079", // JuanCash(Zybi Tech Inc.)
  "1080", // Yuanta Savings Bank, Inc. /  Tongyang Savings Bank
  "1081", // Rural Bank of Guinobatan, Inc.
  "1082", // Lulu Financial Services (Phils) Inc.
  "1083", // BAYANIHAN BANK INC
  "1084", // CANTILAN BANK, INC.
  "1085", // COMMUNITY RURAL BANK OF ROMBLON
  "1086", // ECASHPAY ASIA INC
  "1087", // MARCOPAY INC
  "1088", // RANG-AY BANK A RURAL BANK INC
  "1089", // SPEEDYPAY INC
  "1090", // BananaPay
  "1091", // PayMongo
  "1092", // Easy Pay Global EMI Corp
  "1093", // Own Bank
  "1094", // Philippine Digital Asset Exchange (PDAX)
  "1095", // Toktokwallet Inc.
  "1096", // City Savings Bank
  "1097", // HSBC
  "1098", // TopJuan Tech Corporation
  "1099", // Vigan Banco Rural Incorporada
  "1100", // Wise Pilipinas Inc
  "1101", // Paynamics Technology Inc
];

export const BANK_NAMES_MAPPING = {
  "1001": "1001: AllBank (A Thrift Bank), Inc.",
  "1002": "1002: Alipay / Lazada Wallet",
  "1003": "1003: Asia United Bank Corporation",
  "1004": "1004: Bank of China",
  "1005": "1005: BDO Unibank",
  "1006": "1006: BanKo, A Subsidiary of BPI",
  "1007": "1007: Bangko Mabuhay",
  "1008": "1008: Bank of Commerce",
  "1009": "1009: BPI / BPI Family Savings Bank",
  "1010": "1010: Binangonan Rural Bank(BRBDigital)",
  "1011": "1011: China Banking Corporation",
  "1012": "1012: China Bank Savings, Inc.",
  "1013":
    "1013: CTBC Bank(Philippines) Corporation / 161445 CTBC Bank (Philippines), Inc.",
  "1014": "1014: Bayad",
  "1015": "1015: Cebuana Lhuillier Bank / Cebuana Xpress",
  "1016": "1016: Camalig Bank",
  "1017": "1017: CIMB Philippines, Inc.",
  "1018": "1018: CARD Bank Inc.",
  "1019": "1019: Dungganon Bank(A Microfinance Rural Bank), Inc.",
  "1020": "1020: Development Bank of the Philippines",
  "1021": "1021: Dumaguete City Development Bank",
  "1022": "1022: Coins.ph(DCPay)",
  "1023": "1023: Equicom Savings Bank, Inc.",
  "1024": "1024: Entrepreneur Rural Bank, Inc./ ENTRP",
  "1025": "1025: East West Banking Corporation",
  "1026": "1026: Komo / EastWest Rural Bank",
  "1027": "1027: GrabPay",
  "1028": "1028: SH Gcash / G-Xchange",
  "1029": "1029: GoTyme Bank",
  "1030": "1030: Infoserve / Nationlink",
  "1031": "1031: ING Bank N.V.",
  "1032": "1032: I-Remit / iCASH",
  "1033": "1033: ISLA Bank(A Thrift Bank), Inc.",
  "1034": "1034: LANDBANK / OFBank",
  "1035": "1035: Luzon Development Bank",
  "1036": "1036: Legazpi Savings Bank",
  "1037": "1037: Mindanao Consolidated CoopBank",
  "1038": "1038: Metropolitan Bank and Trust Co.",
  "1039": "1039: Maybank Philippines, Inc.",
  "1040": "1040: Malayan Bank Savings and Mortgage Bank, Inc.",
  "1041": "1041: Maya Bank, Inc.",
  "1042": "1042: Netbank (Community Rural Bank of Romblon, Inc.)",
  "1043": "1043: BDO Network Bank",
  "1044": "1044: OmniPay, Inc.",
  "1045": "1045: Partner Rural Bank(Cotabato), Inc.",
  "1046": "1046: Pacific Ace Savings Bank",
  "1047": "1047: Philippine Business Bank, Inc., A Savings Bank",
  "1048": "1048: Philippine Bank of Communications",
  "1049": "1049: Philippine National Bank(PNB)",
  "1050": "1050: PayMaya Philippines, Inc.",
  "1051":
    "1051: PalawanPay / Philippine Payments and Settlements Corporation / PPS-PEPP Financial Services Corporation",
  "1052": "1052: Producers Bank",
  "1053": "1053: Philippine Savings Bank",
  "1054": "1054: Philippine Trust Company",
  "1055": "1055: Philippine Veterans Bank",
  "1056": "1056: Queenbank / Queen City Development Bank, Inc.",
  "1057": "1057: Quezon Capital Rural Bank",
  "1058": "1058: CARD MRI RIZAL BANK INC.",
  "1059": "1059: Robinsons Bank Corporation",
  "1060": "1060: RCBC/ DiskarTech",
  "1061": "1061: Sterling Bank of Asia, Inc(A Savings Bank)",
  "1062": "1062: Standard Chartered Bank",
  "1063": "1063: Seabank",
  "1064": "1064: Security Bank Corporation",
  "1065": "1065: CARD SME Bank",
  "1066": "1066: ShopeePay",
  "1067": "1067: Starpay",
  "1068": "1068: Sun Savings Bank, Inc.",
  "1069": "1069: TayoCash",
  "1070": "1070: Tonik Bank",
  "1071": "1071: TraxionPay/ DigiCOOP / COOPNET",
  "1072": "1072: Union Bank of the Philippines",
  "1073": "1073: United Coconut Planters Bank(UCPB)",
  "1074": "1074: UnionDigital Bank",
  "1075": "1075: USSC Money Services",
  "1076": "1076: UNObank",
  "1077": "1077: UCPB Savings Bank",
  "1078": "1078: Wealth Development Bank",
  "1079": "1079: JuanCash(Zybi Tech Inc.)",
  "1080": "1080: Yuanta Savings Bank, Inc. / Tongyang Savings Bank",
  "1081": "1081: Rural Bank of Guinobatan, Inc.",
  "1082": "1082: Lulu Financial Services (Phils) Inc.",
  "1083": "1083: BAYANIHAN BANK INC",
  "1084": "1084: CANTILAN BANK, INC.",
  "1085": "1085: COMMUNITY RURAL BANK OF ROMBLON",
  "1086": "1086: ECASHPAY ASIA INC",
  "1087": "1087: MARCOPAY INC",
  "1088": "1088: RANG-AY BANK A RURAL BANK INC",
  "1089": "1089: SPEEDYPAY INC",
  "1090": "1090: BananaPay",
  "1091": "1091: PayMongo",
  "1092": "1092: Easy Pay Global EMI Corp",
  "1093": "1093: Own Bank",
  "1094": "1094: Philippine Digital Asset Exchange (PDAX)",
  "1095": "1095: Toktokwallet Inc.",
  "1096": "1096: City Savings Bank",
  "1097": "1097: HSBC",
  "1098": "1098: TopJuan Tech Corporation",
  "1099": "1099: Vigan Banco Rural Incorporada",
  "1100": "1100: Wise Pilipinas Inc",
  "1101": "1101: Paynamics Technology Inc",
};

export const getWithdrawalToAccountTypeFromBankName = (bankName: string) => {
  switch (bankName) {
    case "1028":
      return WithdrawalToAccountType.GCASH_ACCOUNT;
    case "1050":
      return WithdrawalToAccountType.MAYA_ACCOUNT;
    default:
      return WithdrawalToAccountType.BANK_ACCOUNT;
  }
};

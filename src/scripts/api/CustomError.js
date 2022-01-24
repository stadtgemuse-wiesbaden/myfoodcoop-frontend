export default class CustomError {
    constructor(errorCode, message, status = 450, details = []) {
        this.errorCode = errorCode;
        this.message = message;
        this.stauts = status;
        this.details = details;
    }
}

export const ErrorCodes = {
    BALANCE_NOT_A_NUMBER: 450001,
    TOPUP_AMOUNT_NOT_A_NUMBER: 450002,
    WITHDRAW_AMOUNT_NOT_A_NUMBER: 450003
};

export const ErrorTranslation = errorCode => errorTranslations[errorCode] 
    || `Ein unbekannter Fehler ist aufgetreten (${errorCode})`;

const errorTranslations = {
    400001: "Fehlender Request Parameter",
    400002: "Anfrage konnte nicht zugewiesen werden",
    400003: "Fehlerhafter Datentyp",
    400004: "Nachricht konnte nicht gelesen werden",
    400005: "Nicht valides Argument",
    400006: "Fehlerhafte Anfrage",
    400007: "Fehlerhafter Port",
    400008: "Keine valide Mengenstückelung",
    400009: "Produkt wurde gelöscht",
    400010: "Mehrere Produkte mit der gleichen ID",
    400011: "Gelöschte Produkte können nicht gekauft werden",
    400012: "bis-zum-Datum ist nach dem ab-dem-Datum",
    400013: "Report Daten liegen in der Zukunft",
    400014: "EMail wird bereits verwendet",
    400015: "Benutzername wird bereits verwendet",
    400016: "Mitgliedsnummer wird bereits verwendet",
    400017: "Benutzer hat bereits eine Rolle",
    400018: "Benutzer ist der letzte Admin",
    400019: "Produkt ist noch nicht auf Lager",
    400020: "Mitglied kann diesen Filter nicht benutzen",
    400021: "Produkt ist ausverkauft",
    400022: "Benutzer ist nicht aktiv",
    400023: "Benutzer wurde gelöscht",
    400024: "Ein gelöschtes Produkt kann nicht entsorgt werden",
    400025: "Produkt hat keinen Preis",
    401001: "Benutzer und Einkauf stimmen nicht überein",
    401002: "Ungültiger Token",
    401003: "Token ist abgelaufen",
    401004: "Benutzername oder Passwort falsch",
    401005: "Zugang verweigert",
    401006: "Ungültige Token Signatur",
    401007: "Legitimationstoken benötigt",
    401008: "Refresh Token stimmt nicht mit Benutzer überein",
    401009: "Refresh Token ungültig",
    404001: "Kein Händler gefunden",
    404003: "Produkt nicht gefunden",
    404004: "Einkauf nicht gefunden",
    404005: "Benutzer nicht gefunden",
    404006: "Benutzer hat keine Rolle",
    405001: "Methode nicht erlaubt",
    406001: "Nicht akzeptierbar",
    415001: "Ungültiger Media Type",
    500001: "Ein interner Serverfehler ist aufgetreten",
    500002: "Fehlende Pfadvariable",
    500003: "Konvertierung wird nicht unterstützt",
    500004: "Nachricht konnte nicht geschrieben werden",
    500008: "Unbekannte Produkt-Klasse",
    503001: "Fehler bei der asynchronen Verarbeitung"
};

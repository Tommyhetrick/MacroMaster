#Requires AutoHotkey v2.0
A_IconTip := "MM Updater"

#Include "JSON.ahk"
#Include "utils/getUConId.ahk"

serverPort := A_Args[1]

global data

try {
    whr := ComObject("WinHttp.WinHttpRequest.5.1")

    whr.Open("GET", "http://127.0.0.1:" . serverPort, false)

    whr.Send()

    if (whr.Status == 200) {
        rawJsonText := whr.ResponseText
        data := JSON.Parse(rawJsonText)
    } else {
        MsgBox("Server responded with an error code: " . whr.Status)
    }
}
catch Error as err {
    MsgBox("Failed to connect to the local Node server.`nMake sure the server is running on port " . serverPort .
        "!`n`nDetails: " .
        err.Message)
}

handleEarlyReset(wParam, lParam, msg, hwnd) {
    out.Write(JSON.stringify({
        type: 'earlyReset'
    }))
    out.Read(0)
}

OnMessage(0x5555, handleEarlyReset)

out := FileOpen("*", "w")

initPrograms := {}
currentProgram := "~WAITING"
lastOutput := {}

; loop {
;     results := getCurrentProgName()
;     cleanExeName := results[1]
;     friendlyName := results[2]

;     if (currentProgram != cleanExeName) {
;         if (initPrograms.HasProp(cleanExeName)) {

;         }

;         currentProgram := cleanExeName
;         out.Write(friendlyName)
;         out.Read(0)
;     }

;     Sleep 50
; }

loop {

    try {
        output := {
            name: {
                data: '',
                changed: false
            },
            uConId: {
                data: '',
                changed: false
            }
        }

        if (!lastOutput.HasProp('name')) {
            lastOutput := output
        }

        hasChanged := false

        processName := WinGetProcessName("A")
        cleanExeName := StrLower(StrReplace(processName, ".exe", ""))

        newName := getFriendlyName(cleanExeName)
        output.name.changed := (newName != lastOutput.name.data)
        output.name.data := newName

        if (output.name.changed) {
            hasChanged := true
        }

        control := ControlGetFocus("A")

        if (control != 0) {
            try {
                uConId := getUConId(control)
                output.uConId.changed := (uConId != lastOutput.uConId.data)
                output.uConId.data := uConId
                if (output.uConId.changed) {
                    hasChanged := true
                }
            }
        }

        if (hasChanged) {
            out.Write(JSON.stringify({
                type: "stateUpdate",
                data: output
            }))
            out.Read(0)
            lastOutput := output
        }
    }
    Sleep 50
}

Persistent()

; Returns [cleanExeName, friendlyName]
getCurrentProgName() {
    output := ["~INVALID", "~INVALID"]
    if (WinExist("A")) {
        try {
            processName := WinGetProcessName("A")
            cleanExeName := StrReplace(processName, ".exe", "")
            cleanExeName := StrLower(cleanExeName)

            friendlyName := getFriendlyName(cleanExeName)

            output := [cleanExeName, friendlyName]
        }
    }

    return output
}

getFriendlyName(cleanExeName) {
    friendlyName := "~INVALID" . "_" . cleanExeName

    if (data["programs"].Has(cleanExeName)) {
        friendlyName := data["programs"][cleanExeName]["name"]
    }

    return friendlyName
}

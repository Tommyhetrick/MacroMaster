#Requires AutoHotkey v2.0

getUConId(control?) {
    actualControl := ""
    if (IsSet(control)) {
        actualControl := control
    } else {
        try {
            actualControl := ControlGetFocus("A")
        }
    }

    if (actualControl != 0) {
        return ControlGetClassNN(actualControl) . "~~" WinGetID("A")
    }
}

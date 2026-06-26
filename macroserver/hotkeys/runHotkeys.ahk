#Requires AutoHotkey v2.0
A_IconTip := "MM Runner"

f := FileOpen("*", "r")

while true {
    line := f.ReadLine()
    if (line == "") {
        Sleep 50
        continue
    }

    macroPath := "macros\" . line . ".ahk"
    if (FileExist(macroPath)) {
        Run macroPath
    } else {
        MsgBox "Invalid macro recieved: " . line
    }
    ;MsgBox("Received: " . line)
}

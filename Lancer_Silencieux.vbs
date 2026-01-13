Set WshShell = CreateObject("WScript.Shell")
CurrentDir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Lancer le serveur en mode invisible (0)
WshShell.Run chr(34) & CurrentDir & "\Start_Hidden.bat" & chr(34), 0
Set WshShell = Nothing
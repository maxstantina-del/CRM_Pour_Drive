Set WshShell = WScript.CreateObject("WScript.Shell")
strDesktop = WshShell.SpecialFolders("Desktop")
Set oShellLink = WshShell.CreateShortcut(strDesktop & "\Lancer CRM.lnk")
oShellLink.TargetPath = "C:\Users\maxst\CRM_Pour_Drive\Dev Rapide.bat"
oShellLink.WorkingDirectory = "C:\Users\maxst\CRM_Pour_Drive"
oShellLink.IconLocation = "C:\Users\maxst\CRM_Pour_Drive\build\crm.ico, 0"
oShellLink.Description = "Lancer CRM Simple"
oShellLink.Save

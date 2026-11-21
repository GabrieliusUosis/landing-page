Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Users\gabri\OneDrive\Desktop\Projec archive\CommandCenter"
WshShell.Run "cmd /c node server/index.js", 0, False

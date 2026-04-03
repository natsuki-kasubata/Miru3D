# Miru3D File Association Unregistration Script

$ErrorActionPreference = "SilentlyContinue"

$extensions = @(".glb", ".gltf", ".fbx", ".obj", ".vrm", ".ply", ".splat", ".ksplat")
$progIds = @("Miru3D.glb", "Miru3D.gltf", "Miru3D.fbx", "Miru3D.obj", "Miru3D.vrm", "Miru3D.ply", "Miru3D.splat", "Miru3D.ksplat")

foreach ($progId in $progIds) {
    Remove-Item -Path "HKCU:\Software\Classes\$progId" -Recurse -Force
    Write-Host "  Removed ProgId: $progId" -ForegroundColor Yellow
}

foreach ($ext in $extensions) {
    $extKey = "HKCU:\Software\Classes\$ext"
    $current = (Get-ItemProperty -Path $extKey -Name "(Default)" -ErrorAction SilentlyContinue)."(Default)"
    if ($current -like "Miru3D.*") {
        Remove-Item -Path $extKey -Recurse -Force
        Write-Host "  Removed extension: $ext" -ForegroundColor Yellow
    } else {
        # Just remove OpenWithProgids entry
        $progId = "Miru3D" + $ext.Replace(".", ".")
        Remove-ItemProperty -Path "$extKey\OpenWithProgids" -Name "Miru3D$($ext.Substring(1))" -Force
    }
}

# Refresh Explorer
$code = @"
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int wEventId, int uFlags, System.IntPtr dwItem1, System.IntPtr dwItem2);
"@
$shell = Add-Type -MemberDefinition $code -Name "ShellNotify2" -Namespace "Win32" -PassThru
$shell::SHChangeNotify(0x08000000, 0, [System.IntPtr]::Zero, [System.IntPtr]::Zero)

Write-Host ""
Write-Host "File associations removed." -ForegroundColor Green
Read-Host "Press Enter to exit"

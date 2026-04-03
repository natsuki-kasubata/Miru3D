# Miru3D File Association Registration Script
# Run as Administrator: Right-click > "Run with PowerShell" (or run from elevated terminal)

$ErrorActionPreference = "Stop"

# Auto-detect Miru3D.exe path (same directory structure as build output)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$exePath = Join-Path (Split-Path -Parent $scriptDir) "release\win-unpacked\Miru3D.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "ERROR: Miru3D.exe not found at: $exePath" -ForegroundColor Red
    Write-Host "Make sure you've built the app first (npm run package)" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

$exePath = (Resolve-Path $exePath).Path
Write-Host "Miru3D.exe: $exePath" -ForegroundColor Cyan

# Define file associations
$associations = @(
    @{ Ext = ".glb";    ProgId = "Miru3D.glb";    Name = "GLB 3D Model" }
    @{ Ext = ".gltf";   ProgId = "Miru3D.gltf";   Name = "GLTF 3D Model" }
    @{ Ext = ".fbx";    ProgId = "Miru3D.fbx";     Name = "FBX 3D Model" }
    @{ Ext = ".obj";    ProgId = "Miru3D.obj";     Name = "OBJ 3D Model" }
    @{ Ext = ".vrm";    ProgId = "Miru3D.vrm";     Name = "VRM Avatar" }
    @{ Ext = ".ply";    ProgId = "Miru3D.ply";     Name = "PLY Point Cloud" }
    @{ Ext = ".splat";  ProgId = "Miru3D.splat";   Name = "Splat File" }
    @{ Ext = ".ksplat"; ProgId = "Miru3D.ksplat";  Name = "KSplat File" }
)

foreach ($assoc in $associations) {
    $ext = $assoc.Ext
    $progId = $assoc.ProgId
    $name = $assoc.Name

    # Register ProgId
    $progIdKey = "HKCU:\Software\Classes\$progId"
    New-Item -Path $progIdKey -Force | Out-Null
    Set-ItemProperty -Path $progIdKey -Name "(Default)" -Value $name

    # shell\open\command
    $cmdKey = "$progIdKey\shell\open\command"
    New-Item -Path $cmdKey -Force | Out-Null
    Set-ItemProperty -Path $cmdKey -Name "(Default)" -Value "`"$exePath`" `"%1`""

    # DefaultIcon
    $iconKey = "$progIdKey\DefaultIcon"
    New-Item -Path $iconKey -Force | Out-Null
    Set-ItemProperty -Path $iconKey -Name "(Default)" -Value "`"$exePath`",0"

    # Register extension -> ProgId mapping
    $extKey = "HKCU:\Software\Classes\$ext"
    New-Item -Path $extKey -Force | Out-Null
    Set-ItemProperty -Path $extKey -Name "(Default)" -Value $progId

    # Set in UserChoice via OpenWithProgids (more reliable than forcing UserChoice)
    $openWithKey = "$extKey\OpenWithProgids"
    New-Item -Path $openWithKey -Force | Out-Null
    New-ItemProperty -Path $openWithKey -Name $progId -Value "" -PropertyType String -Force | Out-Null

    Write-Host "  Registered: $ext -> $name" -ForegroundColor Green
}

# Notify Windows Explorer to refresh icon cache
$code = @"
[System.Runtime.InteropServices.DllImport("shell32.dll")]
public static extern void SHChangeNotify(int wEventId, int uFlags, System.IntPtr dwItem1, System.IntPtr dwItem2);
"@
$shell = Add-Type -MemberDefinition $code -Name "ShellNotify" -Namespace "Win32" -PassThru
$shell::SHChangeNotify(0x08000000, 0, [System.IntPtr]::Zero, [System.IntPtr]::Zero)

Write-Host ""
Write-Host "All file associations registered successfully!" -ForegroundColor Green
Write-Host "You can now double-click 3D model files to open them in Miru3D." -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: If Windows still opens another app, right-click the file > 'Open with' > 'Miru3D'" -ForegroundColor Yellow
Read-Host "Press Enter to exit"

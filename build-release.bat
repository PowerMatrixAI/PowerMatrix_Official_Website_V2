@echo off
setlocal EnableExtensions

set "PROJECT_ROOT=%~dp0"
set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"
set "RELEASE_ROOT=%PROJECT_ROOT%\release"

if "%~1"=="" (
  for /f %%i in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "RELEASE_NAME=dist-ts-%%i"
) else (
  set "RELEASE_NAME=%~1"
)

echo %RELEASE_NAME%| findstr /r "^[A-Za-z0-9][A-Za-z0-9._-]*$" >nul
if errorlevel 1 (
  echo Invalid release folder name: %RELEASE_NAME%
  pause
  exit /b 1
)

set "TARGET_DIR=%RELEASE_ROOT%\%RELEASE_NAME%"

if exist "%TARGET_DIR%" (
  echo Release folder already exists: %TARGET_DIR%
  echo Please delete it first or use a different name.
  pause
  exit /b 1
)

if not exist "%RELEASE_ROOT%" mkdir "%RELEASE_ROOT%"
mkdir "%TARGET_DIR%" || (
  echo Failed to create release folder: %TARGET_DIR%
  pause
  exit /b 1
)

for %%d in (assets scripts styles) do (
  if not exist "%PROJECT_ROOT%\%%d" (
    echo Missing required folder: %PROJECT_ROOT%\%%d
    pause
    exit /b 1
  )

  robocopy "%PROJECT_ROOT%\%%d" "%TARGET_DIR%\%%d" /E /NFL /NDL /NJH /NJS /NP >nul
  if errorlevel 8 (
    echo Failed to copy folder: %%d
    pause
    exit /b 1
  )
)

if not exist "%PROJECT_ROOT%\index.html" (
  echo Missing required file: %PROJECT_ROOT%\index.html
  pause
  exit /b 1
)

copy /B /Y "%PROJECT_ROOT%\index.html" "%TARGET_DIR%\index.html" >nul
if errorlevel 1 (
  echo Failed to copy index.html.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $path=Join-Path $env:TARGET_DIR 'index.html'; $name=$env:RELEASE_NAME; $utf8=New-Object System.Text.UTF8Encoding($false); $html=[System.IO.File]::ReadAllText($path, $utf8); $q=[char]34; $nl=[Environment]::NewLine; $base='  <base href=' + $q + '/' + $name + '/' + $q + ' />'; $pattern='<base\s+href=' + $q + '[^' + $q + ']*' + $q + '\s*/?>'; if ($html -match $pattern) { $html=[regex]::Replace($html, $pattern, $base, 1) } elseif ($html -match '(?m)^(\s*)<title\b') { $html=[regex]::Replace($html, '(?m)^(\s*)<title\b', $base + $nl + '$1<title', 1) } else { $html=[regex]::Replace($html, '<head(\s*)>', '<head$1>' + $nl + $base, 1) }; [System.IO.File]::WriteAllText($path, $html, $utf8)"
if errorlevel 1 (
  echo Failed to update base href.
  pause
  exit /b 1
)

echo.
echo Created release:
echo %TARGET_DIR%
echo.
pause

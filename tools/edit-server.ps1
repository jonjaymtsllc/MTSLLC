# Moore Tutoring Solutions - local editing server
# ------------------------------------------------
# Started by double-clicking "Edit Website.bat" in the website folder.
#
# What it does:
#   * Serves this website folder at http://localhost:8000 so the browser
#     treats it like a real website (editing mode works properly).
#   * Listens for the "Save" button in editing mode and writes your changes
#     straight back into the .html file in this folder.
#   * Keeps a timestamped copy of the old file in the _backups folder every
#     time you save, so nothing is ever lost.
#
# Nothing leaves your computer. Close the black window to stop it.

param([switch]$NoBrowser)

$ErrorActionPreference = 'Stop'

$root =[IO.Path]::GetFullPath((Split-Path -Parent $PSScriptRoot))
$backupDir = Join-Path $root '_backups'

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'application/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.jpeg' = 'image/jpeg'
  '.gif'  = 'image/gif'
  '.webp' = 'image/webp'
  '.ico'  = 'image/x-icon'
  '.woff' = 'font/woff'
  '.woff2'= 'font/woff2'
  '.txt'  = 'text/plain; charset=utf-8'
  '.md'   = 'text/plain; charset=utf-8'
  '.pdf'  = 'application/pdf'
}

function Send-Text($ctx, [int]$status, [string]$body, [string]$type = 'text/plain; charset=utf-8') {
  $bytes = [Text.Encoding]::UTF8.GetBytes($body)
  $ctx.Response.StatusCode = $status
  $ctx.Response.ContentType = $type
  $ctx.Response.Headers['Cache-Control'] = 'no-store'
  $ctx.Response.ContentLength64 = $bytes.Length
  $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

# ----- Start listening (tries a few ports in case one is busy) -----
$port = 0
$listener = $null
foreach ($p in 8000, 8080, 8123, 8765) {
  try {
    $candidate = New-Object System.Net.HttpListener
    $candidate.Prefixes.Add("http://localhost:$p/")
    $candidate.Start()
    $listener = $candidate
    $port = $p
    break
  } catch {
    if ($candidate) { $candidate.Close() }
  }
}

if (-not $listener) {
  Write-Host ''
  Write-Host '  Could not start the editing server.' -ForegroundColor Red
  Write-Host '  Ports 8000, 8080, 8123 and 8765 all appear to be in use.'
  Write-Host '  Restarting your computer usually clears this up.'
  Write-Host ''
  Read-Host 'Press Enter to close'
  exit 1
}

$homeUrl = "http://localhost:$port/index.html?edit"

Write-Host ''
Write-Host '  Moore Tutoring Solutions - editing mode' -ForegroundColor Cyan
Write-Host '  ---------------------------------------'
Write-Host "  Your site is open at: $homeUrl"
Write-Host '  Click any text to change it, then click Save.'
Write-Host '  Saves go straight into this folder (old copies kept in _backups).'
Write-Host ''
Write-Host '  Leave this window open while you edit. Close it when you are done.' -ForegroundColor Yellow
Write-Host ''

if (-not $NoBrowser) {
  try {
    Start-Process $homeUrl | Out-Null
  } catch {
    Write-Host '  Could not open your browser automatically.' -ForegroundColor Yellow
    Write-Host "  Copy this address into your browser instead: $homeUrl"
    Write-Host ''
  }
}

while ($listener.IsListening) {
  try {
    $ctx = $listener.GetContext()
  } catch {
    break
  }

  try {
    $req = $ctx.Request
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)

    # --- Editing mode uses this to check the server is running ---
    if ($path -eq '/__ping') {
      Send-Text $ctx 200 'mts-editor'
      $ctx.Response.Close()
      continue
    }

    # --- The Save button posts the updated page here ---
    if ($path -eq '/__save' -and $req.HttpMethod -eq 'POST') {
      $name = $req.Headers['X-MTS-File']

      # Only ever write a plain .html file sitting in the website folder itself.
      if (-not $name -or $name -notmatch '^[A-Za-z0-9_\-]+\.html$') {
        Send-Text $ctx 400 "Refused to save: unexpected file name '$name'."
        $ctx.Response.Close()
        continue
      }

      $reader = New-Object IO.StreamReader($req.InputStream, [Text.Encoding]::UTF8)
      $html = $reader.ReadToEnd()
      $reader.Close()

      if ([string]::IsNullOrWhiteSpace($html)) {
        Send-Text $ctx 400 'Refused to save: the page came through empty.'
        $ctx.Response.Close()
        continue
      }

      $target = Join-Path $root $name
      $backupNote = ''

      if (Test-Path -LiteralPath $target) {
        if (-not (Test-Path -LiteralPath $backupDir)) {
          New-Item -ItemType Directory -Path $backupDir | Out-Null
        }
        $stamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
        $backupName = [IO.Path]::GetFileNameWithoutExtension($name) + "_$stamp.html"
        Copy-Item -LiteralPath $target -Destination (Join-Path $backupDir $backupName)
        $backupNote = " (previous version saved as _backups\$backupName)"

        # Keep the folder tidy: only the 30 most recent backups survive.
        Get-ChildItem -LiteralPath $backupDir -Filter '*.html' |
          Sort-Object LastWriteTime -Descending |
          Select-Object -Skip 30 |
          Remove-Item -Force -ErrorAction SilentlyContinue
      }

      [IO.File]::WriteAllText($target, $html, (New-Object Text.UTF8Encoding($false)))

      Write-Host ("  Saved {0}{1}" -f $name, $backupNote) -ForegroundColor Green
      Send-Text $ctx 200 'saved'
      $ctx.Response.Close()
      continue
    }

    # --- Everything else: serve the file from this folder ---
    $rel = $path.TrimStart('/')
    if ($rel -eq '') { $rel = 'index.html' }
    $rel = $rel -replace '/', '\'

    $full = [IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) {
      Send-Text $ctx 403 'Not allowed.'
      $ctx.Response.Close()
      continue
    }

    if ((Test-Path -LiteralPath $full -PathType Container)) {
      $full = Join-Path $full 'index.html'
    }

    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
      Send-Text $ctx 404 "Not found: $rel"
      $ctx.Response.Close()
      continue
    }

    $ext = [IO.Path]::GetExtension($full).ToLower()
    $type = $mime[$ext]
    if (-not $type) { $type = 'application/octet-stream' }

    $bytes = [IO.File]::ReadAllBytes($full)
    $ctx.Response.StatusCode = 200
    $ctx.Response.ContentType = $type
    $ctx.Response.Headers['Cache-Control'] = 'no-store'
    $ctx.Response.ContentLength64 = $bytes.Length
    $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    $ctx.Response.Close()
  } catch {
    Write-Host ("  Problem handling a request: {0}" -f $_.Exception.Message) -ForegroundColor Red
    try { $ctx.Response.Close() } catch { }
  }
}

$listener.Stop()
$listener.Close()

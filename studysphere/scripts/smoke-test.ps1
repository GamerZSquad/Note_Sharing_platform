$ErrorActionPreference = "Stop"
$base = "http://localhost:3000"
$results = @()

function Test-Route {
  param(
    [string]$Name,
    [string]$Url,
    [string[]]$Expect,
    [string]$CookieFile = $null
  )
  $curlArgs = @("-s", "-o", "NUL", "-w", "%{http_code}", "-L", "--max-redirs", "0")
  if ($CookieFile) {
    $curlArgs += @("-b", $CookieFile, "-c", $CookieFile)
  }
  $curlArgs += $Url
  $code = & curl.exe @curlArgs
  $ok = $Expect -contains $code
  $script:results += [PSCustomObject]@{
    Test     = $Name
    Status   = $code
    Expected = ($Expect -join "/")
    Pass     = $ok
  }
}

Write-Host "=== StudySphere Smoke Test ===" -ForegroundColor Cyan

Test-Route "Home" "$base/" @("200")
Test-Route "Explore" "$base/explore" @("200")
Test-Route "Search page" "$base/search?q=deadlock" @("200")
Test-Route "Login" "$base/login" @("200")
Test-Route "Register" "$base/register" @("200")
Test-Route "Forgot password" "$base/forgot-password" @("200")

Test-Route "Upload (guest)" "$base/upload" @("307")
Test-Route "Dashboard (guest)" "$base/dashboard" @("307")
Test-Route "Library (guest)" "$base/library" @("307")
Test-Route "Admin (guest)" "$base/admin" @("307")

$searchBody = curl.exe -s "$base/api/search?q=DBMS%20normalization"
$searchJson = $searchBody | ConvertFrom-Json
$searchOk = $searchJson.ok -eq $true -and $searchJson.data.community.Count -gt 0
$results += [PSCustomObject]@{
  Test     = "API: unified search"
  Status   = if ($searchOk) { "200+ok" } else { "fail" }
  Expected = "200+ok"
  Pass     = $searchOk
}

$subjectsBody = curl.exe -s "$base/api/subjects"
$subjectsJson = $subjectsBody | ConvertFrom-Json
$subjectsOk = $subjectsJson.ok -eq $true -and $subjectsJson.data.Count -gt 0
$results += [PSCustomObject]@{
  Test     = "API: subjects"
  Status   = if ($subjectsOk) { "200+ok" } else { "fail" }
  Expected = "200+ok"
  Pass     = $subjectsOk
}

$cookieStudent = Join-Path (Get-Location) "smoke-student.txt"
Remove-Item $cookieStudent -ErrorAction SilentlyContinue
$csrf = (curl.exe -s -c $cookieStudent -b $cookieStudent "$base/api/auth/csrf" | ConvertFrom-Json).csrfToken
$loginStudent = curl.exe -s -o NUL -w "%{http_code}" -c $cookieStudent -b $cookieStudent -X POST "$base/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" -d "csrfToken=$csrf&email=student@studysphere.dev&password=Student123&redirect=false&json=true"
$results += [PSCustomObject]@{
  Test     = "Auth: student login"
  Status   = $loginStudent
  Expected = "302"
  Pass     = ($loginStudent -eq "302")
}

Test-Route "Dashboard (student)" "$base/dashboard" @("200") $cookieStudent
Test-Route "Upload (student)" "$base/upload" @("200") $cookieStudent
Test-Route "Library (student)" "$base/library" @("200") $cookieStudent
Test-Route "Admin (student)" "$base/admin" @("307") $cookieStudent

$noteId = $searchJson.data.community[0].id
if ($noteId) {
  Test-Route "Note detail" "$base/notes/$noteId" @("200")
  $notesResp = curl.exe -s "$base/api/notes/$noteId" | ConvertFrom-Json
  $filePath = $notesResp.data.fileUrl
  if ($filePath) {
    Test-Route "PDF preview (guest)" "$base/api/files/$filePath" @("401")
    Test-Route "PDF preview (auth)" "$base/api/files/$filePath" @("200") $cookieStudent
  }
}

$cookieAdmin = Join-Path (Get-Location) "smoke-admin.txt"
Remove-Item $cookieAdmin -ErrorAction SilentlyContinue
$csrfAdmin = (curl.exe -s -c $cookieAdmin -b $cookieAdmin "$base/api/auth/csrf" | ConvertFrom-Json).csrfToken
$loginAdmin = curl.exe -s -o NUL -w "%{http_code}" -c $cookieAdmin -b $cookieAdmin -X POST "$base/api/auth/callback/credentials" -H "Content-Type: application/x-www-form-urlencoded" -d "csrfToken=$csrfAdmin&email=admin@studysphere.dev&password=Admin123&redirect=false&json=true"
$results += [PSCustomObject]@{
  Test     = "Auth: admin login"
  Status   = $loginAdmin
  Expected = "302"
  Pass     = ($loginAdmin -eq "302")
}

Test-Route "Admin dashboard" "$base/admin" @("200") $cookieAdmin
Test-Route "Admin analytics API" "$base/api/admin/analytics" @("200") $cookieAdmin

Write-Host ""
$results | Format-Table -AutoSize
$passed = ($results | Where-Object { $_.Pass }).Count
$total = $results.Count
Write-Host ""
if ($passed -eq $total) {
  Write-Host "PASS: $passed/$total smoke tests passed" -ForegroundColor Green
  exit 0
}

Write-Host "FAIL: $passed/$total smoke tests passed" -ForegroundColor Red
exit 1

$body = '{"email":"admin@campus.edu","password":"password123"}'
try {
    $result = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method POST -ContentType 'application/json' -Body $body
    $result | ConvertTo-Json -Depth 5
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}

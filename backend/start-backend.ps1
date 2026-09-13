Get-Content ..\.env | ForEach-Object {
    $line = $_.Trim()
    if ($line -and !$line.StartsWith('#')) {
        $parts = $line.Split('=', 2)
        if ($parts.Length -eq 2) {
            $key = $parts[0].Trim()
            $val = $parts[1].Trim()
            [System.Environment]::SetEnvironmentVariable($key, $val, 'Process')
        }
    }
}
$env:SERVER_PORT = "8081"
.\mvnw spring-boot:run

$transcriptPath = "C:\Users\angel\.gemini\antigravity\brain\8cf56b23-4dbb-476f-b95f-bfa0a50e1c11\.system_generated\logs\transcript_full.jsonl"
$recoveredPath = "C:\Users\angel\Desktop\Aura\Site\07-26\Novo site\index_recovered.html"

$lines = Get-Content $transcriptPath -Encoding UTF8
foreach ($line in $lines) {
    if ($line -match '"TargetFile":\s*"[^"]*index\.html"') {
        try {
            $jsonObj = $line | ConvertFrom-Json
            if ($jsonObj.tool_calls) {
                foreach ($call in $jsonObj.tool_calls) {
                    if ($call.name -eq "default_api:write_to_file" -or $call.function.name -eq "default_api:write_to_file") {
                        $argsStr = if ($call.arguments) { $call.arguments } else { $call.function.arguments }
                        
                        # Sometimes arguments is already an object, sometimes it's a string
                        $args = $argsStr
                        if ($args -is [string]) {
                            $args = $argsStr | ConvertFrom-Json
                        }
                        
                        if ($args.TargetFile -match "index\.html") {
                            Set-Content -Path $recoveredPath -Value $args.CodeContent -Encoding UTF8
                            Write-Output "Recovered!"
                            exit
                        }
                    }
                }
            }
        } catch {
            Write-Output "Error parsing line"
        }
    }
}
Write-Output "Not found."

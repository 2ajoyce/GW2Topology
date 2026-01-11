set shell := ["powershell.exe", "-Command"]

build:
    $date = Get-Date -Format 'yyyy-MM-dd'; \
    $i = 1; \
    do { \
        $fileName = "gw2topology_${date}_${i}.zip"; \
        $exists = Test-Path $fileName; \
        $i++; \
    } while ($exists); \
    Compress-Archive -Path ./css,./img,./js,./index.html,./favicon.ico,./LICENSE,./README.md -DestinationPath $fileName

build-ci:
    #!/usr/bin/env bash
    DATE=$(date +%Y-%m-%d)
    I=1
    while [ -f "gw2topology_${DATE}_${I}.zip" ]; do
        I=$((I+1))
    done
    FILE_NAME="gw2topology_${DATE}_${I}.zip"
    zip -r "$FILE_NAME" css img js index.html favicon.ico LICENSE README.md

serve: 
    python -m http.server 8000
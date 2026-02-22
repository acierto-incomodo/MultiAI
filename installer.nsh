!macro customInit
  ; Forzar la instalación en AppData/Roaming/StormGamesStudios/Programs
  StrCpy $INSTDIR "$APPDATA\StormGamesStudios\Programs\MultiAI"
!macroend

!macro customInstall
  CreateShortCut "$DESKTOP\MultiAI - CardinalAI.lnk" "$INSTDIR\MultiAI.exe" "--cardinal"
  CreateShortCut "$DESKTOP\MultiAI - ChatGPT.lnk" "$INSTDIR\MultiAI.exe" "--chatgpt"
  CreateShortCut "$DESKTOP\MultiAI - Claude.lnk" "$INSTDIR\MultiAI.exe" "--claude"
  CreateShortCut "$DESKTOP\MultiAI - Copilot.lnk" "$INSTDIR\MultiAI.exe" "--copilot"
  CreateShortCut "$DESKTOP\MultiAI - Deepseek.lnk" "$INSTDIR\MultiAI.exe" "--deepseek"
  CreateShortCut "$DESKTOP\MultiAI - Gemini.lnk" "$INSTDIR\MultiAI.exe" "--gemini"
  CreateShortCut "$DESKTOP\MultiAI - Grok.lnk" "$INSTDIR\MultiAI.exe" "--grok"
  CreateShortCut "$DESKTOP\MultiAI - Mistral.lnk" "$INSTDIR\MultiAI.exe" "--mistral"
  CreateShortCut "$DESKTOP\MultiAI - NotebookLM.lnk" "$INSTDIR\MultiAI.exe" "--notebooklm"
  CreateShortCut "$DESKTOP\MultiAI - Perplexity.lnk" "$INSTDIR\MultiAI.exe" "--perplexity"

  ; Accesos directos en el Menú de Inicio (Carpeta MultiAI)
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - CardinalAI.lnk" "$INSTDIR\MultiAI.exe" "--cardinal"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - ChatGPT.lnk" "$INSTDIR\MultiAI.exe" "--chatgpt"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Claude.lnk" "$INSTDIR\MultiAI.exe" "--claude"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Copilot.lnk" "$INSTDIR\MultiAI.exe" "--copilot"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Deepseek.lnk" "$INSTDIR\MultiAI.exe" "--deepseek"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Gemini.lnk" "$INSTDIR\MultiAI.exe" "--gemini"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Grok.lnk" "$INSTDIR\MultiAI.exe" "--grok"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Mistral.lnk" "$INSTDIR\MultiAI.exe" "--mistral"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - NotebookLM.lnk" "$INSTDIR\MultiAI.exe" "--notebooklm"
  CreateShortCut "$SMPROGRAMS\MultiAI\MultiAI - Perplexity.lnk" "$INSTDIR\MultiAI.exe" "--perplexity"
!macroend

!macro customUnInstall
  Delete "$DESKTOP\MultiAI - CardinalAI.lnk"
  Delete "$DESKTOP\MultiAI - ChatGPT.lnk"
  Delete "$DESKTOP\MultiAI - Claude.lnk"
  Delete "$DESKTOP\MultiAI - Copilot.lnk"
  Delete "$DESKTOP\MultiAI - Deepseek.lnk"
  Delete "$DESKTOP\MultiAI - Gemini.lnk"
  Delete "$DESKTOP\MultiAI - Grok.lnk"
  Delete "$DESKTOP\MultiAI - Mistral.lnk"
  Delete "$DESKTOP\MultiAI - NotebookLM.lnk"
  Delete "$DESKTOP\MultiAI - Perplexity.lnk"

  ; Eliminar accesos directos del Menú de Inicio
  Delete "$SMPROGRAMS\MultiAI\MultiAI - CardinalAI.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - ChatGPT.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Claude.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Copilot.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Deepseek.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Gemini.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Grok.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Mistral.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - NotebookLM.lnk"
  Delete "$SMPROGRAMS\MultiAI\MultiAI - Perplexity.lnk"
!macroend
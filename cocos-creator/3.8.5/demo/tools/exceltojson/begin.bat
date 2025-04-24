@SET EXCEL_FOLDER=..\..\Table
@SET JSON_FOLDER=..\..\assets\Init\SystemTable\Table
@SET EXE=excel2json.exe
@ECHO Converting excel files in folder %EXCEL_FOLDER% ...

for /f "delims=" %%i in ('dir /b /a-d /s %EXCEL_FOLDER%\*.xlsx') do (
	@echo processing %%~nxi
	@CALL %EXE% -e %EXCEL_FOLDER%\%%~nxi -j %JSON_FOLDER%\%%~ni.json -h 3
)
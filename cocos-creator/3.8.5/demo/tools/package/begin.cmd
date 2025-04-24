@SET APPID=LW
@SET DATE=20250304
@SET MATERIAL=金门大桥
@SET M=
@SET VERSION=1
@SET TEST=试玩
@SET IDEA=李思琪
@SET PRODUCER=YYS
@SET PLATFORM=ALL



@SET INPUT_FOLDER=.\build
@SET OUTPUT_FOLDER=.\out
@SET EXE= .\7-Zip\7z.exe 

@setlocal enabledelayedexpansion

@for /f "delims=" %%i in ('dir /b %INPUT_FOLDER%') do (
	@echo =========processing %%~nxi===========
	@echo processing %%~nxi
	@SET M=%%~ni
	@SET N=!M!.html
	
	if exist %INPUT_FOLDER%/!N! (
		@ECHO ++++++++++++++++
		@copy %INPUT_FOLDER%\!N! %OUTPUT_FOLDER%\%APPID%_%DATE%_%MATERIAL%!M:~0,1!%VERSION%-%TEST%_%IDEA%_%PRODUCER%_!M!_%PLATFORM%.html
	) else (
		@ECHO ---------------
		@CALL %EXE% a %OUTPUT_FOLDER%/%APPID%_%DATE%_%MATERIAL%!M:~0,1!%VERSION%-%TEST%_%IDEA%_%PRODUCER%_!M!_%PLATFORM%.zip %INPUT_FOLDER%/!M!/* -r
	)
)

PAUSE
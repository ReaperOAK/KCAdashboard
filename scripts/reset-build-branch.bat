@echo off
echo Syncing build branch with remote origin...

:: Make sure we have the latest from remote
git fetch origin

:: Save current branch
for /f "tokens=*" %%a in ('git symbolic-ref --short HEAD') do set CURRENT_BRANCH=%%a
echo Current branch: %CURRENT_BRANCH%

:: Check if build branch exists locally
git show-ref --quiet refs/heads/build
if %errorlevel% equ 0 (
  echo Local build branch exists, recreating it...
  :: Switch to a different branch first (if we're currently on build)
  if "%CURRENT_BRANCH%"=="build" (
    git checkout main
  )
  :: Delete the local build branch
  git branch -D build
) else (
  echo No local build branch exists yet
)

:: Create a new build branch tracking the remote
echo Creating new build branch tracking remote origin/build...
git checkout -b build --track origin/build || git checkout -b build origin/build

echo Build branch is now in sync with remote

:: Switch back to original branch if it wasn't build
if not "%CURRENT_BRANCH%"=="build" if not "%CURRENT_BRANCH%"=="" (
  git checkout "%CURRENT_BRANCH%"
  echo Switched back to %CURRENT_BRANCH%
)

echo Done!

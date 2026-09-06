@echo off
chcp 65001>nul
title 一键发布 - 摄影作品集
cd /d "%~dp0"

set "GIT=C:\Program Files\Git\cmd\git.exe"

echo ============================================
echo   一键发布摄影作品集
echo ============================================
echo.
echo 1/3 正在登记的改动文件...
"%GIT%" add src/components/PhotoCoverFlow.tsx

echo 2/3 正在提交改动...
"%GIT%" commit -m "enlarge central card add cream backplate and top z-index" >nul 2>&1

echo 3/3 正在推送到网站（若弹出登录就按提示登录一次）...
"%GIT%" push origin master

echo.
echo ============================================
echo  完成！
echo.
echo  网站（Vercel）会自动重新构建约 1 分钟，
echo  之后刷新 https://portfolio-interactive-beta.vercel.app/
echo  即可看到：中央图片放大、米白衬板、
echo  中央置顶不被遮挡、按 01-14 展示。
echo ============================================
echo.
pause

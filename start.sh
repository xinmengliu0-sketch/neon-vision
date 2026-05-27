#!/bin/bash

echo "========================================"
echo "   刘新蒙项目实践 - 电脑性能检测"
echo "========================================"
echo ""
echo "正在启动本地服务器..."
echo "服务器地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 可以停止服务器"
echo "========================================"
echo ""

cd "$(dirname "$0")"
python3 -m http.server 8000

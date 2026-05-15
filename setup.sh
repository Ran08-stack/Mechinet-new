#!/bin/bash
# Mechinet — Setup & Dev Script
# מריץ אותו Claude בכל פעם שצריך לאתחל או להריץ את הפרויקט

BASE="/sessions/awesome-bold-gates/mnt/Mechinet"

echo "=== Mechinet Setup ==="

# בדיקה שה-node_modules קיים
if [ ! -d "$BASE/node_modules" ]; then
  echo "מתקין חבילות..."
  cd "$BASE" && npm install
else
  echo "node_modules קיים, מדלג על התקנה"
fi

# בדיקה שה-.env.local קיים
if [ ! -f "$BASE/.env.local" ]; then
  echo "שגיאה: .env.local לא קיים!"
  exit 1
fi

echo "מריץ dev server..."
cd "$BASE" && npm run dev

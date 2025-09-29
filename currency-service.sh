#!/bin/bash
while true; do
    echo "🔄 Checking if servers are running..."
    
    # Check if backend is running
    if ! curl -s http://localhost:5000/api/health > /dev/null; then
        echo "🔁 Restarting backend..."
        cd ~/currency-converter/backend
        node server.js &
        sleep 3
    fi
    
    # Check if frontend is running  
    if ! curl -s http://localhost:3001 > /dev/null; then
        echo "🔁 Restarting frontend..."
        cd ~/currency-converter/frontend
        node server.js &
        sleep 3
    fi
    
    echo "✅ Both servers running"
    echo "⏰ Next check in 60 seconds..."
    sleep 60
done

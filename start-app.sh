#!/bin/bash
echo "Starting Currency Converter App..."

# Start backend
cd backend
node server.js &
BACKEND_PID=$!

# Start frontend  
cd ../frontend
node server.js &
FRONTEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "App started! Access at http://localhost:3000"
echo "Press Ctrl+C to stop"

# Wait for interrupt
wait

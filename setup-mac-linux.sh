#!/bin/bash
echo "Setting up VedaAI..."

echo "Installing backend packages..."
cd backend && npm install --no-audit --no-fund && cd ..

echo "Installing frontend packages..."
cd frontend && npm install --no-audit --no-fund && cd ..

# Create .env if it doesn't exist
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo ""
    echo "IMPORTANT: Edit backend/.env and add your ANTHROPIC_API_KEY"
    echo "Get your key from: https://console.anthropic.com"
    echo ""
fi

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit backend/.env and add your ANTHROPIC_API_KEY"
echo "2. Run: docker compose up --build"
echo "3. Open: http://localhost:3000"

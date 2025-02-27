#!/bin/bash

# Smart Debt Flow Installation Script

echo "Installing dependencies for Smart Debt Flow..."

# Install NPM dependencies
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
  echo "Dependencies installed successfully!"
else
  echo "Failed to install dependencies. Please check the error messages above."
  exit 1
fi

# Create a .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file with default values..."
  cp .env.example .env 2>/dev/null || {
    # If .env.example doesn't exist, create a basic .env file
    cat > .env << EOF
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
EOF
  }
  echo "Created .env file. Please update it with your actual values."
fi

# Create SSL certificates for local development if they don't exist
if [ ! -d .cert ]; then
  echo "Creating SSL certificates for local development..."
  mkdir -p .cert
  
  # Generate SSL certificates using OpenSSL
  openssl req -x509 -newkey rsa:2048 -keyout .cert/key.pem -out .cert/cert.pem -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
  
  if [ $? -eq 0 ]; then
    echo "SSL certificates created successfully!"
  else
    echo "Failed to create SSL certificates. HTTPS will not be available in development mode."
  fi
fi

echo ""
echo "Setup complete!"
echo "To start the development server, run: npm run dev:all"
echo "This will start both the frontend (Vite) and backend (Express) servers."
echo ""
echo "Happy coding!" 
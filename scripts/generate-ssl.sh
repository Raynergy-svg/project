#!/bin/bash

# Create SSL certificate directory if it doesn't exist
mkdir -p certs

# Generate root CA key and certificate
openssl req -x509 \
  -newkey rsa:4096 \
  -keyout certs/ca-key.pem \
  -out certs/ca-cert.pem \
  -days 365 \
  -nodes \
  -subj "/C=US/ST=Local/L=Local/O=Development/CN=Local Development CA"

# Generate server key
openssl genrsa -out certs/key.pem 2048

# Generate certificate signing request
openssl req -new \
  -key certs/key.pem \
  -out certs/csr.pem \
  -subj "/C=US/ST=Local/L=Local/O=Development/CN=localhost"

# Generate server certificate
openssl x509 -req \
  -in certs/csr.pem \
  -CA certs/ca-cert.pem \
  -CAkey certs/ca-key.pem \
  -CAcreateserial \
  -out certs/cert.pem \
  -days 365

# Clean up CSR file
rm certs/csr.pem

echo "SSL certificates generated successfully!"
echo "To trust these certificates on macOS:"
echo "1. Open Keychain Access"
echo "2. File > Import Items"
echo "3. Select certs/ca-cert.pem"
echo "4. Double click the imported certificate"
echo "5. Expand 'Trust' and set 'When using this certificate' to 'Always Trust'" 
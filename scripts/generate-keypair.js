const fs = require('fs');

// Instructions
console.log('='.repeat(60));
console.log('Solana Keypair Generator');
console.log('Convert your wallet\'s Solana private key to keypair format');
console.log('='.repeat(60));

// Check if base64 key is provided as argument
const base64SecretKey = process.argv[2];

if (!base64SecretKey) {
  console.log('\n❌ Error: Please provide your Solana private key\n');
  console.log('Usage:');
  console.log('  node generate-keypair.js YOUR_BASE64_SECRET_KEY\n');
  console.log('Example:');
  console.log('  node generate-keypair.js lvaNRhIRQ8YUwc6vAiY0...\n');
  console.log('To get your Solana private key:');
  console.log('  1. Open wallet extension');
  console.log('  2. Go to Settings');
  console.log('  3. Click "Show Private Keys"');
  console.log('  4. Copy the "Solana Secret Key (Base64)"');
  process.exit(1);
}

try {
  // Convert base64 to Uint8Array
  const binaryString = atob(base64SecretKey);
  const secretKeyArray = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    secretKeyArray[i] = binaryString.charCodeAt(i);
  }

  // Convert to regular array for JSON
  const keypairArray = Array.from(secretKeyArray);

  // Save to file
  const filename = 'wallet-keypair.json';
  fs.writeFileSync(filename, JSON.stringify(keypairArray));

  console.log('\n✅ Success! Keypair generated\n');
  console.log('📄 File saved:', filename);
  console.log('📊 Array length:', keypairArray.length, 'bytes');
  console.log('\n📋 Keypair array:');
  console.log(JSON.stringify(keypairArray));
  console.log('\n🎯 Use this keypair file to:');
  console.log('  • Deploy Solana programs on Solana Playground');
  console.log('  • Use with Solana CLI commands');
  console.log('  • Import into other Solana tools\n');
} catch (error) {
  console.error('\n❌ Error:', error.message);
  console.log('\nMake sure you provided a valid base64-encoded secret key.\n');
  process.exit(1);
}

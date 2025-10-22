// Polyfill for browser API (Firefox compatibility)
const browser = typeof window !== 'undefined' && window.browser ? window.browser : chrome;
// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tabId = parseInt(urlParams.get('tabId'));
const origin = urlParams.get('origin');
const txData = urlParams.get('tx');

let transactionData = null;

// Parse transaction data
try {
  transactionData = JSON.parse(decodeURIComponent(txData));
} catch (error) {
  console.error('Failed to parse transaction data:', error);
}

// Display site URL
document.getElementById('siteUrl').textContent = origin || 'Unknown site';

// Format ETH value
function formatEth(wei) {
  if (!wei) return '0';
  // Convert wei to ETH (wei / 10^18)
  const ethValue = parseInt(wei, 16) / 1e18;
  return ethValue.toFixed(6);
}

// Format address (truncate middle)
function formatAddress(address) {
  if (!address) return 'N/A';
  if (address.length < 20) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format gas
function formatGas(gas) {
  if (!gas) return 'N/A';
  return parseInt(gas, 16).toLocaleString();
}

// Calculate total cost
function calculateTotal(value, gasPrice, gasLimit) {
  try {
    const valueWei = value ? parseInt(value, 16) : 0;
    const gasPriceWei = gasPrice ? parseInt(gasPrice, 16) : 0;
    const gasLimitNum = gasLimit ? parseInt(gasLimit, 16) : 0;
    
    const gasCost = gasPriceWei * gasLimitNum;
    const total = valueWei + gasCost;
    
    return (total / 1e18).toFixed(6);
  } catch (error) {
    console.error('Error calculating total:', error);
    return '0';
  }
}

// Display transaction details
if (transactionData) {
  // Handle EIP-1559 vs legacy transactions
  const gasPrice = transactionData.gasPrice || transactionData.maxFeePerGas || '0x0';
  const gasLimit = transactionData.gas || transactionData.gasLimit || '0x0';
  
  const detailsHtml = `
    <div class="detail-row">
      <span class="detail-label">From:</span>
      <span class="detail-value" title="${transactionData.from || 'N/A'}">${formatAddress(transactionData.from)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">To:</span>
      <span class="detail-value" title="${transactionData.to || 'Contract Creation'}">${transactionData.to ? formatAddress(transactionData.to) : 'Contract Creation'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Value:</span>
      <span class="detail-value">${formatEth(transactionData.value)} ETH</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Gas Limit:</span>
      <span class="detail-value">${formatGas(gasLimit)}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">Gas Price:</span>
      <span class="detail-value">${formatEth(gasPrice)} ETH</span>
    </div>
    ${transactionData.maxPriorityFeePerGas ? `
    <div class="detail-row">
      <span class="detail-label">Max Priority Fee:</span>
      <span class="detail-value">${formatEth(transactionData.maxPriorityFeePerGas)} ETH</span>
    </div>
    ` : ''}
    ${transactionData.data && transactionData.data !== '0x' ? `
    <div class="detail-row">
      <span class="detail-label">Data:</span>
      <span class="detail-value" title="${transactionData.data}">${transactionData.data.slice(0, 20)}...</span>
    </div>
    ` : ''}
  `;
  
  const detailsContainer = document.getElementById('transactionDetails');
  while (detailsContainer.firstChild) {
    detailsContainer.removeChild(detailsContainer.firstChild);
  }

  if (transactionData.to) {
    const toRow = document.createElement('div');
    toRow.className = 'detail-row';
    const label = document.createElement('span');
    label.className = 'detail-label';
    label.textContent = 'To:';
    const value = document.createElement('span');
    value.className = 'detail-value';
    value.title = transactionData.to;
    value.textContent = transactionData.to;
    toRow.appendChild(label);
    toRow.appendChild(value);
    detailsContainer.appendChild(toRow);
  }

  if (transactionData.value && transactionData.value !== '0x') {
    const valueRow = document.createElement('div');
    valueRow.className = 'detail-row';
    const label = document.createElement('span');
    label.className = 'detail-label';
    label.textContent = 'Value:';
    const value = document.createElement('span');
    value.className = 'detail-value';
    value.textContent = transactionData.value;
    valueRow.appendChild(label);
    valueRow.appendChild(value);
    detailsContainer.appendChild(valueRow);
  }

  if (transactionData.data && transactionData.data !== '0x') {
    const dataRow = document.createElement('div');
    dataRow.className = 'detail-row';
    const label = document.createElement('span');
    label.className = 'detail-label';
    label.textContent = 'Data:';
    const value = document.createElement('span');
    value.className = 'detail-value';
    value.title = transactionData.data;
    value.textContent = transactionData.data.slice(0, 20) + '...';
    dataRow.appendChild(label);
    dataRow.appendChild(value);
    detailsContainer.appendChild(dataRow);
  }
  
  // Show total cost
  const total = calculateTotal(
    transactionData.value,
    gasPrice,
    gasLimit
  );
  document.getElementById('totalCost').textContent = `${total} ETH`;
  document.getElementById('totalSection').style.display = 'block';
}

// Handle approve button
document.getElementById('approveBtn').addEventListener('click', async () => {
  console.log('✅ Transaction approved');
  
  const approveBtn = document.getElementById('approveBtn');
  const rejectBtn = document.getElementById('rejectBtn');
  
  // Disable buttons while processing
  approveBtn.disabled = true;
  rejectBtn.disabled = true;
  approveBtn.textContent = 'Sending...';
  
  try {
    // Send approval to background script which will handle the actual signing
  browser.runtime.sendMessage({
      type: 'APPROVE_TRANSACTION',
      tabId,
      transaction: transactionData,
    });
    
    // Don't wait for response - background will handle async signing
    // Just show processing state and close after a moment
    console.log('✅ Approval message sent to background');
    
    // Close window after brief delay
    setTimeout(() => {
      window.close();
    }, 500);
    
  } catch (error) {
    console.error('Error approving transaction:', error);
    alert('Failed to approve transaction: ' + error.message);
    approveBtn.disabled = false;
    rejectBtn.disabled = false;
    approveBtn.textContent = 'Approve';
  }
});

// Handle reject button
document.getElementById('rejectBtn').addEventListener('click', () => {
  console.log('❌ Transaction rejected');
  browser.runtime.sendMessage({
    type: 'REJECT_TRANSACTION',
    tabId,
  }, () => {
    window.close();
  });
});

// Handle Escape key to reject
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('rejectBtn').click();
  }
});

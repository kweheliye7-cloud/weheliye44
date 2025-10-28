// =========================================================
// SIMULATION STATE
// This is where all the 'backend' data is stored in the browser
// =========================================================
let currentBalance = 5000.00;
let transactionHistory = [
    { date: '2025-10-27', type: 'Deposit', description: 'Initial Setup', amount: 5000.00 },
    { date: '2025-10-28', type: 'Payment', description: 'Online Subscription', amount: -19.99 }
];

// Helper to format currency
const formatCurrency = (amount) => {
    return '$' + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Helper to update the displayed balance and history
const updateDashboardUI = () => {
    document.getElementById('current-balance').textContent = formatCurrency(currentBalance);
    renderHistoryTable();
};

// Helper to update the transaction history table
const renderHistoryTable = () => {
    const tableBody = document.querySelector('#transaction-table tbody');
    tableBody.innerHTML = ''; // Clear existing rows

    // Sort by date descending
    const sortedHistory = [...transactionHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedHistory.forEach(t => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = t.date;
        row.insertCell().textContent = t.type;
        row.insertCell().textContent = t.description;

        const amountCell = row.insertCell();
        const formattedAmount = formatCurrency(Math.abs(t.amount));
        
        // Apply color based on transaction type (Green for positive, Red for negative)
        if (t.amount > 0) {
            amountCell.innerHTML = `<span style="color: #28a745;">+${formattedAmount}</span>`;
        } else {
            amountCell.innerHTML = `<span style="color: #dc3545;">-${formattedAmount}</span>`;
        }
    });
};


// =========================================================
// 1. LOGIN LOGIC
// =========================================================
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('login-message');

    // **REQUIRED CREDENTIALS**
    if (username === 'weheliye' && password === '2018') {
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        updateDashboardUI(); // Load initial data
    } else {
        messageElement.textContent = 'Invalid username or password.';
        setTimeout(() => messageElement.textContent = '', 3000); // Clear after 3 seconds
    }
});

document.getElementById('logout-btn').addEventListener('click', function() {
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
    // Clear form fields for security
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
});


// =========================================================
// 2. INTERFACE SWITCHING
// =========================================================
const navLinks = document.querySelectorAll('#sidebar nav a, .quick-action');

const switchView = (viewId) => {
    // Hide all views
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.add('hidden');
    });
    // Show the selected view
    document.getElementById(`${viewId}-view`).classList.remove('hidden');

    // Update active state in sidebar (only for nav links)
    document.querySelectorAll('#sidebar nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-view') === viewId) {
            link.classList.add('active');
        }
    });

    // Re-render history if we switch to the history view
    if (viewId === 'history') {
        renderHistoryTable();
    }
    // Update balance if we switch to home
    if (viewId === 'home') {
        updateDashboardUI();
    }
};

navLinks.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const viewId = this.getAttribute('data-view');
        if (viewId) {
            switchView(viewId);
        }
    });
});


// =========================================================
// 3. DEPOSIT LOGIC (The 'Stick' Money Interface)
// =========================================================
const depositAmountInput = document.getElementById('deposit-amount');
const depositPreviewArea = document.getElementById('deposit-preview-area');
const depositPreviewAmount = document.getElementById('deposit-preview-amount');

document.getElementById('deposit-preview-btn').addEventListener('click', function() {
    const amount = parseFloat(depositAmountInput.value);
    if (amount > 0) {
        // Show the preview area (money 'sticks' here)
        depositPreviewAmount.textContent = formatCurrency(amount);
        depositPreviewArea.classList.remove('hidden');
        depositAmountInput.disabled = true; // Lock the input
        this.classList.add('hidden');
    } else {
        alert('Please enter a valid deposit amount.');
    }
});

document.getElementById('deposit-confirm-btn').addEventListener('click', function() {
    const amount = parseFloat(depositAmountInput.value);
    currentBalance += amount;
    
    // Add transaction to history
    transactionHistory.push({
        date: new Date().toISOString().split('T')[0],
        type: 'Deposit',
        description: 'Confirmed Deposit',
        amount: amount
    });

    // Reset interface
    depositAmountInput.value = '';
    depositAmountInput.disabled = false;
    depositPreviewArea.classList.add('hidden');
    document.getElementById('deposit-preview-btn').classList.remove('hidden');
    
    alert(`Deposit of ${formatCurrency(amount)} successful! New balance: ${formatCurrency(currentBalance)}`);
    switchView('home');
});

document.getElementById('deposit-cancel-btn').addEventListener('click', function() {
    // Reset interface (money goes away)
    depositAmountInput.value = '';
    depositAmountInput.disabled = false;
    depositPreviewArea.classList.add('hidden');
    document.getElementById('deposit-preview-btn').classList.remove('hidden');
    alert('Deposit cancelled.');
});


// =========================================================
// 4. WITHDRAWAL LOGIC (The 'Held' Money Interface)
// =========================================================
const withdrawalAmountInput = document.getElementById('withdrawal-amount');
const withdrawalPreviewArea = document.getElementById('withdrawal-preview-area');
const withdrawalPreviewAmount = document.getElementById('withdrawal-preview-amount');

document.getElementById('withdrawal-preview-btn').addEventListener('click', function() {
    const amount = parseFloat(withdrawalAmountInput.value);
    if (amount > 0 && amount <= currentBalance) {
        // Show the preview area (money 'held' here)
        withdrawalPreviewAmount.textContent = formatCurrency(amount);
        withdrawalPreviewArea.classList.remove('hidden');
        withdrawalAmountInput.disabled = true; // Lock the input
        this.classList.add('hidden');
    } else if (amount > currentBalance) {
        alert('Insufficient funds for this withdrawal.');
    } else {
        alert('Please enter a valid withdrawal amount.');
    }
});

document.getElementById('withdrawal-confirm-btn').addEventListener('click', function() {
    const amount = parseFloat(withdrawalAmountInput.value);
    currentBalance -= amount;
    
    // Add transaction to history
    transactionHistory.push({
        date: new Date().toISOString().split('T')[0],
        type: 'Withdrawal',
        description: 'Cash Withdrawal',
        amount: -amount
    });

    // Reset interface
    withdrawalAmountInput.value = '';
    withdrawalAmountInput.disabled = false;
    withdrawalPreviewArea.classList.add('hidden');
    document.getElementById('withdrawal-preview-btn').classList.remove('hidden');
    
    alert(`Withdrawal of ${formatCurrency(amount)} successful! New balance: ${formatCurrency(currentBalance)}`);
    switchView('home');
});

document.getElementById('withdrawal-cancel-btn').addEventListener('click', function() {
    // Reset interface (money is released/not withdrawn)
    withdrawalAmountInput.value = '';
    withdrawalAmountInput.disabled = false;
    withdrawalPreviewArea.classList.add('hidden');
    document.getElementById('withdrawal-preview-btn').classList.remove('hidden');
    alert('Withdrawal cancelled.');
});


// =========================================================
// 5. TRANSFER FUNDS LOGIC
// =========================================================
document.getElementById('transfer-btn').addEventListener('click', function() {
    const recipient = document.getElementById('recipient-account').value;
    const amount = parseFloat(document.getElementById('transfer-amount').value);
    const note = document.getElementById('transfer-note').value;
    const messageElement = document.getElementById('transfer-message');

    if (amount > 0 && amount <= currentBalance && recipient) {
        currentBalance -= amount;
        
        // Add transaction to history
        transactionHistory.push({
            date: new Date().toISOString().split('T')[0],
            type: 'Transfer',
            description: `Transfer to ${recipient} (${note || 'No Note'})`,
            amount: -amount
        });

        messageElement.textContent = `Transfer of ${formatCurrency(amount)} to ${recipient} successful!`;
        messageElement.style.color = '#28a745';
        
        // Clear inputs
        document.getElementById('recipient-account').value = '';
        document.getElementById('transfer-amount').value = '';
        document.getElementById('transfer-note').value = '';
        
        // In a real app, this would use an API call.
        setTimeout(() => {
            switchView('home');
            messageElement.textContent = '';
        }, 3000);

    } else if (amount > currentBalance) {
        messageElement.textContent = 'Transfer failed: Insufficient funds.';
        messageElement.style.color = '#dc3545';
    } else {
        messageElement.textContent = 'Transfer failed: Please check all fields.';
        messageElement.style.color = '#dc3545';
    }
});


// =========================================================
// 6. PAY BILLS LOGIC
// =========================================================
document.getElementById('paybill-btn').addEventListener('click', function() {
    const service = document.getElementById('bill-service').value;
    const amount = parseFloat(document.getElementById('bill-amount').value);
    const accountNumber = document.getElementById('account-number').value;
    const messageElement = document.getElementById('paybill-message');

    if (amount > 0 && amount <= currentBalance && service && accountNumber) {
        currentBalance -= amount;
        
        // Add transaction to history
        transactionHistory.push({
            date: new Date().toISOString().split('T')[0],
            type: 'Payment',
            description: `Payment for ${service} (Acc: ${accountNumber})`,
            amount: -amount
        });

        messageElement.textContent = `${service} payment of ${formatCurrency(amount)} successful!`;
        messageElement.style.color = '#28a745';
        
        // Clear inputs
        document.getElementById('bill-service').value = '';
        document.getElementById('account-number').value = '';
        document.getElementById('bill-amount').value = '';

        setTimeout(() => {
            switchView('home');
            messageElement.textContent = '';
        }, 3000);
        
    } else if (amount > currentBalance) {
        messageElement.textContent = 'Payment failed: Insufficient funds.';
        messageElement.style.color = '#dc3545';
    } else {
        messageElement.textContent = 'Payment failed: Please check all fields.';
        messageElement.style.color = '#dc3545';
    }
});


// =========================================================
// 7. ORDER MANAGEMENT LOGIC
// =========================================================
let nextOrderId = 3; // Start from 3 since we have 1 and 2 in HTML

document.getElementById('place-order-btn').addEventListener('click', function() {
    const item = document.getElementById('new-order-item').value;
    const quantity = parseInt(document.getElementById('new-order-quantity').value);
    const messageElement = document.getElementById('order-message');
    const orderList = document.getElementById('active-orders-list');

    if (item && quantity > 0) {
        const orderId = `ORD00${nextOrderId++}`;
        
        // Simulate a cost and deduction (e.g., $10 per item)
        const orderCost = quantity * 10; 
        
        if (currentBalance >= orderCost) {
            currentBalance -= orderCost;
            
            // Add to the displayed list
            const listItem = document.createElement('li');
            listItem.className = 'order-item';
            listItem.innerHTML = `#${orderId} - Status: **Pending** (Item: ${item}, Qty: ${quantity}) - Cost: ${formatCurrency(orderCost)}`;
            orderList.appendChild(listItem);
            
            // Add transaction to history
            transactionHistory.push({
                date: new Date().toISOString().split('T')[0],
                type: 'Order',
                description: `New Order #${orderId} - ${item} x ${quantity}`,
                amount: -orderCost
            });

            messageElement.textContent = `Order #${orderId} placed successfully! Cost of ${formatCurrency(orderCost)} deducted.`;
            messageElement.style.color = '#28a745';

            // Clear inputs
            document.getElementById('new-order-item').value = '';
            document.getElementById('new-order-quantity').value = '';
        } else {
            messageElement.textContent = 'Order failed: Insufficient funds to cover the estimated order cost ($10 per item simulated).';
            messageElement.style.color = '#dc3545';
        }
    } else {
        messageElement.textContent = 'Please enter a valid item and quantity.';
        messageElement.style.color = '#dc3545';
    }
});


// =========================================================
// INITIAL SETUP
// =========================================================
window.onload = () => {
    // Ensure the dashboard is updated if somehow loaded directly
    updateDashboardUI(); 
};
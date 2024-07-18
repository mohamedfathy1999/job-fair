document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = 'https://my-json-server.typicode.com/mohamedfathy/demojobfair';
    const searchNameInput = document.getElementById('search-name');
    const searchAmountInput = document.getElementById('search-amount');
    const customersTableBody = document.querySelector('#customers-table tbody');
    const transactionsChartElement = document.getElementById('transactions-chart').getContext('2d');
    let customers = [];
    let transactions = [];
    let transactionChart;
    async function fetchData() {
            const customersResponse = await fetch(`${apiUrl}/customers`);
            const transactionsResponse = await fetch(`${apiUrl}/transactions`);
            customers = await customersResponse.json();
            transactions = await transactionsResponse.json();
            displayTransactions(transactions);
            setupSearch();
    }
    function displayTransactions(transactions) {
        customersTableBody.innerHTML = '';
        transactions.forEach(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.name}</td>
                <td>${transaction.date}</td>
                <td>${transaction.amount}</td>
            `;
            row.addEventListener('click', () => {
                const customerTransactions = transactions.filter(t => t.customer_id === customer.id);
                updateChart(customerTransactions);
            });
            customersTableBody.appendChild(row);
        });
        updateChart(transactions);
    }
    function setupSearch() {
        searchNameInput.addEventListener('input', filterTransactions);
        searchAmountInput.addEventListener('input', filterTransactions);
    }
    function filterTransactions() {
        const searchNameTerm = searchNameInput.value.toLowerCase();
        const searchAmountTerm = searchAmountInput.value.toLowerCase();
        const filteredTransactions = transactions.filter(transaction => {
            const customer = customers.find(c => c.id === transaction.customer_id);
            const nameMatch = customer.name.toLowerCase().includes(searchNameTerm);
            const amountMatch = transaction.amount.toString().includes(searchAmountTerm);
            return nameMatch && amountMatch;
        });
        displayTransactions(filteredTransactions);
    }
    function updateChart(transactions) {
        const transactionData = transactions.reduce((acc, transaction) => {
            const date = transaction.date;
            acc[date] = (acc[date] || 0) + transaction.amount;
            return acc;
        }, {});
        const labels = Object.keys(transactionData);
        const data = Object.values(transactionData);
        if (transactionChart) {
            transactionChart.destroy();
        }
        transactionChart = new Chart(transactionsChartElement, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Total daily transactions',
                    data: data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                scales: {
                    x: { title: { display: true, text: 'the date' } },
                    y: { title: { display: true, text: 'the amount' } }
                }
            }
        });
    }
    fetchData();
});

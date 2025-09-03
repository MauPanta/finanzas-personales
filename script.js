// Modelo de Finanzas - JavaScript
class FinanceManager {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.recurringPayments = JSON.parse(localStorage.getItem('recurringPayments')) || [];
        this.savingsGoal = parseFloat(localStorage.getItem('savingsGoal')) || 0;
        this.editingTransactionId = null; // Para controlar modo edición
        this.charts = {
            expenses: null,
            expenseDescriptions: null,
            income: null,
            comparison: null,
            methods: null,
            monthly: null
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setCurrentDate();
        this.setupChartTabs();
        
        // Usar requestAnimationFrame para inicialización asíncrona
        requestAnimationFrame(() => {
            this.loadSavingsGoal();
            this.updateSummary();
            this.updateTransactionsTable();
            this.displayRecurringPayments();
            this.checkPaymentAlerts();
            // this.setupCategorySuggestion(); // Temporalmente comentado para evitar errores
            
            // Cargar gráficos de forma diferida
            setTimeout(() => {
                this.updateAllCharts();
                this.updateMonthlyAnalysis();
            }, 100);
        });
        
        // Verificar alertas cada hora (optimizado)
        setInterval(() => {
            this.checkPaymentAlerts();
        }, 3600000); // 1 hora
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('income-date').value = today;
        document.getElementById('expense-date').value = today;
    }

    setupEventListeners() {
        // Formulario de ingresos
        document.getElementById('income-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addIncome();
        });

        // Formulario de egresos
        document.getElementById('expense-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Formulario de pagos recurrentes
        document.getElementById('recurring-payment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecurringPayment();
        });

        // Filtros de tabla
        document.getElementById('filter-category').addEventListener('change', () => {
            this.filterTransactions();
        });

        document.getElementById('filter-month').addEventListener('change', () => {
            this.filterTransactions();
        });

        // Tabs de tabla
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Exportar datos
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        // Importar datos
        document.getElementById('import-data').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });

        document.getElementById('import-file').addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Meta de ahorro
        document.getElementById('savings-goal').addEventListener('input', (e) => {
            this.setSavingsGoal(parseFloat(e.target.value) || 0);
        });

        // Pestañas de gráficos
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchChart(e.target.dataset.chart);
            });
        });
    }

    // Mostrar/ocultar configuración quincenal
    setupRecurringFrequency() {
        document.getElementById('recurring-frequency').addEventListener('change', (e) => {
            const biweeklyConfig = document.getElementById('biweekly-config');
            if (e.target.value === 'quincenal') {
                biweeklyConfig.style.display = 'block';
            } else {
                biweeklyConfig.style.display = 'none';
            }
        });
    }

    setupChartTabs() {
        // Configurar pestañas de gráficos inicialmente - SIN cargar charts aún
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="expenses"]`).classList.add('active');
        
        document.querySelectorAll('.chart-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`chart-expenses`).classList.add('active');
        
        // NO llamar a updateSpecificChart aquí para evitar problemas de inicialización
    }

    switchChart(chartType) {
        // Actualizar botones de pestañas
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-chart="${chartType}"]`).classList.add('active');

        // Mostrar contenido del gráfico correspondiente
        document.querySelectorAll('.chart-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`chart-${chartType}`).classList.add('active');

        // Actualizar el gráfico específico
        this.updateSpecificChart(chartType);
    }

    addIncome() {
        const description = document.getElementById('income-description').value;
        const amount = parseFloat(document.getElementById('income-amount').value);
        const category = document.getElementById('income-category').value;
        const date = document.getElementById('income-date').value;
        const method = document.getElementById('income-method').value;

        if (!description || !amount || !category || !date || !method) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (this.editingTransactionId) {
            // Modo edición - actualizar transacción existente
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    description,
                    amount,
                    category,
                    date,
                    method,
                    timestamp: new Date()
                };
                
                // Actualizar todo ANTES de cancelar la edición
                this.saveToLocalStorage();
                this.updateSummary();
                this.updateTransactionsTable();
                
                alert('✅ Operación actualizada exitosamente');
                this.cancelEdit();
                
                // Actualizar gráficos de forma diferida
                setTimeout(() => {
                    this.updateSpecificChart('income');
                    this.updateSpecificChart('comparison');
                    this.updateMonthlyAnalysis();
                }, 50);
                return; // Salir aquí para evitar ejecutar el resto
            }
        } else {
            // Modo agregar - nueva transacción
            const transaction = {
                id: Date.now().toString(),
                type: 'income',
                description,
                amount,
                category,
                date,
                method,
                timestamp: new Date()
            };

            this.transactions.push(transaction);
            this.clearForm('income-form');
            alert('✅ Operación grabada - Ingreso agregado exitosamente');
        }

        this.saveToLocalStorage();
        this.updateSummaryOptimized();
        this.updateTransactionsTable();
        
        // Actualizar gráficos de forma diferida
        setTimeout(() => {
            this.updateSpecificChart('income');
            this.updateSpecificChart('comparison');
            this.updateMonthlyAnalysis();
        }, 50);
    }

    addExpense() {
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
        const method = document.getElementById('expense-method').value;

        if (!description || !amount || !category || !date || !method) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (this.editingTransactionId) {
            // Modo edición - actualizar transacción existente
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    description,
                    amount,
                    category,
                    date,
                    method,
                    timestamp: new Date()
                };
                
                // Actualizar todo ANTES de cancelar la edición
                this.saveToLocalStorage();
                this.updateSummary();
                this.updateTransactionsTable();
                
                alert('✅ Operación actualizada exitosamente');
                this.cancelEdit();
                
                // Actualizar gráficos de forma diferida
                setTimeout(() => {
                    this.updateSpecificChart('expenses');
                    this.updateSpecificChart('expense-descriptions');
                    this.updateSpecificChart('comparison');
                    this.updateMonthlyAnalysis();
                }, 50);
                return; // Salir aquí para evitar ejecutar el resto
            }
        } else {
            // Modo agregar - nueva transacción
            const transaction = {
                id: Date.now().toString(),
                type: 'expense',
                description,
                amount,
                category,
                date,
                method,
                timestamp: new Date()
            };

            this.transactions.push(transaction);
            this.clearForm('expense-form');
            alert('✅ Operación grabada - Egreso agregado exitosamente');
        }

        this.saveToLocalStorage();
        this.updateSummaryOptimized();
        this.updateTransactionsTable();
        
        // Actualizar gráficos de forma diferida
        setTimeout(() => {
            this.updateSpecificChart('expenses');
            this.updateSpecificChart('expense-descriptions');
            this.updateSpecificChart('comparison');
            this.updateMonthlyAnalysis();
        }, 50);
    }

    addRecurringPayment() {
        const description = document.getElementById('recurring-description').value;
        const amount = parseFloat(document.getElementById('recurring-amount').value);
        const frequency = document.getElementById('recurring-frequency').value;

        const payment = {
            id: Date.now().toString(),
            description,
            amount,
            frequency,
            nextDue: this.calculateNextDue(frequency)
        };

        this.recurringPayments.push(payment);
        this.saveToLocalStorage();
        this.displayRecurringPayments();
        this.clearForm('recurring-payment-form');
        this.showNotification('Pago recurrente agregado exitosamente', 'success');
    }

    calculateNextDue(frequency) {
        const now = new Date();
        switch(frequency) {
            case 'semanal':
                now.setDate(now.getDate() + 7);
                break;
            case 'quincenal':
                now.setDate(now.getDate() + 15);
                break;
            case 'mensual':
                now.setMonth(now.getMonth() + 1);
                break;
            case 'anual':
                now.setFullYear(now.getFullYear() + 1);
                break;
        }
        return now.toISOString().split('T')[0];
    }

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToLocalStorage();
        
        // Actualización optimizada después de eliminar
        this.updateSummary();
        this.updateTransactionsTable();
        this.showNotification('Transacción eliminada', 'success');
        
        // Actualizar gráficos de forma diferida
        setTimeout(() => {
            this.updateAllCharts();
            this.updateMonthlyAnalysis();
        }, 100);
    }

    deleteRecurringPayment(id) {
        this.recurringPayments = this.recurringPayments.filter(p => p.id !== id);
        this.saveToLocalStorage();
        this.displayRecurringPayments();
        this.showNotification('Pago recurrente eliminado', 'success');
    }

    updateSummary() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        document.getElementById('total-income').textContent = this.formatCurrency(income);
        document.getElementById('total-expenses').textContent = this.formatCurrency(expenses);
        document.getElementById('balance').textContent = this.formatCurrency(balance);

        // Cambiar color del balance según el valor
        const balanceElement = document.getElementById('balance');
        if (balance >= 0) {
            balanceElement.style.color = '#4CAF50';
        } else {
            balanceElement.style.color = '#f44336';
        }
    }

    // Método optimizado para actualizar solo el resumen sin recalcular todo
    updateSummaryOptimized(newTransaction) {
        let currentIncome = parseFloat(document.getElementById('total-income').textContent.replace(/[^\d.-]/g, '')) || 0;
        let currentExpenses = parseFloat(document.getElementById('total-expenses').textContent.replace(/[^\d.-]/g, '')) || 0;
        
        if (newTransaction.type === 'income') {
            currentIncome += newTransaction.amount;
        } else {
            currentExpenses += newTransaction.amount;
        }
        
        const balance = currentIncome - currentExpenses;

        document.getElementById('total-income').textContent = this.formatCurrency(currentIncome);
        document.getElementById('total-expenses').textContent = this.formatCurrency(currentExpenses);
        document.getElementById('balance').textContent = this.formatCurrency(balance);

        // Cambiar color del balance según el valor
        const balanceElement = document.getElementById('balance');
        if (balance >= 0) {
            balanceElement.style.color = '#4CAF50';
        } else {
            balanceElement.style.color = '#f44336';
        }
    }

    updateTransactionsTable(filter = 'all') {
        // Usar DocumentFragment para mejorar rendimiento
        const tbody = document.querySelector('#transactions-table tbody');
        const fragment = document.createDocumentFragment();
        
        // Limpiar tabla de forma eficiente
        tbody.innerHTML = '';

        let filteredTransactions = this.transactions;

        // Aplicar filtro de tipo
        if (filter === 'income') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'income');
        } else if (filter === 'expenses') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
        }

        // Aplicar filtros adicionales
        const categoryFilter = document.getElementById('filter-category').value;
        const monthFilter = document.getElementById('filter-month').value;

        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }

        if (monthFilter) {
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionMonth = t.date.substring(0, 7);
                return transactionMonth === monthFilter;
            });
        }

        // Ordenar por fecha (más reciente primero)
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Limitar inicialmente a 50 transacciones para mejor rendimiento
        const displayLimit = 50;
        const transactionsToShow = filteredTransactions.slice(0, displayLimit);

        transactionsToShow.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td><span class="category-tag category-${transaction.category}">${this.formatCategory(transaction.category)}</span></td>
                <td><span class="type-badge type-${transaction.type}">${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span></td>
                <td><span class="method-badge method-${transaction.method || 'efectivo'}">${this.formatMethod(transaction.method)}</span></td>
                <td class="${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <button class="action-btn btn-edit" onclick="editTransaction('${transaction.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteTransaction('${transaction.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(row);
        });

        // Añadir todas las filas de una vez
        tbody.appendChild(fragment);

        // Mostrar mensaje si hay más transacciones
        if (filteredTransactions.length > displayLimit) {
            const infoRow = document.createElement('tr');
            infoRow.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 20px; background: #f8f9fa;">
                    Mostrando ${displayLimit} de ${filteredTransactions.length} transacciones
                    <button class="btn btn-secondary" onclick="financeManager.showAllTransactions('${filter}')" style="margin-left: 10px;">
                        Ver todas
                    </button>
                </td>
            `;
            tbody.appendChild(infoRow);
        }

        // Actualizar filtro de categorías de forma diferida
        setTimeout(() => this.updateCategoryFilter(), 10);
    }

    // Método para mostrar todas las transacciones cuando sea necesario
    showAllTransactions(filter = 'all') {
        const tbody = document.querySelector('#transactions-table tbody');
        const fragment = document.createDocumentFragment();
        tbody.innerHTML = '';

        let filteredTransactions = this.transactions;

        // Aplicar filtros
        if (filter === 'income') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'income');
        } else if (filter === 'expenses') {
            filteredTransactions = filteredTransactions.filter(t => t.type === 'expense');
        }

        const categoryFilter = document.getElementById('filter-category').value;
        const monthFilter = document.getElementById('filter-month').value;

        if (categoryFilter) {
            filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
        }

        if (monthFilter) {
            filteredTransactions = filteredTransactions.filter(t => {
                const transactionMonth = t.date.substring(0, 7);
                return transactionMonth === monthFilter;
            });
        }

        // Ordenar por fecha
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Mostrar todas las transacciones
        filteredTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td><span class="category-tag category-${transaction.category}">${this.formatCategory(transaction.category)}</span></td>
                <td><span class="type-badge type-${transaction.type}">${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span></td>
                <td><span class="method-badge method-${transaction.method || 'efectivo'}">${this.formatMethod(transaction.method)}</span></td>
                <td class="${transaction.type === 'income' ? 'transaction-income' : 'transaction-expense'}">
                    ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                </td>
                <td>
                    <button class="action-btn btn-edit" onclick="editTransaction('${transaction.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteTransaction('${transaction.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            fragment.appendChild(row);
        });

        tbody.appendChild(fragment);
    }

    updateCategoryFilter() {
        const categoryFilter = document.getElementById('filter-category');
        const categories = [...new Set(this.transactions.map(t => t.category))];
        
        // Limpiar opciones existentes excepto la primera
        while (categoryFilter.children.length > 1) {
            categoryFilter.removeChild(categoryFilter.lastChild);
        }

        categories.forEach(category => {
            if (category) {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = this.formatCategory(category);
                categoryFilter.appendChild(option);
            }
        });
    }

    updateAllCharts() {
        // Usar debouncing para evitar múltiples actualizaciones
        clearTimeout(this.chartUpdateTimeout);
        this.chartUpdateTimeout = setTimeout(() => {
            this.updateExpensesChart();
            this.updateExpenseDescriptionsChart();
            this.updateIncomeChart();
            this.updateComparisonChart();
            this.updateMethodsChart();
            this.updateMonthlyChart();
        }, 100);
    }

    updateSpecificChart(chartType) {
        switch(chartType) {
            case 'expenses':
                this.updateExpensesChart();
                break;
            case 'expense-descriptions':
                this.updateExpenseDescriptionsChart();
                break;
            case 'income':
                this.updateIncomeChart();
                break;
            case 'comparison':
                this.updateComparisonChart();
                break;
            case 'methods':
                this.updateMethodsChart();
                break;
            case 'monthly':
                this.updateMonthlyChart();
                break;
        }
    }

    updateExpensesChart() {
        const canvasElement = document.getElementById('expenseChart');
        if (!canvasElement) {
            console.log('Canvas expenseChart no encontrado');
            return;
        }
        
        // Destruir cualquier chart existente de manera más agresiva
        if (this.charts.expenses) {
            try {
                this.charts.expenses.destroy();
            } catch (e) {
                console.log('Error al destruir chart expenses:', e);
            }
            this.charts.expenses = null;
        }
        
        // Limpiar el canvas manualmente
        const context = canvasElement.getContext('2d');
        context.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        const expensesByCategory = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        const labels = Object.keys(expensesByCategory).map(cat => this.formatCategory(cat));
        const data = Object.values(expensesByCategory);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56'];

        try {
            this.charts.expenses = new Chart(context, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateIncomeChart() {
        const ctx = document.getElementById('incomeChart').getContext('2d');
        
        if (this.charts.income) {
            this.charts.income.destroy();
        }

        const incomeByCategory = {};
        this.transactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            });

        const labels = Object.keys(incomeByCategory).map(cat => this.formatCategory(cat));
        const data = Object.values(incomeByCategory);
        const colors = ['#4CAF50', '#8BC34A', '#CDDC39', '#FFC107', '#FF9800'];

        this.charts.income = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
            }
        });
    }

    updateComparisonChart() {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        if (this.charts.comparison) {
            this.charts.comparison.destroy();
        }

        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        this.charts.comparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ingresos', 'Egresos'],
                datasets: [{
                    label: 'Monto',
                    data: [totalIncome, totalExpenses],
                    backgroundColor: ['#4CAF50', '#f44336'],
                    borderColor: ['#4CAF50', '#f44336'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.label}: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    updateMethodsChart() {
        const ctx = document.getElementById('methodsChart').getContext('2d');
        
        if (this.charts.methods) {
            this.charts.methods.destroy();
        }

        const byMethod = {};
        this.transactions.forEach(t => {
            const method = t.method || 'efectivo';
            byMethod[method] = (byMethod[method] || 0) + t.amount;
        });

        const labels = Object.keys(byMethod).map(method => this.formatMethod(method));
        const data = Object.values(byMethod);
        const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

        this.charts.methods = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { padding: 20, usePointStyle: true }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = this.formatCurrency(context.parsed);
                                return `${label}: ${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    updateMonthlyChart() {
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        if (this.charts.monthly) {
            this.charts.monthly.destroy();
        }

        // Obtener últimos 6 meses
        const months = [];
        const monthlyData = {};
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthKey = date.toISOString().substring(0, 7);
            const monthLabel = date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
            months.push(monthLabel);
            monthlyData[monthKey] = 0;
        }

        // Calcular gastos por mes
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const monthKey = t.date.substring(0, 7);
                if (monthlyData.hasOwnProperty(monthKey)) {
                    monthlyData[monthKey] += t.amount;
                }
            });

        const data = Object.values(monthlyData);

        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Gastos Mensuales',
                    data: data,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Gastos: ${this.formatCurrency(context.parsed.y)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    updateMonthlyAnalysis() {
        const currentMonth = new Date().toISOString().substring(0, 7);
        
        const monthlyTransactions = this.transactions.filter(t => 
            t.date.substring(0, 7) === currentMonth
        );

        const monthIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthBalance = monthIncome - monthExpenses;

        document.getElementById('month-income').textContent = this.formatCurrency(monthIncome);
        document.getElementById('month-expenses').textContent = this.formatCurrency(monthExpenses);
        document.getElementById('month-balance').textContent = this.formatCurrency(monthBalance);

        // Categoría más gastada
        const expensesByCategory = {};
        monthlyTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        const topCategory = Object.keys(expensesByCategory).reduce((a, b) => 
            expensesByCategory[a] > expensesByCategory[b] ? a : b, ''
        );

        document.getElementById('top-expense-category').textContent = 
            topCategory ? this.formatCategory(topCategory) : 'N/A';

        // Promedio diario
        const daysInMonth = new Date().getDate();
        const dailyAverage = monthExpenses / daysInMonth;
        document.getElementById('daily-average').textContent = this.formatCurrency(dailyAverage);

        // Actualizar progreso de ahorro
        this.updateSavingsProgress(monthBalance);
    }

    updateSavingsProgress(monthBalance) {
        if (this.savingsGoal > 0) {
            const progress = Math.max(0, (monthBalance / this.savingsGoal) * 100);
            const progressElement = document.getElementById('savings-progress');
            const statusElement = document.getElementById('savings-status');
            
            progressElement.style.width = `${Math.min(progress, 100)}%`;
            statusElement.textContent = `${progress.toFixed(1)}% de la meta`;
            
            if (progress >= 100) {
                statusElement.textContent += ' ¡Meta alcanzada! 🎉';
                statusElement.style.color = '#4CAF50';
            } else {
                statusElement.style.color = '#666';
            }
        }
    }

    displayRecurringPayments() {
        const container = document.querySelector('.payments-container');
        container.innerHTML = '';

        if (this.recurringPayments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No hay pagos recurrentes configurados</p>';
            return;
        }

        this.recurringPayments.forEach(payment => {
            const paymentElement = document.createElement('div');
            paymentElement.className = 'recurring-payment';
            
            // Calcular días hasta vencimiento
            const today = new Date();
            const dueDate = new Date(payment.nextDue);
            const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            // Agregar indicador visual según días restantes
            let statusClass = '';
            let statusText = '';
            
            if (daysDiff < 0) {
                statusClass = 'overdue';
                statusText = `Vencido hace ${Math.abs(daysDiff)} días`;
            } else if (daysDiff === 0) {
                statusClass = 'due-today';
                statusText = 'Vence hoy';
            } else if (daysDiff <= 3) {
                statusClass = 'due-soon';
                statusText = `Vence en ${daysDiff} días`;
            } else {
                statusText = `Vence en ${daysDiff} días`;
            }
            
            paymentElement.innerHTML = `
                <div class="payment-info">
                    <strong>${payment.description}</strong>
                    <small>${this.formatFrequency(payment.frequency)} - Próximo: ${this.formatDate(payment.nextDue)}</small>
                    <div class="payment-status ${statusClass}">${statusText}</div>
                </div>
                <span class="payment-amount">${this.formatCurrency(payment.amount)}</span>
                <div class="payment-actions">
                    <button class="btn-action btn-paid" onclick="financeManager.markAsPaid('${payment.id}')" title="Marcar como pagado">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-remove" onclick="financeManager.deleteRecurringPayment('${payment.id}')" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(paymentElement);
        });
    }

    checkPaymentAlerts() {
        const alertsContainer = document.getElementById('payment-alerts');
        alertsContainer.innerHTML = '';
        
        const today = new Date();
        const alerts = [];
        
        this.recurringPayments.forEach(payment => {
            const dueDate = new Date(payment.nextDue);
            const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysDiff <= 7) { // Alertas para pagos en los próximos 7 días
                let alertType = 'info';
                let alertIcon = 'fa-info-circle';
                let alertTitle = '';
                
                if (daysDiff < 0) {
                    alertType = 'urgent';
                    alertIcon = 'fa-exclamation-triangle';
                    alertTitle = `¡Pago Vencido!`;
                } else if (daysDiff === 0) {
                    alertType = 'urgent';
                    alertIcon = 'fa-clock';
                    alertTitle = `¡Pago Vence Hoy!`;
                } else if (daysDiff <= 3) {
                    alertType = 'warning';
                    alertIcon = 'fa-clock';
                    alertTitle = `Pago Próximo`;
                } else {
                    alertType = 'info';
                    alertIcon = 'fa-calendar';
                    alertTitle = `Recordatorio`;
                }
                
                alerts.push({
                    ...payment,
                    alertType,
                    alertIcon,
                    alertTitle,
                    daysDiff
                });
            }
        });
        
        // Ordenar alertas por urgencia (vencidos primero, luego por días restantes)
        alerts.sort((a, b) => {
            if (a.daysDiff < 0 && b.daysDiff >= 0) return -1;
            if (a.daysDiff >= 0 && b.daysDiff < 0) return 1;
            return a.daysDiff - b.daysDiff;
        });
        
        alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `payment-alert ${alert.alertType}`;
            alertElement.innerHTML = `
                <div class="alert-content">
                    <div class="alert-icon">
                        <i class="fas ${alert.alertIcon}"></i>
                    </div>
                    <div class="alert-text">
                        <div class="alert-title">${alert.alertTitle}</div>
                        <div class="alert-description">
                            ${alert.description} - ${this.formatCurrency(alert.amount)} 
                            ${alert.daysDiff < 0 ? 
                                `(vencido hace ${Math.abs(alert.daysDiff)} días)` : 
                                alert.daysDiff === 0 ? '(vence hoy)' : 
                                `(vence en ${alert.daysDiff} días)`
                            }
                        </div>
                    </div>
                </div>
                <div class="alert-actions">
                    <button class="btn-alert btn-mark-paid" onclick="financeManager.markAsPaid('${alert.id}')">
                        <i class="fas fa-check"></i> Pagado
                    </button>
                    <button class="btn-alert btn-postpone" onclick="financeManager.postponePayment('${alert.id}')">
                        <i class="fas fa-calendar-plus"></i> Posponer
                    </button>
                    <button class="btn-alert btn-dismiss" onclick="financeManager.dismissAlert('${alert.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            alertsContainer.appendChild(alertElement);
        });
        
        // Actualizar contador de alertas en el título si hay alertas urgentes
        this.updateAlertCounter(alerts.filter(a => a.alertType === 'urgent').length);
    }

    markAsPaid(paymentId) {
        const payment = this.recurringPayments.find(p => p.id === paymentId);
        if (!payment) return;
        
        // Crear transacción automática
        const transaction = {
            id: Date.now().toString(),
            type: 'expense',
            description: `${payment.description} (Pago Recurrente)`,
            amount: payment.amount,
            category: 'servicios', // Categoría por defecto para pagos recurrentes
            date: new Date().toISOString().split('T')[0],
            method: 'transferencia', // Método por defecto
            timestamp: new Date()
        };
        
        this.transactions.push(transaction);
        
        // Actualizar fecha de próximo pago
        payment.nextDue = this.calculateNextDue(payment.frequency, new Date(payment.nextDue));
        
        this.saveToLocalStorage();
        this.updateAll();
        this.displayRecurringPayments();
        this.checkPaymentAlerts();
        this.showNotification(`Pago de ${payment.description} registrado y programado para la próxima fecha`, 'success');
    }

    postponePayment(paymentId) {
        const payment = this.recurringPayments.find(p => p.id === paymentId);
        if (!payment) return;
        
        // Posponer 7 días
        const currentDue = new Date(payment.nextDue);
        currentDue.setDate(currentDue.getDate() + 7);
        payment.nextDue = currentDue.toISOString().split('T')[0];
        
        this.saveToLocalStorage();
        this.displayRecurringPayments();
        this.checkPaymentAlerts();
        this.showNotification(`Pago de ${payment.description} pospuesto 7 días`, 'success');
    }

    dismissAlert(paymentId) {
        // Solo oculta la alerta hasta la próxima recarga
        document.querySelector(`[onclick*="${paymentId}"]`).closest('.payment-alert').remove();
    }

    updateAlertCounter(urgentCount) {
        const title = document.querySelector('.payment-model h3');
        const existingCounter = title.querySelector('.alert-counter');
        
        if (existingCounter) {
            existingCounter.remove();
        }
        
        if (urgentCount > 0) {
            const counter = document.createElement('span');
            counter.className = 'alert-counter';
            counter.textContent = urgentCount;
            title.appendChild(counter);
        }
    }

    calculateNextDue(frequency, fromDate = null) {
        const baseDate = fromDate || new Date();
        const nextDate = new Date(baseDate);
        
        switch(frequency) {
            case 'semanal':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'quincenal':
                nextDate.setDate(nextDate.getDate() + 15);
                break;
            case 'mensual':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'anual':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        return nextDate.toISOString().split('T')[0];
    }

    // Método mejorado para calcular fecha de próximo pago quincenal
    calculateSmartBiweeklyDate(frequency, fromDate = null) {
        if (frequency !== 'quincenal') {
            return this.calculateNextDue(frequency, fromDate);
        }

        const baseDate = fromDate || new Date();
        const currentDay = baseDate.getDate();
        const nextDate = new Date(baseDate);
        
        // Lógica inteligente para pagos quincenales (días 1 y 15)
        if (currentDay < 15) {
            // Si estamos antes del 15, el próximo pago es el 15 del mismo mes
            nextDate.setDate(15);
        } else {
            // Si estamos después del 15, el próximo pago es el 1 del siguiente mes
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(1);
        }
        
        return nextDate.toISOString().split('T')[0];
    }

    // Método alternativo para pagos quincenales cada 15 días exactos
    calculateExactBiweeklyDate(fromDate = null) {
        const baseDate = fromDate || new Date();
        const nextDate = new Date(baseDate);
        nextDate.setDate(nextDate.getDate() + 15);
        return nextDate.toISOString().split('T')[0];
    }

    switchTab(tab) {
        // Actualizar botones de tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Actualizar tabla
        this.updateTransactionsTable(tab);
    }

    filterTransactions() {
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        this.updateTransactionsTable(activeTab);
    }

    setSavingsGoal(goal) {
        this.savingsGoal = goal;
        localStorage.setItem('savingsGoal', goal.toString());
        this.updateMonthlyAnalysis();
    }

    loadSavingsGoal() {
        document.getElementById('savings-goal').value = this.savingsGoal;
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            recurringPayments: this.recurringPayments,
            savingsGoal: this.savingsGoal,
            exportDate: new Date().toISOString(),
            version: "1.0",
            summary: {
                totalIncome: this.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
                totalExpenses: this.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
                totalTransactions: this.transactions.length
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        this.showNotification('Datos exportados exitosamente', 'success');
    }

    importData(file) {
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            this.showNotification('Por favor selecciona un archivo JSON válido', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validar estructura del archivo
                if (!importedData.transactions || !Array.isArray(importedData.transactions)) {
                    throw new Error('Archivo JSON no tiene el formato correcto');
                }

                // Confirmar importación
                const confirmMsg = `
¿Deseas importar estos datos?

📊 Transacciones: ${importedData.transactions.length}
💳 Pagos Recurrentes: ${importedData.recurringPayments ? importedData.recurringPayments.length : 0}
📅 Fecha de Backup: ${new Date(importedData.exportDate).toLocaleDateString()}

⚠️ ATENCIÓN: Esto REEMPLAZARÁ todos los datos actuales.
                `;

                if (confirm(confirmMsg)) {
                    // Importar datos
                    this.transactions = importedData.transactions || [];
                    this.recurringPayments = importedData.recurringPayments || [];
                    this.savingsGoal = importedData.savingsGoal || 0;

                    // Guardar en localStorage
                    this.saveToLocalStorage();
                    
                    // Actualizar interfaz
                    this.updateAll();
                    this.displayRecurringPayments();
                    this.loadSavingsGoal();
                    
                    this.showNotification(`Datos importados exitosamente: ${importedData.transactions.length} transacciones`, 'success');
                }
            } catch (error) {
                console.error('Error al importar:', error);
                this.showNotification('Error al leer el archivo. Asegúrate de que sea un backup válido.', 'error');
            }
        };

        reader.readAsText(file);
        
        // Limpiar el input file
        document.getElementById('import-file').value = '';
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        // Establecer modo edición
        this.editingTransactionId = id;

        // Llenar el formulario correspondiente con los datos
        if (transaction.type === 'income') {
            document.getElementById('income-description').value = transaction.description;
            document.getElementById('income-amount').value = transaction.amount;
            document.getElementById('income-category').value = transaction.category;
            document.getElementById('income-date').value = transaction.date;
            document.getElementById('income-method').value = transaction.method || 'efectivo';
            
            // Cambiar texto del botón y mostrar botón cancelar
            const submitBtn = document.querySelector('#income-form button[type="submit"]');
            const cancelBtn = document.getElementById('cancel-edit-income');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Ingreso';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll al formulario
            document.getElementById('income-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.getElementById('expense-description').value = transaction.description;
            document.getElementById('expense-amount').value = transaction.amount;
            document.getElementById('expense-category').value = transaction.category;
            document.getElementById('expense-date').value = transaction.date;
            document.getElementById('expense-method').value = transaction.method || 'efectivo';
            
            // Cambiar texto del botón y mostrar botón cancelar
            const submitBtn = document.querySelector('#expense-form button[type="submit"]');
            const cancelBtn = document.getElementById('cancel-edit-expense');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Egreso';
            cancelBtn.style.display = 'inline-block';
            
            // Scroll al formulario
            document.getElementById('expense-form').scrollIntoView({ behavior: 'smooth' });
        }

        alert('📝 Modo edición activado. Modifica los campos y guarda los cambios.');
    }

    cancelEdit() {
        this.editingTransactionId = null;
        
        // Restaurar formulario de ingresos
        const incomeSubmitBtn = document.querySelector('#income-form button[type="submit"]');
        const incomeCancelBtn = document.getElementById('cancel-edit-income');
        incomeSubmitBtn.innerHTML = '<i class="fas fa-plus"></i> Agregar Ingreso';
        incomeCancelBtn.style.display = 'none';
        this.clearForm('income-form');
        
        // Restaurar formulario de egresos
        const expenseSubmitBtn = document.querySelector('#expense-form button[type="submit"]');
        const expenseCancelBtn = document.getElementById('cancel-edit-expense');
        expenseSubmitBtn.innerHTML = '<i class="fas fa-minus"></i> Agregar Egreso';
        expenseCancelBtn.style.display = 'none';
        this.clearForm('expense-form');
        
        alert('✅ Edición cancelada');
    }

    clearForm(formId) {
        document.getElementById(formId).reset();
        this.setCurrentDate();
    }

    updateAll() {
        this.updateSummary();
        this.updateTransactionsTable();
        this.updateAllCharts();
        this.updateMonthlyAnalysis();
        this.checkPaymentAlerts();
    }

    saveToLocalStorage() {
        // Usar try-catch para manejar posibles errores de localStorage
        try {
            // Debouncing para evitar escrituras excesivas
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                localStorage.setItem('transactions', JSON.stringify(this.transactions));
                localStorage.setItem('recurringPayments', JSON.stringify(this.recurringPayments));
            }, 200);
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
            this.showNotification('Error al guardar los datos localmente', 'error');
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatCategory(category) {
        const categories = {
            // Ingresos
            salario: '💼 Salario',
            freelance: '💻 Freelance',
            inversion: '📈 Inversión',
            negocio: '🏢 Negocio',
            // Egresos
            alimentacion: '🍽️ Alimentación',
            restaurante: '🍴 Restaurante',
            transporte: '🚗 Transporte',
            vivienda: '🏠 Vivienda',
            alquiler: '🏘️ Alquiler',
            salud: '🏥 Salud',
            quimica: '💊 Pago Químico',
            tecnica: '🔧 Pago Técnico',
            prestamo: '💳 Préstamo',
            entretenimiento: '🎬 Entretenimiento',
            educacion: '📚 Educación',
            ropa: '👕 Ropa',
            servicios: '⚡ Servicios',
            luz: '💡 Luz',
            agua: '💧 Agua',
            internet: '📶 Internet',
            otro: '📦 Otro'
        };
        return categories[category] || category;
    }

    formatMethod(method) {
        const methods = {
            efectivo: 'Efectivo',
            tarjeta: 'Tarjeta',
            transferencia: 'Transferencia',
            cheque: 'Cheque'
        };
        return methods[method] || method || 'Efectivo';
    }

    // Método para formatear la frecuencia de pago
    formatFrequency(frequency) {
        const frequencies = {
            semanal: '📅 Semanal (cada 7 días)',
            quincenal: '📋 Quincenal (cada 15 días)',
            mensual: '🗓️ Mensual (cada 30 días)',
            anual: '📆 Anual (cada 365 días)'
        };
        return frequencies[frequency] || frequency;
    }

    // Método para calcular la siguiente fecha quincenal inteligente
    calculateNextBiweeklyDate(currentDate) {
        const date = new Date(currentDate);
        const day = date.getDate();
        
        // Si es antes del día 15, la próxima fecha será el 15
        if (day < 15) {
            date.setDate(15);
        } else {
            // Si es después del 15, la próxima será el día 1 del siguiente mes
            date.setMonth(date.getMonth() + 1);
            date.setDate(1);
        }
        
        return date.toISOString().split('T')[0];
    }

    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Agregar estilos si no existen
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 1000;
                    animation: slideInNotification 0.3s ease-out;
                }                    .notification-success {
                        border-left: 4px solid #4CAF50;
                        color: #4CAF50;
                    }
                    .notification-error {
                        border-left: 4px solid #f44336;
                        color: #f44336;
                    }
                .notification-error {
                    border-left: 4px solid #f44336;
                    color: #f44336;
                }
                @keyframes slideInNotification {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideInNotification 0.3s ease-out reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    updateExpenseDescriptionsChart() {
        const ctx = document.getElementById('expenseDescriptionChart').getContext('2d');
        
        if (this.charts.expenseDescriptions) {
            this.charts.expenseDescriptions.destroy();
        }

        // Agrupar egresos por descripción y sumar montos
        const expensesByDescription = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                // Normalizar la descripción (primera letra mayúscula)
                const normalizedDesc = t.description.charAt(0).toUpperCase() + t.description.slice(1).toLowerCase();
                expensesByDescription[normalizedDesc] = (expensesByDescription[normalizedDesc] || 0) + t.amount;
            });

        // Ordenar por monto (mayor a menor) y tomar los top 10
        const sortedExpenses = Object.entries(expensesByDescription)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedExpenses.map(([desc]) => {
            // Truncar descripciones muy largas
            return desc.length > 20 ? desc.substring(0, 20) + '...' : desc;
        });
        const data = sortedExpenses.map(([, amount]) => amount);
        
        // Usar una paleta de colores variada
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', 
            '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB'
        ];

        this.charts.expenseDescriptions = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Monto Gastado',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y', // Para barras horizontales
                plugins: {
                    legend: { 
                        display: false 
                    },
                    tooltip: {
                        callbacks: {
                            title: (context) => {
                                // Mostrar la descripción completa en el tooltip
                                const fullDesc = sortedExpenses[context[0].dataIndex][0];
                                return fullDesc;
                            },
                            label: (context) => {
                                return `Total: ${this.formatCurrency(context.parsed.x)}`;
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Top 10 Egresos por Descripción',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'S/ ' + value.toLocaleString();
                            }
                        }
                    },
                    y: {
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    // Función para sugerir categoría automáticamente basada en la descripción
    suggestCategory(description) {
        const desc = description.toLowerCase();
        
        // Patrones de palabras clave para cada categoría
        const patterns = {
            restaurante: ['restaurante', 'comida', 'pizza', 'burger', 'cena', 'almuerzo', 'delivery', 'pedido'],
            alquiler: ['alquiler', 'renta', 'arriendo', 'mensualidad'],
            quimica: ['farmacia', 'medicina', 'pastilla', 'jarabe', 'inyección', 'químico', 'laboratorio'],
            tecnica: ['reparación', 'técnico', 'mantenimiento', 'servicio técnico', 'arreglo'],
            prestamo: ['préstamo', 'cuota', 'banco', 'financiera', 'crédito'],
            luz: ['luz', 'electricidad', 'energía eléctrica', 'recibo luz'],
            agua: ['agua', 'saneamiento', 'recibo agua', 'sedapal'],
            internet: ['internet', 'wifi', 'movistar', 'claro', 'entel', 'fibra'],
            transporte: ['gasolina', 'combustible', 'taxi', 'uber', 'bus', 'metro'],
            alimentacion: ['supermercado', 'mercado', 'abarrotes', 'viveres'],
            salud: ['doctor', 'médico', 'clínica', 'hospital', 'consulta'],
            entretenimiento: ['netflix', 'spotify', 'cine', 'película', 'juego']
        };
        
        // Buscar coincidencias
        for (const [category, keywords] of Object.entries(patterns)) {
            if (keywords.some(keyword => desc.includes(keyword))) {
                return category;
            }
        }
        
        return null;
    }

    // Configurar autosugerencia de categorías
    setupCategorySuggestion() {
        const expenseDescription = document.getElementById('expense-description');
        const expenseCategory = document.getElementById('expense-category');
        
        expenseDescription.addEventListener('input', (e) => {
            const suggestedCategory = this.suggestCategory(e.target.value);
            if (suggestedCategory) {
                expenseCategory.value = suggestedCategory;
                // Agregar efecto visual para mostrar que se sugirió automáticamente
                expenseCategory.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
                setTimeout(() => {
                    expenseCategory.style.background = '';
                }, 1500);
            }
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.financeManager = new FinanceManager();
    // Removido setupCategorySuggestion para evitar errores
});

// Funciones para autocompletado y sugerencias
function setupAutoComplete() {
    const descriptionInputs = document.querySelectorAll('#income-description, #expense-description');
    
    descriptionInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Aquí podrías agregar lógica de autocompletado basada en transacciones anteriores
            const previousDescriptions = financeManager.transactions
                .map(t => t.description)
                .filter(desc => desc.toLowerCase().includes(this.value.toLowerCase()))
                .slice(0, 5);
            
            // Mostrar sugerencias (implementación opcional)
        });
    });
}

// Función para cargar datos de ejemplo (para demo)
function loadSampleData() {
    if (confirm('¿Deseas cargar datos de ejemplo? Esto sobrescribirá los datos actuales.')) {
        const sampleTransactions = [
            { id: '1', type: 'income', description: 'Salario Enero', amount: 2500, category: 'salario', date: '2025-01-01', method: 'transferencia' },
            { id: '2', type: 'expense', description: 'Supermercado', amount: 150, category: 'alimentacion', date: '2025-01-02', method: 'tarjeta' },
            { id: '3', type: 'expense', description: 'Gasolina', amount: 50, category: 'transporte', date: '2025-01-03', method: 'efectivo' },
            { id: '4', type: 'income', description: 'Freelance Web', amount: 800, category: 'freelance', date: '2025-01-05', method: 'transferencia' },
            { id: '5', type: 'expense', description: 'Netflix', amount: 15, category: 'entretenimiento', date: '2025-01-10', method: 'tarjeta' }
        ];
        
        financeManager.transactions = sampleTransactions;
        financeManager.saveToLocalStorage();
        financeManager.updateAll();
        financeManager.showNotification('Datos de ejemplo cargados exitosamente', 'success');
    }
}

// Inicializar la aplicación
let financeManager;

// Función global para editar transacciones
function editTransaction(id) {
    // Pequeño delay para asegurar que financeManager está listo
    setTimeout(() => {
        if (financeManager && typeof financeManager.editTransaction === 'function') {
            financeManager.editTransaction(id);
        } else {
            console.error('financeManager no está disponible');
            alert('Error: La aplicación no está completamente cargada. Recarga la página.');
        }
    }, 50);
}

// Función global para eliminar transacciones
function deleteTransaction(id) {
    // Pequeño delay para asegurar que financeManager está listo
    setTimeout(() => {
        if (financeManager && typeof financeManager.deleteTransaction === 'function') {
            financeManager.deleteTransaction(id);
        } else {
            console.error('financeManager no está disponible');
            alert('Error: La aplicación no está completamente cargada. Recarga la página.');
        }
    }, 50);
}

// Agregar botón de datos de ejemplo al header
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el gestor de finanzas
    try {
        financeManager = new FinanceManager();
        console.log('✅ FinanceManager inicializado correctamente');
    } catch (error) {
        console.error('❌ Error al inicializar FinanceManager:', error);
        alert('Error al cargar la aplicación. Por favor recarga la página.');
        return;
    }
    
    const header = document.querySelector('.header');
    if (header) {
        const sampleButton = document.createElement('button');
        sampleButton.innerHTML = '<i class="fas fa-database"></i> Cargar Datos de Ejemplo';
        sampleButton.className = 'btn btn-secondary';
        sampleButton.style.marginTop = '15px';
        sampleButton.onclick = loadSampleData;
        header.appendChild(sampleButton);
    }
});

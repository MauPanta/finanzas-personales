// Versión simplificada y funcional del script
class FinanceManager {
    constructor() {
        console.log('🚀 Inicializando FinanceManager...');
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.recurringPayments = JSON.parse(localStorage.getItem('recurringPayments')) || [];
        console.log('💰 Pagos recurrentes cargados:', this.recurringPayments.length);
        this.editingTransactionId = null;
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
        try {
            this.setupEventListeners();
            this.setCurrentDate();
            this.updateSummary();
            this.updateTransactionsTable();
            
            // Solo llamar updateMonthlyAnalysis si hay elementos del análisis mensual
            if (document.getElementById('month-income') || document.getElementById('month-expenses')) {
                this.updateMonthlyAnalysis();
            }
            
            // Cargar meta de ahorro guardada
            this.loadSavedSavingsGoal();

            // Cargar gráficos de forma diferida para evitar errores de inicialización
            setTimeout(() => {
                this.updateChart('expenses');
                // Cargar y mostrar pagos recurrentes después de que todo esté listo
                this.displayRecurringPayments();
            }, 500);
            
        } catch (error) {
            console.error('Error en init():', error);
        }
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

        // Tabs de tabla
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Pestañas de gráficos
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchChart(e.target.dataset.chart);
            });
        });

        // Meta de ahorro
        const savingsInput = document.getElementById('savings-goal');
        if (savingsInput) {
            savingsInput.addEventListener('input', (e) => {
                this.updateSavingsGoal(parseFloat(e.target.value) || 0);
            });
        }

        // Formulario de pagos recurrentes
        const recurringForm = document.getElementById('recurring-payment-form');
        if (recurringForm) {
            // Remover listener previo si existe
            recurringForm.removeEventListener('submit', this.handleRecurringSubmit);
            // Agregar nuevo listener
            this.handleRecurringSubmit = (e) => {
                e.preventDefault();
                console.log('🎯 Submit de pagos recurrentes activado');
                this.addRecurringPayment();
            };
            recurringForm.addEventListener('submit', this.handleRecurringSubmit);
            console.log('✅ Event listener de pagos recurrentes configurado');
        } else {
            console.error('❌ Formulario recurring-payment-form no encontrado');
        }

        // Event listener alternativo para el botón de pagos recurrentes
        // Buscar el botón dentro del formulario de pagos recurrentes
        const recurringButton = document.querySelector('#recurring-payment-form button[type="submit"]');
        if (recurringButton) {
            recurringButton.addEventListener('click', (e) => {
                console.log('🎯 Click directo en botón de pagos recurrentes');
                e.preventDefault();
                this.addRecurringPayment();
            });
            console.log('✅ Event listener directo en botón configurado');
        } else {
            console.error('❌ Botón de submit de pagos recurrentes no encontrado');
        }

        // ...existing code...
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const incomeDate = document.getElementById('income-date');
        const expenseDate = document.getElementById('expense-date');
        
        if (incomeDate) incomeDate.value = today;
        if (expenseDate) expenseDate.value = today;
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
            // Modo edición
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    description, amount, category, date, method,
                    timestamp: new Date()
                };
                this.saveToLocalStorage();
                this.updateSummary();
                this.updateTransactionsTable();
                this.updateMonthlyAnalysis();
                this.updateAllCharts();
                alert('✅ Operación actualizada exitosamente');
                this.cancelEdit();
                return;
            }
        } else {
            // Modo agregar
            const transaction = {
                id: Date.now().toString(),
                type: 'income',
                description, amount, category, date, method,
                timestamp: new Date()
            };
            this.transactions.push(transaction);
            this.clearForm('income-form');
            alert('✅ Operación grabada - Ingreso agregado exitosamente');
        }

        this.saveToLocalStorage();
        this.updateSummary();
        this.updateTransactionsTable();
        this.updateMonthlyAnalysis();
        this.updateAllCharts();
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
            // Modo edición
            const index = this.transactions.findIndex(t => t.id === this.editingTransactionId);
            if (index !== -1) {
                this.transactions[index] = {
                    ...this.transactions[index],
                    description, amount, category, date, method,
                    timestamp: new Date()
                };
                this.saveToLocalStorage();
                this.updateSummary();
                this.updateTransactionsTable();
                this.updateMonthlyAnalysis();
                this.updateAllCharts();
                alert('✅ Operación actualizada exitosamente');
                this.cancelEdit();
                return;
            }
        } else {
            // Modo agregar
            const transaction = {
                id: Date.now().toString(),
                type: 'expense',
                description, amount, category, date, method,
                timestamp: new Date()
            };
            this.transactions.push(transaction);
            this.clearForm('expense-form');
            alert('✅ Operación grabada - Egreso agregado exitosamente');
        }

        this.saveToLocalStorage();
        this.updateSummary();
        this.updateTransactionsTable();
        this.updateMonthlyAnalysis();
        this.updateAllCharts();
    }

    editTransaction(id) {
        const transaction = this.transactions.find(t => t.id === id);
        if (!transaction) return;

        this.editingTransactionId = id;

        if (transaction.type === 'income') {
            document.getElementById('income-description').value = transaction.description;
            document.getElementById('income-amount').value = transaction.amount;
            document.getElementById('income-category').value = transaction.category;
            document.getElementById('income-date').value = transaction.date;
            document.getElementById('income-method').value = transaction.method || 'efectivo';
            
            const submitBtn = document.querySelector('#income-form button[type="submit"]');
            const cancelBtn = document.getElementById('cancel-edit-income');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Ingreso';
            cancelBtn.style.display = 'inline-block';
            document.getElementById('income-form').scrollIntoView({ behavior: 'smooth' });
        } else {
            document.getElementById('expense-description').value = transaction.description;
            document.getElementById('expense-amount').value = transaction.amount;
            document.getElementById('expense-category').value = transaction.category;
            document.getElementById('expense-date').value = transaction.date;
            document.getElementById('expense-method').value = transaction.method || 'efectivo';
            
            const submitBtn = document.querySelector('#expense-form button[type="submit"]');
            const cancelBtn = document.getElementById('cancel-edit-expense');
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Egreso';
            cancelBtn.style.display = 'inline-block';
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
    }

    deleteTransaction(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.updateMonthlyAnalysis();
            this.updateAllCharts();
            alert('✅ Transacción eliminada');
        }
    }

    clearForm(formId) {
        document.getElementById(formId).reset();
        this.setCurrentDate();
    }

    updateSummary() {
        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpenses;

        // Actualizar solo si los elementos existen
        const incomeEl = document.getElementById('total-income');
        const expensesEl = document.getElementById('total-expenses');
        const balanceEl = document.getElementById('balance');

        if (incomeEl) incomeEl.textContent = this.formatCurrency(totalIncome);
        if (expensesEl) expensesEl.textContent = this.formatCurrency(totalExpenses);
        
        if (balanceEl) {
            balanceEl.textContent = this.formatCurrency(balance);
            if (balance >= 0) {
                balanceEl.style.color = '#28a745';
            } else {
                balanceEl.style.color = '#dc3545';
            }
        }
    }

    updateTransactionsTable() {
        const tbody = document.getElementById('transactions-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        // Ordenar por fecha (más reciente primero)
        const sortedTransactions = [...this.transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedTransactions.forEach(transaction => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.formatDate(transaction.date)}</td>
                <td>${transaction.description}</td>
                <td><span class="category-tag">${this.formatCategory(transaction.category)}</span></td>
                <td><span class="type-badge type-${transaction.type}">${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}</span></td>
                <td><span class="method-badge">${this.formatMethod(transaction.method)}</span></td>
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
            tbody.appendChild(row);
        });
    }

    switchTab(tab) {
        // Actualizar botones
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Filtrar transacciones
        const rows = document.querySelectorAll('#transactions-tbody tr');
        rows.forEach(row => {
            const typeCell = row.querySelector('.type-badge');
            if (!typeCell) return;

            const isIncome = typeCell.classList.contains('type-income');
            const isExpense = typeCell.classList.contains('type-expense');

            if (tab === 'all') {
                row.style.display = '';
            } else if (tab === 'income' && isIncome) {
                row.style.display = '';
            } else if (tab === 'expenses' && isExpense) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }

    updateMonthlyAnalysis() {
        console.log('🔍 Ejecutando updateMonthlyAnalysis()');
        
        const currentMonth = new Date().toISOString().substring(0, 7);
        console.log('📅 Mes actual:', currentMonth);
        
        const monthlyTransactions = this.transactions.filter(t => 
            t.date.substring(0, 7) === currentMonth
        );
        console.log('📊 Transacciones del mes:', monthlyTransactions.length, monthlyTransactions);

        const monthlyIncome = monthlyTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const monthlyBalance = monthlyIncome - monthlyExpenses;

        // Categoría más gastada
        const expensesByCategory = {};
        monthlyTransactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        const topCategory = Object.keys(expensesByCategory).length > 0 
            ? Object.keys(expensesByCategory).reduce((a, b) => 
                expensesByCategory[a] > expensesByCategory[b] ? a : b
            ) : 'N/A';

        // Promedio diario
        const daysInMonth = new Date().getDate();
        const dailyAverage = monthlyExpenses / daysInMonth;

        // Actualizar elementos SOLO si existen
        const monthIncomeEl = document.getElementById('month-income');
        const monthExpensesEl = document.getElementById('month-expenses');
        const monthBalanceEl = document.getElementById('month-balance');
        const topCategoryEl = document.getElementById('top-expense-category');
        const dailyAverageEl = document.getElementById('daily-average');

        console.log('🔍 Elementos encontrados:');
        console.log('- month-income:', monthIncomeEl ? 'SÍ' : 'NO');
        console.log('- month-expenses:', monthExpensesEl ? 'SÍ' : 'NO');
        console.log('- month-balance:', monthBalanceEl ? 'SÍ' : 'NO');
        console.log('- top-expense-category:', topCategoryEl ? 'SÍ' : 'NO');
        console.log('- daily-average:', dailyAverageEl ? 'SÍ' : 'NO');

        if (monthIncomeEl) {
            monthIncomeEl.textContent = this.formatCurrency(monthlyIncome);
            console.log('✅ Ingresos actualizados:', this.formatCurrency(monthlyIncome));
        }
        if (monthExpensesEl) {
            monthExpensesEl.textContent = this.formatCurrency(monthlyExpenses);
            console.log('✅ Gastos actualizados:', this.formatCurrency(monthlyExpenses));
        }
        if (monthBalanceEl) {
            monthBalanceEl.textContent = this.formatCurrency(monthlyBalance);
            console.log('✅ Balance actualizado:', this.formatCurrency(monthlyBalance));
        }
        if (topCategoryEl) {
            topCategoryEl.textContent = topCategory !== 'N/A' ? this.formatCategory(topCategory) : 'N/A';
            console.log('✅ Categoría actualizada:', topCategory);
        }
        if (dailyAverageEl) {
            dailyAverageEl.textContent = this.formatCurrency(dailyAverage);
            console.log('✅ Promedio actualizado:', this.formatCurrency(dailyAverage));
        }

        this.updateSavingsGoal(monthlyBalance);
    }

    updateSavingsGoal(monthBalance = 0) {
        const goalInput = document.getElementById('savings-goal');
        const progressBar = document.getElementById('savings-progress');
        const progressText = document.getElementById('savings-status');

        if (!goalInput || !progressBar || !progressText) return;

        const goal = parseFloat(goalInput.value) || 0;
        if (goal <= 0) {
            progressBar.style.width = '0%';
            progressText.textContent = '0% de la meta';
            return;
        }

        const currentSavings = Math.max(0, monthBalance);
        const percentage = Math.min(100, (currentSavings / goal) * 100);

        progressBar.style.width = percentage + '%';
        progressText.textContent = Math.round(percentage) + '% de la meta';

        // Colores según progreso
        if (percentage >= 100) {
            progressBar.style.backgroundColor = '#28a745';
        } else if (percentage >= 50) {
            progressBar.style.backgroundColor = '#ffc107';
        } else {
            progressBar.style.backgroundColor = '#17a2b8';
        }

        localStorage.setItem('savingsGoal', goal.toString());
    }

    loadSavedSavingsGoal() {
        const savedGoal = localStorage.getItem('savingsGoal');
        const goalInput = document.getElementById('savings-goal');
        if (savedGoal && goalInput) {
            goalInput.value = savedGoal;
        }
    }

    exportData() {
        const data = {
            transactions: this.transactions,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        alert('✅ Datos exportados exitosamente');
    }

    importData(file) {
        if (!file) {
            alert('Por favor selecciona un archivo JSON válido');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                if (importedData.transactions && Array.isArray(importedData.transactions)) {
                    this.transactions = importedData.transactions;
                    this.saveToLocalStorage();
                    this.updateSummary();
                    this.updateTransactionsTable();
                    this.updateMonthlyAnalysis();
                    this.updateAllCharts();
                    alert(`Datos importados exitosamente: ${importedData.transactions.length} transacciones`);
                } else {
                    alert('Archivo no válido. Debe contener un array de transacciones.');
                }
            } catch (error) {
                alert('Error al leer el archivo. Asegúrate de que sea un backup válido.');
            }
        };
        reader.readAsText(file);
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    formatCurrency(amount) {
        return `S/ ${amount.toFixed(2)}`;
    }

    formatDate(dateStr) {
        try {
            // Agregar un día para compensar el problema de zona horaria
            const date = new Date(dateStr + 'T12:00:00');
            
            // Verificar que la fecha sea válida
            if (isNaN(date.getTime())) {
                return dateStr; // Devolver el string original si no se puede parsear
            }
            
            // Formatear en español peruano
            return date.toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            });
        } catch (error) {
            console.error('Error formateando fecha:', error);
            return dateStr;
        }
    }

    formatCategory(category) {
        const categories = {
            'salario': '💼 Salario',
            'freelance': '💻 Freelance',
            'inversion': '📈 Inversión',
            'negocio': '🏢 Negocio',
            'alimentacion': '🍽️ Alimentación',
            'restaurante': '🍴 Restaurante',
            'transporte': '🚗 Transporte',
            'vivienda': '🏠 Vivienda',
            'salud': '🏥 Salud',
            'entretenimiento': '🎬 Entretenimiento',
            'educacion': '📚 Educación',
            'ropa': '👕 Ropa',
            'servicios': '⚡ Servicios',
            'otro': '📦 Otro'
        };
        return categories[category] || category;
    }

    formatMethod(method) {
        const methods = {
            'efectivo': '💵 Efectivo',
            'tarjeta': '💳 Tarjeta',
            'transferencia': '🏦 Transferencia',
            'cheque': '📄 Cheque'
        };
        return methods[method] || method;
    }

    // ============ MÉTODOS DE GRÁFICOS ============
    
    switchChart(chartType) {
        console.log('🔄 Cambiando a gráfico:', chartType);
        
        // Actualizar botones de pestañas
        document.querySelectorAll('.chart-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeBtn = document.querySelector(`[data-chart="${chartType}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Mostrar contenido del gráfico correspondiente
        document.querySelectorAll('.chart-content').forEach(content => {
            content.classList.remove('active');
        });
        const chartContent = document.getElementById(`chart-${chartType}`);
        if (chartContent) chartContent.classList.add('active');

        // Actualizar el gráfico específico con delay
        setTimeout(() => {
            this.updateChart(chartType);
        }, 100);
    }

    updateChart(chartType) {
        try {
            console.log('📊 Actualizando gráfico:', chartType);
            
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
                default:
                    console.log('Tipo de gráfico desconocido:', chartType);
            }
        } catch (error) {
            console.error('Error al actualizar gráfico ' + chartType + ':', error);
        }
    }

    updateExpensesChart() {
        const canvas = document.getElementById('expenseChart');
        if (!canvas) {
            console.log('Canvas expenseChart no encontrado');
            return;
        }

        // Destruir gráfico existente de forma segura
        if (this.charts.expenses) {
            try {
                this.charts.expenses.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico expenses:', e);
            }
            this.charts.expenses = null;
        }

        const expensesByCategory = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
            });

        const labels = Object.keys(expensesByCategory).map(cat => this.formatCategory(cat));
        const data = Object.values(expensesByCategory);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

        if (labels.length === 0) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            console.log('No hay datos de gastos para mostrar');
            return;
        }

        try {
            this.charts.expenses = new Chart(canvas.getContext('2d'), {
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
            console.log('✅ Gráfico de gastos creado exitosamente');
        } catch (error) {
            console.error('Error al crear gráfico de gastos:', error);
        }
    }

    updateIncomeChart() {
        const canvas = document.getElementById('incomeChart');
        if (!canvas) return;

        if (this.charts.income) {
            try {
                this.charts.income.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico income:', e);
            }
            this.charts.income = null;
        }

        const incomeByCategory = {};
        this.transactions
            .filter(t => t.type === 'income')
            .forEach(t => {
                incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount;
            });

        const labels = Object.keys(incomeByCategory).map(cat => this.formatCategory(cat));
        const data = Object.values(incomeByCategory);
        const colors = ['#28a745', '#17a2b8', '#ffc107', '#6f42c1', '#e83e8c'];

        if (labels.length === 0) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            this.charts.income = new Chart(canvas.getContext('2d'), {
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
                });
        } catch (error) {
            console.error('Error al crear gráfico de ingresos:', error);
        }
    }

    updateComparisonChart() {
        const canvas = document.getElementById('comparisonChart');
        if (!canvas) return;

        if (this.charts.comparison) {
            try {
                this.charts.comparison.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico comparison:', e);
            }
            this.charts.comparison = null;
        }

        const totalIncome = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalExpenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        if (totalIncome === 0 && totalExpenses === 0) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            this.charts.comparison = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Ingresos', 'Egresos'],
                    datasets: [{
                        data: [totalIncome, totalExpenses],
                        backgroundColor: ['#28a745', '#dc3545'],
                        borderWidth: 2,
                        borderColor: '#fff'
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
                                    return this.formatCurrency(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatCurrency(value)
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error al crear gráfico de comparación:', error);
        }
    }

    // Implementar gráficos faltantes
    updateExpenseDescriptionsChart() {
        const canvas = document.getElementById('expenseDescriptionChart');
        if (!canvas) return;

        if (this.charts.expenseDescriptions) {
            try {
                this.charts.expenseDescriptions.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico expenseDescriptions:', e);
            }
            this.charts.expenseDescriptions = null;
        }

        const expensesByDescription = {};
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                expensesByDescription[t.description] = (expensesByDescription[t.description] || 0) + t.amount;
            });

        // Tomar solo los 10 más altos
        const sortedExpenses = Object.entries(expensesByDescription)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const labels = sortedExpenses.map(([desc]) => desc.length > 20 ? desc.substring(0, 20) + '...' : desc);
        const data = sortedExpenses.map(([,amount]) => amount);
        const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF', '#4BC0C0', '#FF6384', '#36A2EB'];

        if (labels.length === 0) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            this.charts.expenseDescriptions = new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Monto',
                        data: data,
                        backgroundColor: colors,
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => this.formatCurrency(context.parsed.x)
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatCurrency(value)
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico de descripciones de gastos creado exitosamente');
        } catch (error) {
            console.error('Error al crear gráfico de descripciones:', error);
        }
    }

    updateMethodsChart() {
        const canvas = document.getElementById('methodsChart');
        if (!canvas) return;

        if (this.charts.methods) {
            try {
                this.charts.methods.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico methods:', e);
            }
            this.charts.methods = null;
        }

        const transactionsByMethod = {};
        this.transactions.forEach(t => {
            transactionsByMethod[t.method] = (transactionsByMethod[t.method] || 0) + t.amount;
        });

        const labels = Object.keys(transactionsByMethod).map(method => this.formatMethod(method));
        const data = Object.values(transactionsByMethod);
        const colors = ['#28a745', '#dc3545', '#ffc107', '#17a2b8'];

        if (labels.length === 0) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            this.charts.methods = new Chart(canvas.getContext('2d'), {
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
            });
            console.log('✅ Gráfico de métodos de pago creado exitosamente');
        } catch (error) {
            console.error('Error al crear gráfico de métodos:', error);
        }
    }

    updateMonthlyChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;

        if (this.charts.monthly) {
            try {
                this.charts.monthly.destroy();
            } catch (e) {
                console.log('Error al destruir gráfico monthly:', e);
            }
            this.charts.monthly = null;
        }

        // Agrupar gastos por mes de los últimos 6 meses
        const months = {};
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = date.toISOString().substring(0, 7);
            const monthName = date.toLocaleDateString('es-PE', { month: 'short', year: 'numeric' });
            months[key] = { name: monthName, expenses: 0 };
        }

        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const monthKey = t.date.substring(0, 7);
                if (months[monthKey]) {
                    months[monthKey].expenses += t.amount;
                }
            });

        const labels = Object.values(months).map(m => m.name);
        const data = Object.values(months).map(m => m.expenses);

        if (data.every(value => value === 0)) {
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        try {
            this.charts.monthly = new Chart(canvas.getContext('2d'), {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gastos Mensuales',
                        data: data,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => this.formatCurrency(context.parsed.y)
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: (value) => this.formatCurrency(value)
                            }
                        }
                    }
                }
            });
            console.log('✅ Gráfico mensual creado exitosamente');
        } catch (error) {
            console.error('Error al crear gráfico mensual:', error);
        }
    }

    // ============ MÉTODOS DE PAGOS RECURRENTES ============

    addRecurringPayment() {
        console.log('🔍 Ejecutando addRecurringPayment()');
        const description = document.getElementById('recurring-description').value;
        const amount = parseFloat(document.getElementById('recurring-amount').value);
        const frequency = document.getElementById('recurring-frequency').value;

        console.log('📝 Valores del formulario:', { description, amount, frequency });

        if (!description || !amount || !frequency) {
            alert('Por favor completa todos los campos');
            return;
        }

        const payment = {
            id: Date.now().toString(),
            description,
            amount,
            frequency,
            nextDue: this.calculateNextDue(frequency)
        };

        this.recurringPayments.push(payment);
        this.saveRecurringPayments();
        this.displayRecurringPayments();
        this.clearForm('recurring-payment-form');
        alert('✅ Pago recurrente agregado exitosamente');
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

    deleteRecurringPayment(id) {
        if (confirm('¿Estás seguro de que quieres eliminar este pago recurrente?')) {
            this.recurringPayments = this.recurringPayments.filter(p => p.id !== id);
            this.saveRecurringPayments();
            this.displayRecurringPayments();
            alert('✅ Pago recurrente eliminado');
        }
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
            category: 'servicios',
            date: new Date().toISOString().split('T')[0],
            method: 'transferencia',
            timestamp: new Date()
        };
        
        this.transactions.push(transaction);
        
        // Actualizar fecha de próximo pago
        payment.nextDue = this.calculateNextDue(payment.frequency);
        
        this.saveToLocalStorage();
        this.saveRecurringPayments();
        this.updateSummary();
        this.updateTransactionsTable();
        this.updateMonthlyAnalysis();
        this.updateAllCharts();
        this.displayRecurringPayments();
        
        alert(`✅ Pago de ${payment.description} registrado y programado para la próxima fecha`);
    }

    displayRecurringPayments() {
        console.log('🔍 Ejecutando displayRecurringPayments()');
        const container = document.querySelector('.payments-container');
        console.log('📦 Contenedor encontrado:', container);
        console.log('💰 Pagos recurrentes:', this.recurringPayments.length, this.recurringPayments);
        
        if (!container) {
            console.error('❌ Contenedor .payments-container no encontrado');
            return;
        }
        
        container.innerHTML = '';

        if (this.recurringPayments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666;">No hay pagos recurrentes configurados</p>';
            console.log('📝 Mensaje mostrado: No hay pagos recurrentes');
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

    formatFrequency(frequency) {
        const frequencies = {
            'semanal': '📅 Semanal',
            'quincenal': '📅 Quincenal', 
            'mensual': '📅 Mensual',
            'anual': '📅 Anual'
        };
        return frequencies[frequency] || frequency;
    }

    saveRecurringPayments() {
        try {
            localStorage.setItem('recurringPayments', JSON.stringify(this.recurringPayments));
        } catch (error) {
            console.error('Error al guardar pagos recurrentes:', error);
        }
    }

    // ...existing code...
}

// Funciones globales para los botones
function editTransaction(id) {
    if (window.financeManager && typeof window.financeManager.editTransaction === 'function') {
        window.financeManager.editTransaction(id);
    } else {
        alert('Error: La aplicación no está completamente cargada. Recarga la página.');
    }
}

function deleteTransaction(id) {
    if (window.financeManager && typeof window.financeManager.deleteTransaction === 'function') {
        window.financeManager.deleteTransaction(id);
    } else {
        alert('Error: La aplicación no está completamente cargada. Recarga la página.');
    }
}

// Funciones globales para pagos recurrentes
function deleteRecurringPayment(id) {
    if (window.financeManager && typeof window.financeManager.deleteRecurringPayment === 'function') {
        window.financeManager.deleteRecurringPayment(id);
    } else {
        alert('Error: La aplicación no está completamente cargada. Recarga la página.');
    }
}

function markAsPaid(id) {
    if (window.financeManager && typeof window.financeManager.markAsPaid === 'function') {
        window.financeManager.markAsPaid(id);
    } else {
        alert('Error: La aplicación no está completamente cargada. Recarga la página.');
    }
}

// Función global de respaldo para agregar pagos recurrentes
function addRecurringPaymentGlobal() {
    console.log('🌐 Función global addRecurringPaymentGlobal llamada');
    if (window.financeManager && typeof window.financeManager.addRecurringPayment === 'function') {
        window.financeManager.addRecurringPayment();
    } else {
        console.error('❌ FinanceManager no está disponible');
        alert('Error: La aplicación no está completamente cargada. Recarga la página.');
    }
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.financeManager = new FinanceManager();
        console.log('✅ FinanceManager inicializado correctamente');
        
        // Configurar botones de exportar/importar
        const exportBtn = document.getElementById('export-data');
        const importBtn = document.getElementById('import-data');
        const importFile = document.getElementById('import-file');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => financeManager.exportData());
        }

        if (importBtn && importFile) {
            importBtn.addEventListener('click', () => importFile.click());
            importFile.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    financeManager.importData(e.target.files[0]);
                }
            });
        }

    } catch (error) {
        console.error('❌ Error al inicializar FinanceManager:', error);
        alert('Error al cargar la aplicación. Por favor recarga la página.');
    }
});

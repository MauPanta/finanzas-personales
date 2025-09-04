// Versión simplificada y funcional del script
class FinanceManager {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.editingTransactionId = null;
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

        // Meta de ahorro
        const savingsInput = document.getElementById('savings-goal');
        if (savingsInput) {
            savingsInput.addEventListener('input', (e) => {
                this.updateSavingsGoal(parseFloat(e.target.value) || 0);
            });
        }
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

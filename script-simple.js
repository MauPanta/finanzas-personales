// Gestor de Finanzas Simple
class FinanceManager {
    constructor() {
        console.log('🚀 Inicializando Finance Manager...');
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        console.log('📊 Transacciones cargadas:', this.transactions.length);
        this.init();
    }

    init() {
        console.log('⚙️ Configurando aplicación...');
        this.setupEventListeners();
        this.setCurrentDate();
        this.updateSummary();
        this.updateTransactionsTable();
        console.log('✅ Aplicación inicializada correctamente');
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Formulario de ingresos
        const incomeForm = document.getElementById('income-form');
        console.log('📝 Formulario de ingresos encontrado:', !!incomeForm);
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('➕ Agregando ingreso...');
                this.addIncome();
            });
        }

        // Formulario de egresos
        const expenseForm = document.getElementById('expense-form');
        console.log('📝 Formulario de egresos encontrado:', !!expenseForm);
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('➖ Agregando egreso...');
                this.addExpense();
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

        if (!description || !amount || amount <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

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
        this.saveToLocalStorage();
        this.updateSummary();
        this.updateTransactionsTable();
        this.clearForm('income-form');
        this.showNotification('Ingreso agregado exitosamente', 'success');
    }

    addExpense() {
        const description = document.getElementById('expense-description').value;
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;
        const method = document.getElementById('expense-method').value;

        if (!description || !amount || amount <= 0) {
            alert('Por favor, completa todos los campos correctamente.');
            return;
        }

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
        this.saveToLocalStorage();
        this.updateSummary();
        this.updateTransactionsTable();
        this.clearForm('expense-form');
        this.showNotification('Egreso agregado exitosamente', 'success');
    }

    updateSummary() {
        console.log('📊 Actualizando resumen...');
        
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expenses;

        console.log(`💰 Ingresos: ${income}, Egresos: ${expenses}, Balance: ${balance}`);

        // Actualizar elementos en el DOM
        const totalIncomeElement = document.getElementById('total-income');
        const totalExpensesElement = document.getElementById('total-expenses');
        const balanceElement = document.getElementById('balance');

        console.log('🎯 Elementos encontrados:', {
            income: !!totalIncomeElement,
            expenses: !!totalExpensesElement,
            balance: !!balanceElement
        });

        if (totalIncomeElement) {
            totalIncomeElement.textContent = this.formatCurrency(income);
        }
        if (totalExpensesElement) {
            totalExpensesElement.textContent = this.formatCurrency(expenses);
        }
        if (balanceElement) {
            balanceElement.textContent = this.formatCurrency(balance);
            balanceElement.style.color = balance >= 0 ? '#4CAF50' : '#f44336';
        }
    }

    updateTransactionsTable() {
        console.log('📋 Actualizando tabla de transacciones...');
        
        const tableBody = document.getElementById('transactions-tbody');
        console.log('📊 Tabla encontrada:', !!tableBody);
        console.log('🔢 Transacciones a mostrar:', this.transactions.length);
        
        if (!tableBody) {
            console.error('❌ No se encontró el elemento transactions-tbody');
            return;
        }

        tableBody.innerHTML = '';

        this.transactions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach((transaction, index) => {
                console.log(`➕ Agregando transacción ${index + 1}:`, transaction);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${this.formatDate(transaction.date)}</td>
                    <td>${transaction.description}</td>
                    <td>${transaction.category}</td>
                    <td class="${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                    </td>
                    <td>${transaction.method}</td>
                    <td>
                        <button onclick="financeManager.deleteTransaction('${transaction.id}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
    }

    deleteTransaction(id) {
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.showNotification('Transacción eliminada', 'success');
        }
    }

    clearForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.setCurrentDate();
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
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

    showNotification(message, type) {
        // Crear notificación simple
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
let financeManager;
document.addEventListener('DOMContentLoaded', () => {
    financeManager = new FinanceManager();
    console.log('Finance Manager inicializado correctamente');
});

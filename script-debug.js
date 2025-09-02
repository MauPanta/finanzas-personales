// Versión simplificada del Gestor de Finanzas - Con debug completo
console.log('🔧 Cargando script de finanzas...');

class FinanceManager {
    constructor() {
        console.log('🚀 Construyendo Finance Manager...');
        this.transactions = [];
        
        try {
            const stored = localStorage.getItem('transactions');
            if (stored) {
                this.transactions = JSON.parse(stored);
                console.log('📊 Transacciones cargadas desde localStorage:', this.transactions.length);
            } else {
                console.log('📊 No hay transacciones guardadas, iniciando con array vacío');
            }
        } catch (error) {
            console.error('❌ Error cargando transacciones:', error);
            this.transactions = [];
        }
        
        this.init();
    }

    init() {
        console.log('⚙️ Inicializando aplicación...');
        try {
            this.setupEventListeners();
            this.setCurrentDate();
            this.updateSummary();
            this.updateTransactionsTable();
            console.log('✅ Aplicación inicializada correctamente');
        } catch (error) {
            console.error('❌ Error en init():', error);
        }
    }

    setupEventListeners() {
        console.log('🔗 Configurando event listeners...');
        
        // Formulario de ingresos
        const incomeForm = document.getElementById('income-form');
        console.log('📝 Formulario de ingresos:', incomeForm ? 'ENCONTRADO' : 'NO ENCONTRADO');
        
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('➕ Enviando formulario de ingreso...');
                this.addIncome();
            });
        }

        // Formulario de egresos
        const expenseForm = document.getElementById('expense-form');
        console.log('📝 Formulario de egresos:', expenseForm ? 'ENCONTRADO' : 'NO ENCONTRADO');
        
        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('➖ Enviando formulario de egreso...');
                this.addExpense();
            });
        }
    }

    setCurrentDate() {
        console.log('📅 Configurando fechas actuales...');
        const today = new Date().toISOString().split('T')[0];
        
        const incomeDate = document.getElementById('income-date');
        const expenseDate = document.getElementById('expense-date');
        
        if (incomeDate) {
            incomeDate.value = today;
            console.log('📅 Fecha de ingreso configurada:', today);
        }
        if (expenseDate) {
            expenseDate.value = today;
            console.log('📅 Fecha de egreso configurada:', today);
        }
    }

    addIncome() {
        console.log('💰 Procesando nuevo ingreso...');
        
        try {
            const description = document.getElementById('income-description')?.value || '';
            const amount = parseFloat(document.getElementById('income-amount')?.value || '0');
            const category = document.getElementById('income-category')?.value || '';
            const date = document.getElementById('income-date')?.value || '';
            const method = document.getElementById('income-method')?.value || '';

            console.log('📝 Datos del ingreso:', { description, amount, category, date, method });

            if (!description || !amount || amount <= 0 || !category || !date || !method) {
                alert('Por favor, completa todos los campos correctamente.');
                console.log('❌ Validación fallida - campos incompletos');
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

            console.log('✅ Transacción creada:', transaction);

            this.transactions.push(transaction);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.clearForm('income-form');
            
            console.log('🎉 Ingreso agregado exitosamente');
            alert('Ingreso agregado exitosamente');
            
        } catch (error) {
            console.error('❌ Error agregando ingreso:', error);
            alert('Error agregando ingreso: ' + error.message);
        }
    }

    addExpense() {
        console.log('💸 Procesando nuevo egreso...');
        
        try {
            const description = document.getElementById('expense-description')?.value || '';
            const amount = parseFloat(document.getElementById('expense-amount')?.value || '0');
            const category = document.getElementById('expense-category')?.value || '';
            const date = document.getElementById('expense-date')?.value || '';
            const method = document.getElementById('expense-method')?.value || '';

            console.log('📝 Datos del egreso:', { description, amount, category, date, method });

            if (!description || !amount || amount <= 0 || !category || !date || !method) {
                alert('Por favor, completa todos los campos correctamente.');
                console.log('❌ Validación fallida - campos incompletos');
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

            console.log('✅ Transacción creada:', transaction);

            this.transactions.push(transaction);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.clearForm('expense-form');
            
            console.log('🎉 Egreso agregado exitosamente');
            alert('Egreso agregado exitosamente');
            
        } catch (error) {
            console.error('❌ Error agregando egreso:', error);
            alert('Error agregando egreso: ' + error.message);
        }
    }

    updateSummary() {
        console.log('📊 Actualizando resumen financiero...');
        
        try {
            const income = this.transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = this.transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const balance = income - expenses;

            console.log(`💹 Cálculos: Ingresos=${income}, Egresos=${expenses}, Balance=${balance}`);

            // Buscar elementos en el DOM
            const totalIncomeElement = document.getElementById('total-income');
            const totalExpensesElement = document.getElementById('total-expenses');
            const balanceElement = document.getElementById('balance');

            console.log('🎯 Elementos DOM encontrados:', {
                income: totalIncomeElement ? 'SÍ' : 'NO',
                expenses: totalExpensesElement ? 'SÍ' : 'NO',
                balance: balanceElement ? 'SÍ' : 'NO'
            });

            // Actualizar elementos
            if (totalIncomeElement) {
                totalIncomeElement.textContent = this.formatCurrency(income);
                console.log('✅ Total ingresos actualizado');
            }
            if (totalExpensesElement) {
                totalExpensesElement.textContent = this.formatCurrency(expenses);
                console.log('✅ Total egresos actualizado');
            }
            if (balanceElement) {
                balanceElement.textContent = this.formatCurrency(balance);
                balanceElement.style.color = balance >= 0 ? '#4CAF50' : '#f44336';
                console.log('✅ Balance actualizado');
            }

        } catch (error) {
            console.error('❌ Error actualizando resumen:', error);
        }
    }

    updateTransactionsTable() {
        console.log('📋 Actualizando tabla de transacciones...');
        
        try {
            const tableBody = document.getElementById('transactions-tbody');
            console.log('📊 Tabla tbody encontrada:', tableBody ? 'SÍ' : 'NO');
            console.log('🔢 Número de transacciones:', this.transactions.length);
            
            if (!tableBody) {
                console.error('❌ No se encontró el elemento transactions-tbody');
                return;
            }

            // Limpiar tabla
            tableBody.innerHTML = '';

            // Agregar transacciones
            this.transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach((transaction, index) => {
                    console.log(`➕ Agregando fila ${index + 1}:`, transaction.description);
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${this.formatDate(transaction.date)}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.category}</td>
                        <td class="${transaction.type}" style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </td>
                        <td>${transaction.method}</td>
                        <td>
                            <button onclick="financeManager.deleteTransaction('${transaction.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                Eliminar
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
            console.log('✅ Tabla actualizada con', this.transactions.length, 'transacciones');

        } catch (error) {
            console.error('❌ Error actualizando tabla:', error);
        }
    }

    deleteTransaction(id) {
        console.log('🗑️ Eliminando transacción:', id);
        
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            console.log('✅ Transacción eliminada');
            alert('Transacción eliminada');
        }
    }

    clearForm(formId) {
        console.log('🧹 Limpiando formulario:', formId);
        
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            this.setCurrentDate();
            console.log('✅ Formulario limpiado');
        }
    }

    saveToLocalStorage() {
        console.log('💾 Guardando en localStorage...');
        
        try {
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            console.log('✅ Datos guardados correctamente');
        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    formatCurrency(amount) {
        try {
            return new Intl.NumberFormat('es-PE', {
                style: 'currency',
                currency: 'PEN',
                minimumFractionDigits: 2
            }).format(amount);
        } catch (error) {
            console.error('❌ Error formateando moneda:', error);
            return `S/ ${amount.toFixed(2)}`;
        }
    }

    formatDate(dateString) {
        try {
            return new Date(dateString + 'T00:00:00').toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.error('❌ Error formateando fecha:', error);
            return dateString;
        }
    }
}

// Inicializar cuando el DOM esté listo
let financeManager;

function initApp() {
    console.log('🚀 DOM cargado, inicializando Finance Manager...');
    try {
        financeManager = new FinanceManager();
        console.log('🎉 ¡Finance Manager inicializado exitosamente!');
    } catch (error) {
        console.error('💥 Error crítico inicializando la aplicación:', error);
        alert('Error inicializando la aplicación. Verifica la consola para más detalles.');
    }
}

// Asegurar inicialización
if (document.readyState === 'loading') {
    console.log('⏳ DOM aún cargando, esperando evento...');
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    console.log('✅ DOM ya está listo, inicializando inmediatamente...');
    initApp();
}

console.log('📋 Script cargado completamente');

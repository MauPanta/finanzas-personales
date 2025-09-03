// Versión simplificada del Gestor de Finanzas - Con debug completo
console.log('🔧 Cargando script de finanzas...');

class FinanceManager {
    constructor() {
        console.log('🚀 Construyendo Finance Manager...');
        this.transactions = [];
        this.currentFilter = 'all'; // Inicializar filtro
        this.editingTransactionId = null; // Para controlar modo edición
        
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
            this.updateMonthlyAnalysis(); // Agregar análisis mensual
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

        // Pestañas de filtros de tabla
        const tabButtons = document.querySelectorAll('.tab-btn');
        console.log('📊 Botones de pestañas encontrados:', tabButtons.length);
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filterType = e.target.dataset.tab;
                console.log('🔄 Cambiando filtro de tabla a:', filterType);
                this.switchTableFilter(filterType, e.target);
            });
        });

        // Configurar filtro inicial
        this.currentFilter = 'all';

        // Event listener para meta de ahorro
        const savingsGoalInput = document.getElementById('savings-goal');
        if (savingsGoalInput) {
            savingsGoalInput.addEventListener('input', () => {
                this.updateSavingsGoal();
            });
            console.log('💰 Event listener de meta de ahorro configurado');
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

            // Verificar si estamos editando una transacción existente
            if (this.editingTransactionId) {
                console.log('🔄 Actualizando transacción existente:', this.editingTransactionId);
                
                const existingTransaction = this.transactions.find(t => t.id === this.editingTransactionId);
                if (existingTransaction) {
                    // Actualizar la transacción existente
                    existingTransaction.description = description;
                    existingTransaction.amount = amount;
                    existingTransaction.category = category;
                    existingTransaction.date = date;
                    existingTransaction.method = method;
                    existingTransaction.timestamp = new Date();

                    console.log('✅ Transacción actualizada:', existingTransaction);
                    
                    // Limpiar el modo edición
                    this.editingTransactionId = null;
                    
                    // Restaurar botón original
                    const submitButton = document.querySelector('#income-form button[type="submit"]');
                    const cancelButton = document.getElementById('cancel-edit-income');
                    
                    if (submitButton) {
                        submitButton.innerHTML = '<i class="fas fa-plus"></i> Agregar Ingreso';
                        submitButton.style.background = '#28a745';
                        submitButton.style.color = 'white';
                    }
                    
                    if (cancelButton) {
                        cancelButton.style.display = 'none';
                    }

                    this.saveToLocalStorage();
                    this.updateSummary();
                    this.updateTransactionsTable();
                    this.updateMonthlyAnalysis();
                    this.clearForm('income-form');
                    
                    console.log('🎉 Ingreso actualizado exitosamente');
                    alert('Ingreso actualizado exitosamente');
                    return;
                }
            }

            // Crear nueva transacción
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

            console.log('✅ Nueva transacción creada:', transaction);

            this.transactions.push(transaction);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.updateMonthlyAnalysis();
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

            // Verificar si estamos editando una transacción existente
            if (this.editingTransactionId) {
                console.log('🔄 Actualizando transacción existente:', this.editingTransactionId);
                
                const existingTransaction = this.transactions.find(t => t.id === this.editingTransactionId);
                if (existingTransaction) {
                    // Actualizar la transacción existente
                    existingTransaction.description = description;
                    existingTransaction.amount = amount;
                    existingTransaction.category = category;
                    existingTransaction.date = date;
                    existingTransaction.method = method;
                    existingTransaction.timestamp = new Date();

                    console.log('✅ Transacción actualizada:', existingTransaction);
                    
                    // Limpiar el modo edición
                    this.editingTransactionId = null;
                    
                    // Restaurar botón original
                    const submitButton = document.querySelector('#expense-form button[type="submit"]');
                    const cancelButton = document.getElementById('cancel-edit-expense');
                    
                    if (submitButton) {
                        submitButton.innerHTML = '<i class="fas fa-minus"></i> Agregar Egreso';
                        submitButton.style.background = '#dc3545';
                        submitButton.style.color = 'white';
                    }
                    
                    if (cancelButton) {
                        cancelButton.style.display = 'none';
                    }

                    this.saveToLocalStorage();
                    this.updateSummary();
                    this.updateTransactionsTable();
                    this.updateMonthlyAnalysis();
                    this.clearForm('expense-form');
                    
                    console.log('🎉 Egreso actualizado exitosamente');
                    alert('Egreso actualizado exitosamente');
                    return;
                }
            }

            // Crear nueva transacción
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

            console.log('✅ Nueva transacción creada:', transaction);

            this.transactions.push(transaction);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.updateMonthlyAnalysis();
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
                        <td class="${transaction.type}" style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                        </td>
                        <td>${transaction.method}</td>
                        <td style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </td>
                        <td>
                            <button onclick="financeManager.editTransaction('${transaction.id}')" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px;">
                                ✏️ Editar
                            </button>
                            <button onclick="financeManager.deleteTransaction('${transaction.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">
                                🗑️ Eliminar
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

    switchTableFilter(filterType, buttonElement) {
        console.log('🔄 Cambiando filtro de tabla a:', filterType);
        
        try {
            // Actualizar botones activos
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            buttonElement.classList.add('active');

            // Guardar filtro actual
            this.currentFilter = filterType;

            // Actualizar tabla con filtro
            this.updateTransactionsTableWithFilter(filterType);

        } catch (error) {
            console.error('❌ Error cambiando filtro:', error);
        }
    }

    updateTransactionsTableWithFilter(filterType = 'all') {
        console.log('📋 Actualizando tabla con filtro:', filterType);
        
        try {
            const tableBody = document.getElementById('transactions-tbody');
            if (!tableBody) {
                console.error('❌ No se encontró el elemento transactions-tbody');
                return;
            }

            // Limpiar tabla
            tableBody.innerHTML = '';

            // Filtrar transacciones según el tipo
            let filteredTransactions = this.transactions;
            
            switch (filterType) {
                case 'income':
                    filteredTransactions = this.transactions.filter(t => t.type === 'income');
                    break;
                case 'expenses':
                    filteredTransactions = this.transactions.filter(t => t.type === 'expense');
                    break;
                case 'all':
                default:
                    filteredTransactions = this.transactions;
                    break;
            }

            console.log(`🔍 Mostrando ${filteredTransactions.length} de ${this.transactions.length} transacciones`);

            // Agregar transacciones filtradas
            filteredTransactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .forEach((transaction, index) => {
                    console.log(`➕ Agregando fila filtrada ${index + 1}:`, transaction.description);
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${this.formatDate(transaction.date)}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.category}</td>
                        <td class="${transaction.type}" style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${transaction.type === 'income' ? 'Ingreso' : 'Egreso'}
                        </td>
                        <td>${transaction.method}</td>
                        <td style="color: ${transaction.type === 'income' ? '#4CAF50' : '#f44336'}; font-weight: bold;">
                            ${transaction.type === 'income' ? '+' : '-'}${this.formatCurrency(transaction.amount)}
                        </td>
                        <td>
                            <button onclick="financeManager.editTransaction('${transaction.id}')" style="background: #28a745; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-right: 5px;">
                                ✏️ Editar
                            </button>
                            <button onclick="financeManager.deleteTransaction('${transaction.id}')" style="background: #dc3545; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                                🗑️ Eliminar
                            </button>
                        </td>
                    `;
                    tableBody.appendChild(row);
                });
                
            console.log('✅ Tabla filtrada actualizada');

        } catch (error) {
            console.error('❌ Error actualizando tabla filtrada:', error);
        }
    }

    deleteTransaction(id) {
        console.log('🗑️ Eliminando transacción:', id);
        
        if (confirm('¿Estás seguro de que quieres eliminar esta transacción?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToLocalStorage();
            this.updateSummary();
            this.updateTransactionsTable();
            this.updateMonthlyAnalysis();
            console.log('✅ Transacción eliminada');
            alert('Transacción eliminada');
        }
    }

    editTransaction(id) {
        console.log('✏️ Editando transacción:', id);
        
        try {
            // Buscar la transacción
            const transaction = this.transactions.find(t => t.id === id);
            if (!transaction) {
                console.error('❌ Transacción no encontrada');
                alert('Error: Transacción no encontrada');
                return;
            }

            console.log('📝 Transacción encontrada:', transaction);

            // Determinar qué formulario usar
            const isIncome = transaction.type === 'income';
            const formPrefix = isIncome ? 'income' : 'expense';

            // Llenar el formulario con los datos actuales
            document.getElementById(`${formPrefix}-description`).value = transaction.description;
            document.getElementById(`${formPrefix}-amount`).value = transaction.amount;
            document.getElementById(`${formPrefix}-category`).value = transaction.category;
            document.getElementById(`${formPrefix}-date`).value = transaction.date;
            document.getElementById(`${formPrefix}-method`).value = transaction.method;

            // Guardar el ID de la transacción que se está editando
            this.editingTransactionId = id;

            // Cambiar el texto del botón para indicar que está editando
            const submitButton = document.querySelector(`#${formPrefix}-form button[type="submit"]`);
            const cancelButton = document.getElementById(`cancel-edit-${formPrefix}`);
            
            if (submitButton) {
                submitButton.innerHTML = `<i class="fas fa-save"></i> Actualizar ${isIncome ? 'Ingreso' : 'Egreso'}`;
                submitButton.style.background = '#ffc107';
                submitButton.style.color = '#000';
            }
            
            if (cancelButton) {
                cancelButton.style.display = 'inline-block';
            }

            // Hacer scroll al formulario
            document.getElementById(`${formPrefix}-form`).scrollIntoView({ behavior: 'smooth' });

            console.log('✅ Formulario preparado para edición');
            alert(`Editando ${isIncome ? 'ingreso' : 'egreso'}. Modifica los campos y guarda los cambios.`);

        } catch (error) {
            console.error('❌ Error editando transacción:', error);
            alert('Error al editar la transacción: ' + error.message);
        }
    }

    cancelEdit() {
        console.log('❌ Cancelando edición...');
        
        if (this.editingTransactionId) {
            // Determinar qué formulario estaba siendo editado
            const transaction = this.transactions.find(t => t.id === this.editingTransactionId);
            if (transaction) {
                const isIncome = transaction.type === 'income';
                const formId = isIncome ? 'income-form' : 'expense-form';
                
                // Restaurar botón original
                const submitButton = document.querySelector(`#${formId} button[type="submit"]`);
                const cancelButton = document.getElementById(`cancel-edit-${isIncome ? 'income' : 'expense'}`);
                
                if (submitButton) {
                    submitButton.innerHTML = isIncome ? 
                        '<i class="fas fa-plus"></i> Agregar Ingreso' : 
                        '<i class="fas fa-minus"></i> Agregar Egreso';
                    submitButton.style.background = isIncome ? '#28a745' : '#dc3545';
                    submitButton.style.color = 'white';
                }
                
                if (cancelButton) {
                    cancelButton.style.display = 'none';
                }
                
                // Limpiar formulario
                this.clearForm(formId);
            }
            
            // Limpiar modo edición
            this.editingTransactionId = null;
            console.log('✅ Edición cancelada');
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

    updateMonthlyAnalysis() {
        console.log('📊 Actualizando análisis mensual...');
        
        try {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11
            
            console.log(`📅 Analizando mes actual: ${currentMonth}/${currentYear}`);

            // Filtrar transacciones del mes actual
            const currentMonthTransactions = this.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === currentYear && 
                       transactionDate.getMonth() + 1 === currentMonth;
            });

            console.log(`🔍 Transacciones del mes actual: ${currentMonthTransactions.length}`);

            // Calcular totales del mes
            const monthIncome = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthExpenses = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthBalance = monthIncome - monthExpenses;

            // Actualizar elementos del DOM
            const monthIncomeElement = document.getElementById('month-income');
            const monthExpensesElement = document.getElementById('month-expenses');
            const monthBalanceElement = document.getElementById('month-balance');

            if (monthIncomeElement) {
                monthIncomeElement.textContent = this.formatCurrency(monthIncome);
                console.log('✅ Ingresos del mes actualizados:', this.formatCurrency(monthIncome));
            }

            if (monthExpensesElement) {
                monthExpensesElement.textContent = this.formatCurrency(monthExpenses);
                console.log('✅ Egresos del mes actualizados:', this.formatCurrency(monthExpenses));
            }

            if (monthBalanceElement) {
                monthBalanceElement.textContent = this.formatCurrency(monthBalance);
                monthBalanceElement.style.color = monthBalance >= 0 ? '#28a745' : '#dc3545';
                console.log('✅ Balance del mes actualizado:', this.formatCurrency(monthBalance));
            }

            // Calcular categoría más gastada
            this.updateTopExpenseCategory(currentMonthTransactions);

            // Calcular promedio diario
            this.updateDailyAverage(monthExpenses, currentDate);

            console.log('✅ Análisis mensual actualizado correctamente');

        } catch (error) {
            console.error('❌ Error actualizando análisis mensual:', error);
        }
    }

    updateTopExpenseCategory(transactions) {
        console.log('🏷️ Calculando categoría más gastada...');
        
        try {
            const expenses = transactions.filter(t => t.type === 'expense');
            
            if (expenses.length === 0) {
                const topCategoryElement = document.getElementById('top-expense-category');
                if (topCategoryElement) {
                    topCategoryElement.textContent = 'N/A';
                }
                console.log('📊 No hay gastos este mes');
                return;
            }

            // Agrupar por categoría
            const categoryTotals = {};
            expenses.forEach(expense => {
                if (!categoryTotals[expense.category]) {
                    categoryTotals[expense.category] = 0;
                }
                categoryTotals[expense.category] += expense.amount;
            });

            // Encontrar la categoría con mayor gasto
            let topCategory = '';
            let maxAmount = 0;

            Object.entries(categoryTotals).forEach(([category, amount]) => {
                if (amount > maxAmount) {
                    maxAmount = amount;
                    topCategory = category;
                }
            });

            // Actualizar DOM
            const topCategoryElement = document.getElementById('top-expense-category');
            if (topCategoryElement && topCategory) {
                const displayText = `${this.getCategoryDisplayName(topCategory)} (${this.formatCurrency(maxAmount)})`;
                topCategoryElement.textContent = displayText;
                console.log('✅ Categoría más gastada:', displayText);
            }

        } catch (error) {
            console.error('❌ Error calculando categoría más gastada:', error);
        }
    }

    updateSavingsGoal() {
        console.log('💰 Actualizando meta de ahorro...');
        
        try {
            const savingsGoalInput = document.getElementById('savings-goal');
            const savingsProgressElement = document.getElementById('savings-progress');
            const savingsStatusElement = document.getElementById('savings-status');

            if (!savingsGoalInput || !savingsProgressElement || !savingsStatusElement) {
                console.log('⚠️ Elementos de meta de ahorro no encontrados');
                return;
            }

            const monthlyGoal = parseFloat(savingsGoalInput.value) || 0;
            
            // Calcular balance del mes actual
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1;
            
            const currentMonthTransactions = this.transactions.filter(t => {
                const transactionDate = new Date(t.date);
                return transactionDate.getFullYear() === currentYear && 
                       transactionDate.getMonth() + 1 === currentMonth;
            });

            const monthIncome = currentMonthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthExpenses = currentMonthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            const monthlyBalance = monthIncome - monthExpenses;
            
            if (monthlyGoal > 0) {
                const progressPercentage = Math.min((monthlyBalance / monthlyGoal) * 100, 100);
                const progressColor = progressPercentage >= 100 ? '#28a745' : 
                                    progressPercentage >= 50 ? '#ffc107' : '#dc3545';

                savingsProgressElement.style.width = `${Math.max(progressPercentage, 0)}%`;
                savingsProgressElement.style.backgroundColor = progressColor;
                
                savingsStatusElement.textContent = `${Math.round(progressPercentage)}% de la meta (${this.formatCurrency(monthlyBalance)} / ${this.formatCurrency(monthlyGoal)})`;
                savingsStatusElement.style.color = progressColor;

                console.log(`💰 Meta de ahorro: ${Math.round(progressPercentage)}% completado`);
            } else {
                savingsProgressElement.style.width = '0%';
                savingsStatusElement.textContent = 'Define una meta mensual';
                savingsStatusElement.style.color = '#6c757d';
                console.log('💰 No hay meta definida');
            }

            // Guardar meta en localStorage
            localStorage.setItem('savingsGoal', monthlyGoal.toString());

        } catch (error) {
            console.error('❌ Error actualizando meta de ahorro:', error);
        }
    }

    updateDailyAverage(monthExpenses, currentDate) {
        console.log('📈 Calculando promedio diario...');
        
        try {
            const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
            const currentDay = currentDate.getDate();
            
            // Usar los días transcurridos del mes, no el total de días
            const dailyAverage = monthExpenses / currentDay;

            const dailyAverageElement = document.getElementById('daily-average');
            if (dailyAverageElement) {
                dailyAverageElement.textContent = this.formatCurrency(dailyAverage);
                console.log(`✅ Promedio diario: ${this.formatCurrency(dailyAverage)} (${monthExpenses} / ${currentDay} días)`);
            }

        } catch (error) {
            console.error('❌ Error calculando promedio diario:', error);
        }
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            'alimentacion': '🍽️ Alimentación',
            'restaurante': '🍴 Restaurante',
            'transporte': '🚗 Transporte',
            'vivienda': '🏠 Vivienda',
            'alquiler': '🏘️ Alquiler',
            'salud': '🏥 Salud',
            'quimica': '💊 Químico',
            'tecnica': '🔧 Técnico',
            'prestamo': '💳 Préstamo',
            'entretenimiento': '🎬 Entretenimiento',
            'educacion': '📚 Educación',
            'ropa': '👕 Ropa',
            'servicios': '⚡ Servicios',
            'luz': '💡 Luz',
            'agua': '💧 Agua',
            'internet': '📶 Internet',
            'otro': '📦 Otro'
        };

        return categoryNames[category] || category;
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

// Parche para Pagos Quincenales
// Agregar estas funciones a la clase FinanceManager

// 1. Actualizar el método calculateNextDue existente
function calculateNextDue(frequency, fromDate = null) {
    const baseDate = fromDate || new Date();
    const nextDate = new Date(baseDate);
    
    switch(frequency) {
        case 'semanal':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'quincenal':
            // Por defecto usar método inteligente
            return this.calculateBiweeklyPayment(frequency, fromDate, 'smart');
        case 'mensual':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'anual':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }
    return nextDate.toISOString().split('T')[0];
}

// 2. Nueva función para pagos quincenales
function calculateBiweeklyPayment(frequency, fromDate = null, type = 'smart') {
    if (frequency !== 'quincenal') {
        return this.calculateNextDue(frequency, fromDate);
    }

    const baseDate = fromDate || new Date();
    const nextDate = new Date(baseDate);
    
    if (type === 'smart') {
        // Lógica inteligente: días 1 y 15 del mes
        const currentDay = baseDate.getDate();
        
        if (currentDay < 15) {
            nextDate.setDate(15);
        } else {
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(1);
        }
    } else {
        // Método exacto: cada 15 días
        nextDate.setDate(nextDate.getDate() + 15);
    }
    
    return nextDate.toISOString().split('T')[0];
}

// 3. Función para formatear frecuencias
function formatFrequency(frequency) {
    const frequencies = {
        semanal: '📅 Semanal (cada 7 días)',
        quincenal: '📋 Quincenal (cada 15 días)', 
        mensual: '🗓️ Mensual (cada 30 días)',
        anual: '📆 Anual (cada 365 días)'
    };
    return frequencies[frequency] || frequency;
}

// 4. Event Listener para mostrar configuración quincenal
// Agregar dentro de setupEventListeners()
document.getElementById('recurring-frequency').addEventListener('change', function(e) {
    const biweeklyConfig = document.getElementById('biweekly-config');
    if (e.target.value === 'quincenal') {
        biweeklyConfig.style.display = 'block';
    } else {
        biweeklyConfig.style.display = 'none';
    }
});

// 5. Modificar addRecurringPayment para soportar tipo quincenal
function addRecurringPayment() {
    const description = document.getElementById('recurring-description').value;
    const amount = parseFloat(document.getElementById('recurring-amount').value);
    const frequency = document.getElementById('recurring-frequency').value;
    
    // Obtener tipo de pago quincenal
    let biweeklyType = 'smart';
    if (frequency === 'quincenal') {
        const selectedType = document.querySelector('input[name="biweekly-type"]:checked');
        biweeklyType = selectedType ? selectedType.value : 'smart';
    }

    const payment = {
        id: Date.now().toString(),
        description,
        amount,
        frequency,
        biweeklyType: frequency === 'quincenal' ? biweeklyType : null,
        nextDue: frequency === 'quincenal' ? 
                this.calculateBiweeklyPayment(frequency, null, biweeklyType) : 
                this.calculateNextDue(frequency)
    };

    this.recurringPayments.push(payment);
    this.saveToLocalStorage();
    this.displayRecurringPayments();
    this.clearForm('recurring-payment-form');
    this.showNotification('Pago quincenal agregado exitosamente', 'success');
}

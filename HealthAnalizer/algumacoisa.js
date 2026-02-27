/**
 * APP.JS - Lógica de recepção e atualização de dados
 */

// Configurações
const SOCKET_URL = 'http://localhost:3000';
const MAX_HISTORY = 10;

// Elementos do DOM
const elements = {
    temp: document.getElementById('display-temp'),
    pres: document.getElementById('display-pres'),
    oxig: document.getElementById('display-oxig'),
    tableBody: document.getElementById('history-table-body'),
    statusText: document.getElementById('status-text'),
    statusDot: document.getElementById('status-dot')
};

// Inicializa Conexão Socket.io
const socket = io(SOCKET_URL);

// Evento: Conexão Estabelecida
socket.on('connect', () => {
    elements.statusText.innerText = "Conectado ao Broker";
    elements.statusDot.classList.replace('bg-red-500', 'bg-green-500');
    console.log("Conectado ao servidor WebSocket com sucesso.");
});

// Evento: Desconexão
socket.on('disconnect', () => {
    elements.statusText.innerText = "Desconectado";
    elements.statusDot.classList.replace('bg-green-500', 'bg-red-500');
});

// Evento: Recebimento de Dados do Kafka
socket.on('kafka-data', (payload) => {
    // 1. Validar se os dados existem no objeto recebido
    const { temperatura, pressao, oxigenacao } = payload;

    if (temperatura !== undefined && pressao !== undefined && oxigenacao !== undefined) {
        updateUI(payload);
        addToHistory(payload);
    } else {
        console.warn("Dados incompletos recebidos do Kafka:", payload);
    }
});

/**
 * Atualiza os cards principais
 */
function updateUI(data) {
    elements.temp.innerText = data.temperatura;
    elements.pres.innerText = data.pressao;
    elements.oxig.innerText = data.oxigenacao;
}

/**
 * Adiciona uma nova linha na tabela de histórico
 */
function addToHistory(data) {
    const time = new Date().toLocaleTimeString();
    
    const row = document.createElement('tr');
    row.className = 'border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors row-new';
    
    row.innerHTML = `
        <td class="px-6 py-4 text-slate-500">${time}</td>
        <td class="px-6 py-4 text-orange-400 font-bold">${data.temperatura}°C</td>
        <td class="px-6 py-4 text-cyan-400 font-bold">${data.pressao} atm</td>
        <td class="px-6 py-4 text-emerald-400 font-bold">${data.oxigenacao}%</td>
    `;

    // Insere no topo
    elements.tableBody.prepend(row);

    // Remove o mais antigo se passar do limite
    if (elements.tableBody.children.length > MAX_HISTORY) {
        elements.tableBody.removeChild(elements.tableBody.lastChild);
    }
}
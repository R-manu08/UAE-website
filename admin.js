// Admin Portal Logic - UAE Business Hub

const ADMIN_PASSWORD = 'admin123'; // Simple demo password

// ===== AUTHENTICATION =====
const loginForm = document.getElementById('loginForm');
const loginOverlay = document.getElementById('loginOverlay');
const adminContainer = document.getElementById('adminContainer');
const loginError = document.getElementById('loginError');

// Check if already logged in (session storage)
if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    showDashboard();
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordInput = document.getElementById('password').value;

        if (passwordInput === ADMIN_PASSWORD) {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            showDashboard();
        } else {
            loginError.style.display = 'block';
            document.getElementById('password').value = '';
        }
    });
}

function showDashboard() {
    loginOverlay.style.display = 'none';
    adminContainer.style.display = 'block';
    renderLeads();
    updateStats();
}

function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    location.reload();
}

// ===== DATA HANDLING =====
function getLeads() {
    return JSON.parse(localStorage.getItem('uae_leads') || '[]');
}

function renderLeads(filterTerm = '', typeFilter = 'all') {
    let leads = getLeads().reverse(); // Show newest first
    const tableBody = document.getElementById('leadsTableBody');
    const emptyState = document.getElementById('emptyState');

    // Apply Filters
    if (typeFilter !== 'all') {
        leads = leads.filter(l => l.type === typeFilter);
    }

    if (filterTerm) {
        const term = filterTerm.toLowerCase();
        leads = leads.filter(l =>
            (l.name && l.name.toLowerCase().includes(term)) ||
            (l.email && l.email.toLowerCase().includes(term)) ||
            (l.phone && l.phone.toLowerCase().includes(term)) ||
            (l.jurisdiction && l.jurisdiction.toLowerCase().includes(term))
        );
    }

    if (leads.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = leads.map(lead => {
        const date = new Date(lead.date).toLocaleDateString() + ' ' + new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let details = '';
        let contact = `<strong>${lead.name || 'N/A'}</strong><br>${lead.email || ''}<br>${lead.phone || lead.tel || ''}`;

        if (lead.type === 'quote') {
            details = `<strong>${lead.jurisdiction}</strong><br>${lead.activity}<br>${lead.visaCount} Visas<br>Cost: ${lead.totalCost}`;
        } else {
            details = `<em>Inquiry for: ${lead.service || lead.select || 'N/A'}</em><br>${lead.message || lead.textarea || ''}`;
        }

        const statusClass = `status-${lead.status || 'new'}`;

        return `
            <tr>
                <td>${date}</td>
                <td><span class="badge-type badge-${lead.type}">${lead.type.toUpperCase()}</span></td>
                <td><div style="font-size: 0.875rem;">${details}</div></td>
                <td><div style="font-size: 0.875rem;">${contact}</div></td>
                <td>
                    <select class="status-select ${statusClass}" onchange="updateStatus(${lead.id}, this.value)">
                        <option value="new" ${lead.status === 'new' ? 'selected' : ''}>New</option>
                        <option value="contacted" ${lead.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                        <option value="done" ${lead.status === 'done' ? 'selected' : ''}>Done</option>
                    </select>
                </td>
                <td>
                    <button class="btn-delete" onclick="deleteLead(${lead.id})" title="Delete lead">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function updateStatus(id, newStatus) {
    let leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index !== -1) {
        leads[index].status = newStatus;
        localStorage.setItem('uae_leads', JSON.stringify(leads));
        renderLeads(document.getElementById('searchInput')?.value, document.getElementById('filterType')?.value);
    }
}

function updateStats() {
    const leads = getLeads();
    const quotes = leads.filter(l => l.type === 'quote').length;
    const inquiries = leads.filter(l => l.type === 'contact').length;

    document.getElementById('totalLeads').textContent = leads.length;
    document.getElementById('totalQuotes').textContent = quotes;
    document.getElementById('totalInquiries').textContent = inquiries;
}

function deleteLead(id) {
    if (confirm('Are you sure you want to delete this application?')) {
        let leads = getLeads();
        leads = leads.filter(l => l.id !== id);
        localStorage.setItem('uae_leads', JSON.stringify(leads));
        renderLeads(document.getElementById('searchInput')?.value, document.getElementById('filterType')?.value);
        updateStats();
    }
}

// ===== SEARCH & FILTER UI =====
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderLeads(e.target.value, filterType.value);
        });
    }

    if (filterType) {
        filterType.addEventListener('change', (e) => {
            renderLeads(searchInput.value, e.target.value);
        });
    }
});

function exportData() {
    const leads = getLeads();
    if (leads.length === 0) return alert('No data to export');

    // Simple CSV conversion
    const headers = ['Date', 'Type', 'Status', 'Name', 'Email', 'Phone', 'Jurisdiction/Service', 'Details', 'Total Cost'];
    const rows = leads.map(l => [
        new Date(l.date).toLocaleString(),
        l.type,
        l.status || 'new',
        l.name || 'N/A',
        l.email || '',
        l.phone || l.tel || '',
        l.jurisdiction || l.service || l.select || '',
        (l.activity || l.message || l.textarea || '').replace(/,/g, ';').replace(/\n/g, ' '),
        l.totalCost || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.map(h => `"${h}"`).join(",") + "\n"
        + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `uae_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

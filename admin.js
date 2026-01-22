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

function renderLeads() {
    const leads = getLeads().reverse(); // Show newest first
    const tableBody = document.getElementById('leadsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (leads.length === 0) {
        tableBody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tableBody.innerHTML = leads.map(lead => {
        const date = new Date(lead.date).toLocaleDateString() + ' ' + new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let details = '';
        let contact = '';

        if (lead.type === 'quote') {
            details = `<strong>${lead.jurisdiction}</strong><br>${lead.activity}<br>${lead.visaCount} Visas<br>${lead.totalCost}`;
            contact = `<span style="color: #64748b;">Anonymous Quote</span>`;
        } else {
            details = `<em>Inquiry about: ${lead.select || 'N/A'}</em><br>${lead.textarea || ''}`;
            contact = `<strong>${lead.text || 'N/A'}</strong><br>${lead.email || ''}<br>${lead.tel || ''}`;
        }

        return `
            <tr>
                <td>${date}</td>
                <td><span class="badge-type badge-${lead.type}">${lead.type.toUpperCase()}</span></td>
                <td><div style="font-size: 0.875rem;">${details}</div></td>
                <td><div style="font-size: 0.875rem;">${contact}</div></td>
                <td>
                    <button class="btn-delete" onclick="deleteLead(${lead.id})" title="Delete lead">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
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
        renderLeads();
        updateStats();
    }
}

function exportData() {
    const leads = getLeads();
    if (leads.length === 0) return alert('No data to export');

    // Simple CSV conversion
    const headers = ['Date', 'Type', 'Jurisdiction/Service', 'Details', 'Name', 'Email', 'Phone', 'Total Cost'];
    const rows = leads.map(l => [
        new Date(l.date).toLocaleString(),
        l.type,
        l.jurisdiction || l.select || '',
        (l.activity || l.textarea || '').replace(/,/g, ';'), // Replace commas to avoid CSV break
        l.text || 'Anonymous',
        l.email || '',
        l.tel || '',
        l.totalCost || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(",") + "\n"
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "uae_business_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

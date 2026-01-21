// UAE Business Setup - Interactive Features

// ===== GLOBAL STATE =====
let calculatorState = {
    currentStep: 1,
    jurisdiction: '',
    activity: '',
    visaCount: 2,
    additionalServices: {
        banking: false,
        office: false,
        accounting: false
    },
    pricing: {
        mainland: 24999,
        freezone: 15999,
        offshore: 8999,
        visaCost: 4000,
        banking: 2500,
        office: 1500,
        accounting: 2000
    }
};

// ===== NAVIGATION =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== CALCULATOR FUNCTIONS =====
function scrollToCalculator() {
    const calculator = document.getElementById('calculator');
    if (calculator) {
        calculator.scrollIntoView({ behavior: 'smooth' });
    }
}

function selectJurisdiction(type) {
    calculatorState.jurisdiction = type;
    nextStep();
}

function selectActivity(type) {
    calculatorState.activity = type;
    nextStep();
}

function changeVisaCount(delta) {
    const visaInput = document.getElementById('visaCount');
    let currentCount = parseInt(visaInput.value);
    currentCount += delta;

    if (currentCount < 0) currentCount = 0;
    if (currentCount > 50) currentCount = 50;

    visaInput.value = currentCount;
    calculatorState.visaCount = currentCount;
}

function nextStep() {
    if (calculatorState.currentStep < 4) {
        // Hide current step
        document.getElementById(`step${calculatorState.currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.remove('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.add('completed');

        // Show next step
        calculatorState.currentStep++;
        document.getElementById(`step${calculatorState.currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.add('active');

        // Update navigation buttons
        updateNavigationButtons();

        // If final step, calculate quote
        if (calculatorState.currentStep === 4) {
            calculateQuote();
        }
    }
}

function previousStep() {
    if (calculatorState.currentStep > 1) {
        // Hide current step
        document.getElementById(`step${calculatorState.currentStep}`).classList.remove('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.remove('active');

        // Show previous step
        calculatorState.currentStep--;
        document.getElementById(`step${calculatorState.currentStep}`).classList.add('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.add('active');
        document.querySelector(`[data-step="${calculatorState.currentStep}"]`).classList.remove('completed');

        // Update navigation buttons
        updateNavigationButtons();
    }
}

function updateNavigationButtons() {
    const backBtn = document.getElementById('backBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (calculatorState.currentStep === 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'inline-block';
    }

    if (calculatorState.currentStep === 4) {
        nextBtn.style.display = 'none';
    } else if (calculatorState.currentStep === 3) {
        nextBtn.style.display = 'inline-block';
    }
}

function calculateQuote() {
    // Get base license fee
    let licenseFee = 0;
    switch (calculatorState.jurisdiction) {
        case 'mainland':
            licenseFee = calculatorState.pricing.mainland;
            break;
        case 'freezone':
            licenseFee = calculatorState.pricing.freezone;
            break;
        case 'offshore':
            licenseFee = calculatorState.pricing.offshore;
            break;
    }

    // Calculate visa costs
    const visaCost = calculatorState.visaCount * calculatorState.pricing.visaCost;

    // Calculate additional services
    let additionalCost = 0;
    const bankingCheckbox = document.getElementById('banking');
    const officeCheckbox = document.getElementById('office');
    const accountingCheckbox = document.getElementById('accounting');

    if (bankingCheckbox && bankingCheckbox.checked) {
        additionalCost += calculatorState.pricing.banking;
    }
    if (officeCheckbox && officeCheckbox.checked) {
        additionalCost += calculatorState.pricing.office;
    }
    if (accountingCheckbox && accountingCheckbox.checked) {
        additionalCost += calculatorState.pricing.accounting;
    }

    // Calculate total
    const total = licenseFee + visaCost + additionalCost;

    // Update UI
    document.getElementById('licenseFee').textContent = `AED ${licenseFee.toLocaleString()}`;
    document.getElementById('visaCountDisplay').textContent = calculatorState.visaCount;
    document.getElementById('visaCost').textContent = `AED ${visaCost.toLocaleString()}`;
    document.getElementById('additionalCost').textContent = `AED ${additionalCost.toLocaleString()}`;
    document.getElementById('totalCost').textContent = `AED ${total.toLocaleString()}`;
}

function resetCalculator() {
    calculatorState.currentStep = 1;
    calculatorState.jurisdiction = '';
    calculatorState.activity = '';
    calculatorState.visaCount = 2;

    // Reset UI
    document.querySelectorAll('.calc-step').forEach(step => step.classList.remove('active'));
    document.querySelectorAll('.progress-step').forEach(step => {
        step.classList.remove('active', 'completed');
    });

    document.getElementById('step1').classList.add('active');
    document.querySelector('[data-step="1"]').classList.add('active');
    document.getElementById('visaCount').value = 2;

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);

    updateNavigationButtons();
}

function submitQuote() {
    // Collect form data
    const quoteData = {
        jurisdiction: calculatorState.jurisdiction,
        activity: calculatorState.activity,
        visaCount: calculatorState.visaCount,
        additionalServices: {
            banking: document.getElementById('banking')?.checked || false,
            office: document.getElementById('office')?.checked || false,
            accounting: document.getElementById('accounting')?.checked || false
        },
        totalCost: document.getElementById('totalCost').textContent
    };

    // Show modal or redirect to contact form
    alert('Quote submitted! Our team will contact you shortly.');

    // In production, you would send this to your backend/CRM
    console.log('Quote Data:', quoteData);

    // Optionally redirect to WhatsApp
    const message = `Hi! I'm interested in setting up a ${calculatorState.jurisdiction} company. My estimated quote is ${quoteData.totalCost}. Can you help me get started?`;
    const whatsappUrl = `https://wa.me/971XXXXXXXXX?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        // In production, send to backend
        console.log('Contact Form Data:', data);

        // Show success message
        alert('Thank you for your message! We will get back to you within 24 hours.');
        contactForm.reset();
    });
}

// ===== CHAT WIDGET =====
function toggleChat() {
    const chatBody = document.getElementById('chatBody');
    const chatToggle = document.getElementById('chatToggle');

    if (chatBody.style.display === 'none') {
        chatBody.style.display = 'block';
        chatToggle.classList.remove('fa-chevron-down');
        chatToggle.classList.add('fa-chevron-up');
    } else {
        chatBody.style.display = 'none';
        chatToggle.classList.remove('fa-chevron-up');
        chatToggle.classList.add('fa-chevron-down');
    }
}

// ===== ACTIVITY SEARCH =====
const activitySearch = document.getElementById('activitySearch');
if (activitySearch) {
    activitySearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const activityButtons = document.querySelectorAll('.activity-btn');

        activityButtons.forEach(btn => {
            const text = btn.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                btn.style.display = 'flex';
            } else {
                btn.style.display = 'none';
            }
        });
    });
}

// ===== SCROLL EFFECTS =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for fade-in animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.solution-card, .service-card, .pricing-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== HERO SEARCH FUNCTIONALITY =====
const heroSearch = document.getElementById('heroSearch');
if (heroSearch) {
    heroSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            scrollToCalculator();
        }
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    updateNavigationButtons();

    // Add smooth hover effects to cards
    const cards = document.querySelectorAll('.solution-card, .service-card, .jurisdiction-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-10px)';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });
});

// ===== UTILITY FUNCTIONS =====
function formatCurrency(amount) {
    return `AED ${amount.toLocaleString()}`;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\+\-\(\)]+$/;
    return re.test(phone);
}

// Export functions for use in HTML
window.scrollToCalculator = scrollToCalculator;
window.selectJurisdiction = selectJurisdiction;
window.selectActivity = selectActivity;
window.changeVisaCount = changeVisaCount;
window.nextStep = nextStep;
window.previousStep = previousStep;
window.resetCalculator = resetCalculator;
window.submitQuote = submitQuote;
window.toggleChat = toggleChat;

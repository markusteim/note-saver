import { awsConfig } from './config.js';

let currentUser = null;
let currentProjects = [];

// UI Elements
const elements = {
    loginScreen: document.getElementById('loginScreen'),
    mainScreen: document.getElementById('mainScreen'),
    emailInput: document.getElementById('emailInput'),
    passwordInput: document.getElementById('passwordInput'),
    loginButton: document.getElementById('loginButton'),
    logoutButton: document.getElementById('logoutButton'),
    projectsList: document.getElementById('projectsList'),
    newProjectInput: document.getElementById('newProjectInput'),
    createProjectButton: document.getElementById('createProjectButton'),
    userNotesEmail: document.getElementById('userNotesEmail')
};

// Event Listeners
document.addEventListener('DOMContentLoaded', initializeApp);
elements.loginButton?.addEventListener('click', handleLogin);
elements.logoutButton?.addEventListener('click', handleLogout);
elements.createProjectButton?.addEventListener('click', handleCreateProject);

async function initializeApp() {
    try {
        const user = await checkAuthState();
        if (user) {
            currentUser = user;
            showMainScreen();
            loadProjects();
        } else {
            showLoginScreen();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showLoginScreen();
    }
}

async function handleLogin() {
    const email = elements.emailInput.value;
    const password = elements.passwordInput.value;
    
    try {
        const response = await fetch(`${awsConfig.apiEndpoint}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const user = await response.json();
        currentUser = user;
        showMainScreen();
        loadProjects();
    } catch (error) {
        console.error('Login error:', error);
        showError('Login failed. Please try again.');
    }
}

async function loadProjects() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${awsConfig.apiEndpoint}/projects/${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to load projects');
        
        const projects = await response.json();
        currentProjects = projects;
        renderProjects();
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

function renderProjects() {
    const projectsList = document.getElementById('projectsList');
    projectsList.innerHTML = '';
    
    currentProjects.forEach(project => {
        const projectElement = createProjectElement(project);
        projectsList.appendChild(projectElement);
    });
}

function createProjectElement(project) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-4 mb-4';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-3';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold';
    title.textContent = project.name;
    
    header.appendChild(title);
    div.appendChild(header);
    
    if (project.notes) {
        const notesList = document.createElement('div');
        notesList.className = 'space-y-2';
        
        Object.values(project.notes).forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'bg-gray-50 p-3 rounded text-sm';
            noteElement.textContent = note.content;
            notesList.appendChild(noteElement);
        });
        
        div.appendChild(notesList);
    }
    
    return div;
}

function showMainScreen() {
    elements.loginScreen.classList.add('hidden');
    elements.mainScreen.classList.remove('hidden');
    elements.userNotesEmail.textContent = `${currentUser.id}@${awsConfig.emailDomain}`;
}

function showLoginScreen() {
    elements.loginScreen.classList.remove('hidden');
    elements.mainScreen.classList.add('hidden');
}

function showError(message) {
    // Implement error display logic
    console.error(message);
}
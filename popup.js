// popup.js
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider,
    signOut 
} from 'firebase/auth';
import { 
    getDatabase,
    ref,
    onValue,
    push,
    set,
    remove
} from 'firebase/database';

const firebaseConfig = {
    // Your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// UI Elements
const loginScreen = document.getElementById('loginScreen');
const mainScreen = document.getElementById('mainScreen');
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userEmail = document.getElementById('userEmail');
const userNotesEmail = document.getElementById('userNotesEmail');
const newProjectInput = document.getElementById('newProjectInput');
const createProjectButton = document.getElementById('createProjectButton');
const projectsList = document.getElementById('projectsList');

// Authentication state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        showMainScreen(user);
    } else {
        showLoginScreen();
    }
});

// Login/Logout handlers
loginButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error('Login error:', error);
    }
});

logoutButton.addEventListener('click', () => signOut(auth));

// Show appropriate screen based on auth state
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
}

function showMainScreen(user) {
    loginScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    userEmail.textContent = user.email;
    userNotesEmail.textContent = `${user.uid}@your-domain.com`;
    loadProjects(user.uid);
}

// Project management
createProjectButton.addEventListener('click', () => {
    const projectName = newProjectInput.value.trim().toLowerCase();
    if (projectName && auth.currentUser) {
        const projectRef = ref(db, `users/${auth.currentUser.uid}/projects/${projectName}`);
        set(projectRef, {
            createdAt: Date.now(),
            name: projectName
        });
        newProjectInput.value = '';
    }
});

function loadProjects(userId) {
    const projectsRef = ref(db, `users/${userId}/projects`);
    onValue(projectsRef, (snapshot) => {
        const projects = snapshot.val() || {};
        renderProjects(projects);
    });
}

function renderProjects(projects) {
    projectsList.innerHTML = '';
    Object.entries(projects).forEach(([projectName, projectData]) => {
        const projectElement = createProjectElement(projectName, projectData);
        projectsList.appendChild(projectElement);
    });
}

function createProjectElement(projectName, projectData) {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow p-4';
    
    // Project header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-3';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold';
    title.textContent = projectName;
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'text-red-500 hover:text-red-600';
    deleteButton.textContent = '×';
    deleteButton.onclick = () => deleteProject(projectName);
    
    header.appendChild(title);
    header.appendChild(deleteButton);
    div.appendChild(header);
    
    // Notes section
    if (projectData.notes) {
        const notesList = document.createElement('div');
        notesList.className = 'space-y-2';
        
        Object.entries(projectData.notes).forEach(([noteId, note]) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'bg-gray-50 p-3 rounded text-sm';
            noteElement.textContent = note.content;
            notesList.appendChild(noteElement);
        });
        
        div.appendChild(notesList);
    }
    
    return div;
}

function deleteProject(projectName) {
    if (auth.currentUser) {
        const projectRef = ref(db, `users/${auth.currentUser.uid}/projects/${projectName}`);
        remove(projectRef);
    }
}
// Firebase Cloud Function for processing emails
import * as functions from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';

initializeApp();

export const processEmail = functions.https.onRequest(async (req, res) => {
    // Verify the request is from your email service provider
    if (!isValidRequest(req)) {
        res.status(403).send('Unauthorized');
        return;
    }

    try {
        const db = getDatabase();
        const { to, from, subject, text } = req.body;

        // Extract user ID from email address
        const userId = to.split('@')[0];

        // Extract project name from subject
        const projectName = subject.trim().toLowerCase();

        // Store the note in Firebase
        const noteRef = db.ref(`users/${userId}/projects/${projectName}/notes`).push();
        
        await noteRef.set({
            content: text,
            timestamp: Date.now(),
            from: from
        });

        res.status(200).send('OK');
    } catch (error) {
        console.error('Error processing email:', error);
        res.status(500).send('Error processing email');
    }
});

function isValidRequest(req) {
    // Implement verification logic based on your email service provider
    // This might involve checking headers, signatures, or API keys
    return true; // Replace with actual verification
}
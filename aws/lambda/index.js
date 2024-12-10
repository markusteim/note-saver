// aws/lambda/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const crypto = require('crypto');

exports.handler = async (event) => {
    try {
        // Parse SendGrid inbound email
        const body = JSON.parse(event.body);
        const emailData = parseEmail(body);
        
        // Store note in DynamoDB
        await storeNote(emailData);
        
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ message: 'Note stored successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify({ error: 'Failed to process email' })
        };
    }
};

function parseEmail(body) {
    const to = body.to[0].email;
    const from = body.from.email;
    const subject = body.subject;
    const content = body.text || body.html;
    
    // Extract userId from email address (e.g., user123@yourdomain.com -> user123)
    const userId = to.split('@')[0];
    const projectName = subject.trim().toLowerCase();
    
    return {
        userId,
        projectName,
        content,
        from,
        timestamp: Date.now()
    };
}

async function storeNote(data) {
    const params = {
        TableName: 'KwikNotes',
        Item: {
            userId: data.userId,
            projectId: `${data.userId}#${data.projectName}`,
            content: data.content,
            from: data.from,
            timestamp: data.timestamp,
            type: 'note'
        }
    };
    
    await dynamoDB.put(params).promise();
}
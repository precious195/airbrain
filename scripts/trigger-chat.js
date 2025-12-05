const fetch = require('node-fetch');

async function triggerChat() {
    console.log('Triggering chat to capture logs...');
    try {
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversationId: 'debug_intent_' + Date.now(),
                customerId: 'test_user',
                message: 'hello',
                industry: 'banking'
            })
        });

        console.log('Response Status:', response.status);
        const text = await response.text();
        console.log('Response Body Preview:', text.substring(0, 100));

    } catch (error) {
        console.error('Error:', error);
    }
}

triggerChat();

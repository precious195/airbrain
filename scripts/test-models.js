const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = 'AIzaSyB971YbsbiHG4_RMynyEeB76xXoc7bkWfY';
    const genAI = new GoogleGenerativeAI(apiKey);

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-002',
        'gemini-1.5-pro',
        'gemini-1.5-pro-001',
        'gemini-1.5-pro-002',
        'gemini-1.0-pro',
        'gemini-pro',
        'gemini-2.0-flash-exp',
        'gemini-3-pro-preview' // The one requested
    ];

    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            console.log(`✅ ${modelName} SUCCESS`);
        } catch (error) {
            console.log(`❌ ${modelName} FAILED: ${error.message.split('\n')[0]}`);
        }
    }
}

listModels();

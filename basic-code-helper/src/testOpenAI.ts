import { createAssistant, createThread, addMessage } from './assistantAPI'; // Adjust the path accordingly

async function testOpenAIIntegration() {
    try {
        // Create the assistant
        const assistant = await createAssistant();
        console.log('Assistant created:', assistant);

        // Create a thread
        const thread = await createThread();
        console.log('Thread created:', thread);

        // Add a message to the thread
        const message = await addMessage(thread.id, 'Explain what the following code does: print("Hello World")');
        console.log('Message added to thread:', message);

        // If you want to go further and handle streaming, add it here (optional)
        // await streamAssistantResponse(assistant.id, thread.id, console.log);

    } catch (error) {
        console.error('Error in testing OpenAI integration:', error);
    }
}

testOpenAIIntegration();
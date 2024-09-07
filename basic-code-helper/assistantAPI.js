const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: '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',  // Replace with your actual OpenAI API key
});

async function createAssistant() {
    // Create the assistant
    const assistant = await openai.beta.assistants.create({
        name: "Code Explainer",
        instructions: "You are an assistant that explains code snippets to users.",
        tools: [{ type: "code_interpreter" }],
        model: "gpt-4o-mini"  // Choose a model for the assistant
    });
    return assistant;
}

async function getAssistant() {
    const assistant = await openai.beta.assistants.retrieve(
        "asst_SM507E8aPpmOFRIIqpIT5DBe"
    );
    return assistant;
}

async function createThread() {
    // Create a new thread
    const thread = await openai.beta.threads.create();
    return thread;
}

async function addMessage(threadId, content) {
    // Add a message to the thread
    const message = await openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: content
    });
    return message;
}

async function streamAssistantResponse(assistantId, threadId, onData, retries = 3) {
    try {
        const run = openai.beta.threads.runs.stream(threadId, {
            assistant_id: assistantId
        })
        .on('textDelta', (textDelta) => {
            if (textDelta.value) {
                console.log("Received textDelta:", textDelta.value);  // Log the incoming data
                onData(textDelta.value);  // Pass the data back to be handled
            }
        })
        .on('toolCallDelta', (toolCallDelta) => {
            console.log("Received toolCallDelta:", toolCallDelta);  // Log any tool-related data
        });

        return run;

    } catch (error) {
        console.error("Error streaming assistant response:", error);
        if (retries > 0) {
            console.log(`Retrying... (${3 - retries + 1}/3)`);
            return await streamAssistantResponse(assistantId, threadId, onData, retries - 1);
        } else {
            throw new Error('Failed to stream assistant response after 3 retries');
        }
    }
}

module.exports = {
    createAssistant,
    getAssistant,
    createThread,
    addMessage,
    streamAssistantResponse
};



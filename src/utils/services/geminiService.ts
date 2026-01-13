import { browserAPI } from "../browser/browserDetect";

export interface LCFormat {
    title: string;
    difficulty: string;
    description: string;
    functionSignature: string;
    constraints: string[];
    examples: Array<{
        input: string;
        output: string;
        explanation: string;
    }>;
    testCaseFormat: string;
}

const GEMINI_API_KEY = 'AIzaSyDILUvFmUVQe6O9EXsXVCVmrKfLz2TtA1A';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Extract the current Codeforces problem from the DOM
 */
export const extractCFProblem = async (): Promise<string> => {
    const [tab] = await browserAPI.tabs.query({ active: true, currentWindow: true });
    const [result] = await browserAPI.scripting.executeScript({
        target: { tabId: tab.id! },
        func: () => {
            const problemStatement = document.querySelector('.problem-statement');
            if (!problemStatement) return '';

            // Extract title
            const titleElement = problemStatement.querySelector('.title');
            const title = titleElement?.textContent?.trim() || '';

            // Extract time and memory limits
            const timeLimitElement = problemStatement.querySelector('.time-limit');
            const memoryLimitElement = problemStatement.querySelector('.memory-limit');
            const timeLimit = timeLimitElement?.textContent?.trim() || '';
            const memoryLimit = memoryLimitElement?.textContent?.trim() || '';

            // Extract problem description
            const descriptionElements = problemStatement.querySelectorAll('.header + div');
            let description = '';
            descriptionElements.forEach(el => {
                description += el.textContent?.trim() + '\n\n';
            });

            // Extract input/output format
            const inputSpec = problemStatement.querySelector('.input-specification');
            const outputSpec = problemStatement.querySelector('.output-specification');
            const inputFormat = inputSpec?.textContent?.trim() || '';
            const outputFormat = outputSpec?.textContent?.trim() || '';

            // Extract examples
            const sampleTests = problemStatement.querySelector('.sample-test');
            let examples = '';
            if (sampleTests) {
                const inputs = sampleTests.querySelectorAll('.input pre');
                const outputs = sampleTests.querySelectorAll('.output pre');
                
                inputs.forEach((input, idx) => {
                    const output = outputs[idx];
                    examples += `Example ${idx + 1}:\nInput:\n${input.textContent?.trim()}\nOutput:\n${output?.textContent?.trim()}\n\n`;
                });
            }

            // Extract notes if any
            const note = problemStatement.querySelector('.note');
            const noteText = note?.textContent?.trim() || '';

            return `${title}\n\n${timeLimit}\n${memoryLimit}\n\nDescription:\n${description}\n\nInput Format:\n${inputFormat}\n\nOutput Format:\n${outputFormat}\n\nExamples:\n${examples}\n\nNotes:\n${noteText}`;
        }
    });

    return result.result || '';
};

/**
 * Convert Codeforces problem to LeetCode format using Gemini API
 */
export const convertCFtoLC = async (problemText: string): Promise<LCFormat> => {
    if (!problemText) {
        throw new Error('No problem text provided');
    }

    const prompt = `You are a competitive programming expert. Transform the following Codeforces problem into LeetCode-style format with an OOP function signature in C++.

The Codeforces problem is:
${problemText}

IMPORTANT: Respond ONLY with valid JSON. Do not include any markdown code blocks, explanations, or additional text. The response must be a pure JSON object that starts with { and ends with }.

Return a JSON object with this exact structure:
{
  "title": "Problem Title (clean, without problem code)",
  "difficulty": "Easy/Medium/Hard",
  "description": "Clear problem description in LeetCode style",
  "functionSignature": "class Solution {\\npublic:\\n    ReturnType functionName(params) {\\n        \\n    }\\n};",
  "constraints": ["constraint1", "constraint2", "..."],
  "examples": [
    {
      "input": "example input",
      "output": "example output",
      "explanation": "why this output"
    }
  ],
  "testCaseFormat": "Description of how test cases are formatted"
}

Guidelines:
- Convert the problem to use OOP style (class Solution with a member function)
- Use appropriate C++ types and STL containers
- Make the description clear and concise like LeetCode
- Infer reasonable difficulty level based on problem complexity
- Format constraints as bullet points
- Keep examples clear with explanations`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response from Gemini API');
        }

        let responseText = data.candidates[0].content.parts[0].text.trim();
        
        // Remove markdown code blocks if present
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse the JSON response
        const lcFormat: LCFormat = JSON.parse(responseText);
        
        // Validate the response structure
        if (!lcFormat.title || !lcFormat.description || !lcFormat.functionSignature) {
            throw new Error('Invalid LeetCode format structure');
        }

        return lcFormat;
    } catch (error: any) {
        console.error('Error converting CF to LC format:', error);
        throw new Error(`Failed to convert problem: ${error.message}`);
    }
};

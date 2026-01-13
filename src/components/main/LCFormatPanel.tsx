import React, { useState } from 'react';
import { X, Copy, Download, CheckCheck } from 'lucide-react';
import { LCFormat } from '../../utils/services/geminiService';

interface LCFormatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    lcFormat: LCFormat | null;
    theme: 'light' | 'dark';
}

const LCFormatPanel: React.FC<LCFormatPanelProps> = ({ isOpen, onClose, lcFormat, theme }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!lcFormat) return;
        
        const textToCopy = `
# ${lcFormat.title}

**Difficulty:** ${lcFormat.difficulty}

## Description
${lcFormat.description}

## Function Signature
\`\`\`cpp
${lcFormat.functionSignature}
\`\`\`

## Constraints
${lcFormat.constraints.map(c => `- ${c}`).join('\n')}

## Examples
${lcFormat.examples.map((ex, idx) => `
### Example ${idx + 1}
**Input:** ${ex.input}
**Output:** ${ex.output}
**Explanation:** ${ex.explanation}
`).join('\n')}

## Test Case Format
${lcFormat.testCaseFormat}
        `.trim();

        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDownload = () => {
        if (!lcFormat) return;

        const jsonData = JSON.stringify(lcFormat, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${lcFormat.title.replace(/\s+/g, '_')}_LC_Format.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <style>{`
                @keyframes slideInFromLeft {
                    from {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes slideOutToLeft {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(-100%);
                        opacity: 0;
                    }
                }

                .lc-panel-enter {
                    animation: slideInFromLeft 0.3s ease-out forwards;
                }

                .lc-panel-exit {
                    animation: slideOutToLeft 0.3s ease-in forwards;
                }

                .lc-format-panel {
                    position: fixed;
                    top: 0;
                    left: 0;
                    height: 100vh;
                    width: 45%;
                    max-width: 600px;
                    min-width: 400px;
                    z-index: 1000;
                    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .lc-format-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .lc-format-content::-webkit-scrollbar {
                    width: 8px;
                }

                .lc-format-content::-webkit-scrollbar-track {
                    background: ${theme === 'dark' ? '#1a1a1a' : '#f1f1f1'};
                }

                .lc-format-content::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? '#444' : '#888'};
                    border-radius: 4px;
                }

                .lc-format-content::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? '#555' : '#666'};
                }

                .lc-code-block {
                    background: ${theme === 'dark' ? '#1e1e1e' : '#f5f5f5'};
                    border: 1px solid ${theme === 'dark' ? '#333' : '#ddd'};
                    border-radius: 4px;
                    padding: 12px;
                    font-family: 'Courier New', monospace;
                    font-size: 13px;
                    white-space: pre-wrap;
                    overflow-x: auto;
                    margin: 10px 0;
                }

                @media (max-width: 1024px) {
                    .lc-format-panel {
                        width: 60%;
                        min-width: 300px;
                    }
                }

                @media (max-width: 768px) {
                    .lc-format-panel {
                        width: 80%;
                    }
                }
            `}</style>

            {isOpen && (
                <div
                    className={`lc-format-panel ${isOpen ? 'lc-panel-enter' : 'lc-panel-exit'} ${
                        theme === 'dark' ? 'bg-[#111111] text-white' : 'bg-white text-black'
                    }`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between p-4 border-b ${
                        theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}>
                        <h2 className="text-lg font-semibold">LeetCode Format</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                disabled={!lcFormat}
                                className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                } ${!lcFormat && 'opacity-50 cursor-not-allowed'}`}
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <CheckCheck className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5" />
                                )}
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={!lcFormat}
                                className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                } ${!lcFormat && 'opacity-50 cursor-not-allowed'}`}
                                title="Download as JSON"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onClose}
                                className={`p-2 rounded hover:bg-opacity-80 transition-colors ${
                                    theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
                                }`}
                                title="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="lc-format-content">
                        {!lcFormat ? (
                            <div className="flex items-center justify-center h-full">
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    Loading...
                                </p>
                            </div>
                        ) : (
                            <div>
                                {/* Title and Difficulty */}
                                <div className="mb-6">
                                    <h1 className="text-2xl font-bold mb-2">{lcFormat.title}</h1>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                            lcFormat.difficulty === 'Easy'
                                                ? 'bg-green-500 text-white'
                                                : lcFormat.difficulty === 'Medium'
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-red-500 text-white'
                                        }`}
                                    >
                                        {lcFormat.difficulty}
                                    </span>
                                </div>

                                {/* Description */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                                    <p className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {lcFormat.description}
                                    </p>
                                </div>

                                {/* Function Signature */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Function Signature</h3>
                                    <div className="lc-code-block">
                                        {lcFormat.functionSignature}
                                    </div>
                                </div>

                                {/* Constraints */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Constraints</h3>
                                    <ul className={`list-disc list-inside space-y-1 ${
                                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                        {lcFormat.constraints.map((constraint, idx) => (
                                            <li key={idx}>{constraint}</li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Examples */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Examples</h3>
                                    {lcFormat.examples.map((example, idx) => (
                                        <div key={idx} className="mb-4">
                                            <h4 className="font-medium mb-2">Example {idx + 1}:</h4>
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="font-medium">Input: </span>
                                                    <code className={`px-2 py-1 rounded ${
                                                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                                    }`}>
                                                        {example.input}
                                                    </code>
                                                </div>
                                                <div>
                                                    <span className="font-medium">Output: </span>
                                                    <code className={`px-2 py-1 rounded ${
                                                        theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                                                    }`}>
                                                        {example.output}
                                                    </code>
                                                </div>
                                                {example.explanation && (
                                                    <div>
                                                        <span className="font-medium">Explanation: </span>
                                                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                                                            {example.explanation}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Test Case Format */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-2">Test Case Format</h3>
                                    <p className={`whitespace-pre-wrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {lcFormat.testCaseFormat}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default LCFormatPanel;

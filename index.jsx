import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';

export default function TranslatorApp() {
  const [englishText, setEnglishText] = useState('');
  const [translation, setTranslation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const translateText = async () => {
    if (!englishText.trim()) {
      setError('Please enter some text to translate');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { 
              role: "user", 
              content: `Translate the following English text to Spanish and provide a phonetic pronunciation guide (how to sound it out for English speakers).

English text: "${englishText}"

Respond with ONLY a valid JSON object in this exact format. DO NOT include any other text or explanation:
{
  "spanish": "the Spanish translation",
  "phonetic": "the phonetic pronunciation (hyphenated syllables)"
}

IMPORTANT: Your response must be ONLY valid JSON. No markdown, no backticks, no extra text.`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.content[0].text;
      
      // Clean up any markdown formatting
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      
      const result = JSON.parse(responseText);
      setTranslation(result);
      setError('');
    } catch (err) {
      console.error("Translation error:", err);
      setError('Failed to translate. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const speakSpanish = () => {
    if (translation && translation.spanish) {
      const utterance = new SpeechSynthesisUtterance(translation.spanish);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      translateText();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-center mb-2 text-indigo-600">
            English → Spanish
          </h1>
          <p className="text-center text-gray-600 mb-8">Translator with Pronunciation</p>
          
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                English
              </label>
              <textarea
                value={englishText}
                onChange={(e) => setEnglishText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type something in English..."
                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                rows="3"
              />
            </div>

            {/* Translate Button */}
            <button
              onClick={translateText}
              disabled={isLoading || !englishText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Translating...</span>
                </>
              ) : (
                <span>Translate</span>
              )}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Translation Results */}
            {translation && (
              <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                {/* Spanish Translation */}
                <div className="bg-indigo-50 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-indigo-700 mb-2">
                        Spanish
                      </label>
                      <p className="text-2xl font-medium text-gray-800">
                        {translation.spanish}
                      </p>
                    </div>
                    <button
                      onClick={speakSpanish}
                      className="ml-4 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors duration-200"
                      title="Listen to pronunciation"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>

                {/* Phonetic Pronunciation */}
                <div className="bg-green-50 rounded-lg p-6">
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Sounded Out
                  </label>
                  <p className="text-2xl font-medium text-gray-800 tracking-wide">
                    {translation.phonetic}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 italic">
                    Pronunciation guide for English speakers
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Example Section */}
          {!translation && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">Example:</p>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">English:</span> hello</p>
                <p><span className="font-medium">Spanish:</span> Hola</p>
                <p><span className="font-medium">Sounded out:</span> O-la</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

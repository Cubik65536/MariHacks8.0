import { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { storageService } from '../lib/StorageService';
import axios from 'axios';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface QuizCard {
  id: string;
  question: string;
  answer: string;
  noteId: string;
  userId: string;
  createdAt: string;
  type: 'regular' | 'reverse';
  description?: string;
  concept?: string;
}

interface TestQuestion {
  id: string;
  question: string;
  correctAnswer: string;
  options: string[];
  cardId: string;
}

const QuizCards = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [quizCards, setQuizCards] = useState<QuizCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverseLoading, setIsReverseLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState<QuizCard | null>(null);
  // New state variables for test mode
  const [isTestMode, setIsTestMode] = useState(false);
  const [testQuestions, setTestQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testScore, setTestScore] = useState(0);
  const [showTestResults, setShowTestResults] = useState(false);

  useEffect(() => {
    if (user) {
      const userNotes = storageService.getNotes(user.id);
      setNotes(userNotes);
      
      // Load existing quiz cards for the user
      const savedCards = localStorage.getItem(`quizCards_${user.id}`);
      if (savedCards) {
        setQuizCards(JSON.parse(savedCards));
      }
    }
  }, [user]);

  const generateQuizCards = async () => {
    if (!user || !selectedNoteId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const selectedNote = notes.find(note => note.id === selectedNoteId);
      if (!selectedNote) {
        throw new Error('Selected note not found');
      }
      
      // Extract key concepts from the note using OpenAI
      const keyConcepts = await extractKeyConcepts(selectedNote.content);
      
      // Generate quiz cards from the key concepts
      const newQuizCards = await generateCardsFromConcepts(keyConcepts, selectedNoteId, user.id);
      
      // Save the new cards
      const updatedCards = [...quizCards, ...newQuizCards];
      setQuizCards(updatedCards);
      localStorage.setItem(`quizCards_${user.id}`, JSON.stringify(updatedCards));
      
      // Reset to the first new card
      setCurrentCardIndex(quizCards.length);
      setShowAnswer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quiz cards');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReverseQuizCards = async () => {
    if (!user || !selectedNoteId) return;
    
    setIsReverseLoading(true);
    setError(null);
    
    try {
      const selectedNote = notes.find(note => note.id === selectedNoteId);
      if (!selectedNote) {
        throw new Error('Selected note not found');
      }
      
      // Extract key concepts from the note using OpenAI
      const keyConcepts = await extractKeyConcepts(selectedNote.content);
      
      // Generate reverse quiz cards from the key concepts
      const newReverseCards = await generateReverseCardsFromConcepts(keyConcepts, selectedNoteId, user.id);
      
      // Convert reverse cards to the unified format
      const convertedCards: QuizCard[] = newReverseCards.map(card => ({
        id: card.id,
        question: card.description,
        answer: card.concept,
        noteId: card.noteId,
        userId: card.userId,
        createdAt: card.createdAt,
        type: 'reverse',
        description: card.description,
        concept: card.concept
      }));
      
      // Save the new cards
      const updatedCards = [...quizCards, ...convertedCards];
      setQuizCards(updatedCards);
      localStorage.setItem(`quizCards_${user.id}`, JSON.stringify(updatedCards));
      
      // Reset to the first new card
      setCurrentCardIndex(quizCards.length);
      setShowAnswer(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate reverse quiz cards');
    } finally {
      setIsReverseLoading(false);
    }
  };

  const extractKeyConcepts = async (content: string): Promise<string[]> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content analyzer. Extract 5-7 key concepts from the provided content. Return ONLY a JSON array of strings, with each string being a key concept. Do not include any markdown formatting, explanations, or additional text. The response should be valid JSON that can be directly parsed.'
            },
            {
              role: 'user',
              content: `Extract key concepts from this content: ${content}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const conceptsText = response.data.choices[0].message.content;
      
      // Clean up the response to handle potential markdown formatting
      let cleanedText = conceptsText;
      
      // Remove markdown code block syntax if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
      // Parse the JSON array from the cleaned response
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error extracting key concepts:', error);
      throw new Error('Failed to extract key concepts');
    }
  };

  const generateCardsFromConcepts = async (concepts: string[], noteId: string, userId: string): Promise<QuizCard[]> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert quiz creator. Create quiz cards from the provided key concepts. 
              For each concept, generate a question and a detailed answer. The concepts are essentially just 
              the main ideas and keywords that are found within the content of the note. You are expected to 
              decipher what is important or unimportant to the user depending on the relevance of the concept in regards to the video
              Return a JSON array of objects with the following structure:
              [
                {
                  "question": "A keyword or a series of words that make up a concept",
                  "answer": "The detailed answer text"
                },
                ...
              ]
              Do not include any markdown formatting, explanations, or additional text outside the JSON array. The response should be valid JSON that can be directly parsed.`
            },
            {
              role: 'user',
              content: `Create quiz cards from these key concepts: ${JSON.stringify(concepts)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const cardsText = response.data.choices[0].message.content;
      
      // Clean up the response to handle potential markdown formatting
      let cleanedText = cardsText;
      
      // Remove markdown code block syntax if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
      // Additional cleaning to ensure valid JSON
      // Find the first '[' and last ']' to extract just the JSON array
      const startIndex = cleanedText.indexOf('[');
      const endIndex = cleanedText.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Invalid response format: Could not find JSON array');
      }
      
      cleanedText = cleanedText.substring(startIndex, endIndex + 1);
      
      // Parse the JSON array from the cleaned response
      const cardsData = JSON.parse(cleanedText);
      
      // Convert the data to QuizCard objects
      return cardsData.map((card: any, index: number) => ({
        id: `${Date.now()}_${index}`,
        question: card.question,
        answer: card.answer,
        noteId,
        userId,
        createdAt: new Date().toISOString(),
        type: 'regular'
      }));
    } catch (error) {
      console.error('Error generating quiz cards:', error);
      throw new Error('Failed to generate quiz cards');
    }
  };

  const generateReverseCardsFromConcepts = async (concepts: string[], noteId: string, userId: string): Promise<{id: string, description: string, concept: string, noteId: string, userId: string, createdAt: string}[]> => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert quiz creator. Create reverse quiz cards from the provided key concepts. 
              For each concept, generate a detailed description that explains the concept WITHOUT mentioning the concept itself or any of its key terms.
              The user should be able to guess the concept based on the description alone.
              Return a JSON array of objects with the following structure:
              [
                {
                  "description": "A detailed description of the concept without mentioning the concept itself",
                  "concept": "The actual concept that the description refers to"
                },
                ...
              ]
              Do not include any markdown formatting, explanations, or additional text outside the JSON array. The response should be valid JSON that can be directly parsed.`
            },
            {
              role: 'user',
              content: `Create reverse quiz cards from these key concepts: ${JSON.stringify(concepts)}`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const cardsText = response.data.choices[0].message.content;
      
      // Clean up the response to handle potential markdown formatting
      let cleanedText = cardsText;
      
      // Remove markdown code block syntax if present
      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Remove any leading/trailing whitespace
      cleanedText = cleanedText.trim();
      
      // Additional cleaning to ensure valid JSON
      // Find the first '[' and last ']' to extract just the JSON array
      const startIndex = cleanedText.indexOf('[');
      const endIndex = cleanedText.lastIndexOf(']');
      
      if (startIndex === -1 || endIndex === -1) {
        throw new Error('Invalid response format: Could not find JSON array');
      }
      
      cleanedText = cleanedText.substring(startIndex, endIndex + 1);
      
      // Parse the JSON array from the cleaned response
      const cardsData = JSON.parse(cleanedText);
      
      // Convert the data to ReverseQuizCard objects
      return cardsData.map((card: any, index: number) => ({
        id: `${Date.now()}_${index}`,
        description: card.description,
        concept: card.concept,
        noteId,
        userId,
        createdAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error generating reverse quiz cards:', error);
      throw new Error('Failed to generate reverse quiz cards');
    }
  };

  const handleNextCard = () => {
    if (currentCardIndex < quizCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
      setIsEditing(false);
      setEditedCard(null);
    }
  };

  const handlePreviousCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
      setIsEditing(false);
      setEditedCard(null);
    }
  };

  const handleDeleteCard = (id: string) => {
    if (!user) return;
    
    const updatedCards = quizCards.filter(card => card.id !== id);
    setQuizCards(updatedCards);
    localStorage.setItem(`quizCards_${user.id}`, JSON.stringify(updatedCards));
    
    // Adjust current index if needed
    if (currentCardIndex >= updatedCards.length) {
      setCurrentCardIndex(Math.max(0, updatedCards.length - 1));
    }
  };

  const handleEditCard = () => {
    if (!currentCard) return;
    
    setEditedCard({...currentCard});
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editedCard || !user) return;
    
    const updatedCards = quizCards.map(card => 
      card.id === editedCard.id ? editedCard : card
    );
    
    setQuizCards(updatedCards);
    localStorage.setItem(`quizCards_${user.id}`, JSON.stringify(updatedCards));
    setIsEditing(false);
    setEditedCard(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedCard(null);
  };

  const currentCard = quizCards[currentCardIndex];

  // Test mode functions
  const startTest = () => {
    if (quizCards.length < 4) {
      setError('You need at least 4 quiz cards to start a test');
      return;
    }

    // Separate cards by type
    const reverseCards = quizCards.filter(card => card.type === 'reverse');
    const normalCards = quizCards.filter(card => card.type === 'regular');
    
    // Determine how many questions to include from each type
    let reverseQuestionsCount = Math.min(5, reverseCards.length);
    let normalQuestionsCount = Math.min(5, normalCards.length);
    
    // If we don't have enough cards of one type, adjust the other type
    if (reverseCards.length < 4 && normalCards.length >= 4) {
      reverseQuestionsCount = 0;
      normalQuestionsCount = Math.min(10, normalCards.length);
    } else if (normalCards.length < 4 && reverseCards.length >= 4) {
      normalQuestionsCount = 0;
      reverseQuestionsCount = Math.min(10, reverseCards.length);
    }
    
    // Shuffle each card type
    const shuffledReverseCards = [...reverseCards].sort(() => Math.random() - 0.5);
    const shuffledNormalCards = [...normalCards].sort(() => Math.random() - 0.5);
    
    // Generate test questions for reverse cards
    const reverseQuestions: TestQuestion[] = shuffledReverseCards
      .slice(0, reverseQuestionsCount)
      .map((card, index) => {
        // For reverse cards: question is the concept, answer is the definition
        const questionText = card.question; // The concept
        const correctAnswer = card.answer; // The definition
        
        // Get 3 random incorrect answers from other cards (definitions)
        const otherAnswers = [...shuffledReverseCards, ...shuffledNormalCards]
          .filter((c, i) => c.id !== card.id)
          .map(c => c.answer); // Get definitions
        
        const shuffledAnswers = otherAnswers
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Combine correct answer with incorrect answers and shuffle
        const allOptions = [...shuffledAnswers, correctAnswer]
          .sort(() => Math.random() - 0.5);

        return {
          id: `${Date.now()}_reverse_${index}`,
          question: questionText,
          correctAnswer: correctAnswer,
          options: allOptions,
          cardId: card.id
        };
      });
    
    // Generate test questions for normal cards
    const normalQuestions: TestQuestion[] = shuffledNormalCards
      .slice(0, normalQuestionsCount)
      .map((card, index) => {
        // For normal cards: question is the concept, answer is the definition
        const questionText = card.question; // The concept
        const correctAnswer = card.answer; // The definition
        
        // Get 3 random incorrect answers from other cards (definitions)
        const otherAnswers = [...shuffledNormalCards, ...shuffledReverseCards]
          .filter((c, i) => c.id !== card.id)
          .map(c => c.answer); // Get definitions
        
        const shuffledAnswers = otherAnswers
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        // Combine correct answer with incorrect answers and shuffle
        const allOptions = [...shuffledAnswers, correctAnswer]
          .sort(() => Math.random() - 0.5);

        return {
          id: `${Date.now()}_normal_${index}`,
          question: questionText,
          correctAnswer: correctAnswer,
          options: allOptions,
          cardId: card.id
        };
      });
    
    // Combine questions with reverse cards first, then normal cards
    const allQuestions = [...reverseQuestions, ...normalQuestions];
    
    setTestQuestions(allQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTestScore(0);
    setShowTestResults(false);
    setIsTestMode(true);
  };

  // Helper function to reformulate a definition without containing the key term
  const reformulateDefinition = (keyTerm: string, definition: string): string => {
    // Simple approach: remove the key term and any similar words from the definition
    // and rephrase it to be a standalone definition
    
    // Create a regex pattern to match the key term and similar words
    const keyTermWords = keyTerm.toLowerCase().split(/\s+/);
    const keyTermPattern = new RegExp(keyTermWords.join('|'), 'gi');
    
    // Remove the key term from the definition
    let reformulated = definition.replace(keyTermPattern, '');
    
    // Clean up any double spaces or punctuation issues
    reformulated = reformulated.replace(/\s+/g, ' ').trim();
    
    // If the reformulated definition is too short, add some context
    if (reformulated.length < 20) {
      reformulated = `A concept that ${reformulated}`;
    }
    
    return reformulated;
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Find the original card for this question
    const currentQuestion = testQuestions[currentQuestionIndex];
    const originalCard = quizCards.find(card => card.id === currentQuestion.cardId);
    
    if (!originalCard) {
      console.error('Original card not found for question:', currentQuestion);
      return;
    }
    
    // Check if the selected answer matches the correct answer
    if (selectedAnswer === currentQuestion.correctAnswer) {
      setTestScore(testScore + 1);
    }

    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    } else {
      setShowTestResults(true);
    }
  };

  const endTest = () => {
    setIsTestMode(false);
    setTestQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTestScore(0);
    setShowTestResults(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Quiz Cards</h1>

      {!isTestMode ? (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Generate Quiz Cards</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Select a Note</label>
              <select
                value={selectedNoteId || ''}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a Note --</option>
                {notes.map((note) => (
                  <option key={note.id} value={note.id}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={generateQuizCards}
                disabled={!selectedNoteId || isLoading}
                className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Generating...' : 'Generate Regular Cards'}
              </button>
              
              <button
                onClick={generateReverseQuizCards}
                disabled={!selectedNoteId || isReverseLoading}
                className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
              >
                {isReverseLoading ? 'Generating...' : 'Generate Reverse Cards'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {quizCards.length > 0 && (
            <div className="mb-8">
              <button
                onClick={startTest}
                className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Start Test Mode
              </button>
            </div>
          )}

          {quizCards.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Card {currentCardIndex + 1} of {quizCards.length}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({currentCard.type === 'regular' ? 'Regular' : 'Reverse'})
                    </span>
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditCard}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCard(currentCard.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {isEditing && editedCard ? (
                  <div className="mb-6">
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        {currentCard.type === 'regular' ? 'Question' : 'Description'}
                      </label>
                      <textarea
                        value={editedCard.question}
                        onChange={(e) => setEditedCard({...editedCard, question: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        {currentCard.type === 'regular' ? 'Answer' : 'Concept'}
                      </label>
                      <textarea
                        value={editedCard.answer}
                        onChange={(e) => setEditedCard({...editedCard, answer: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={4}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-2">
                        {currentCard.type === 'regular' ? 'Question' : 'Description'}
                      </h3>
                      <p className="text-gray-800">{currentCard.question}</p>
                    </div>
                    
                    {showAnswer ? (
                      <div className="mb-6">
                        <h3 className="text-lg font-medium mb-2">
                          {currentCard.type === 'regular' ? 'Answer' : 'Concept'}
                        </h3>
                        <p className="text-gray-800">{currentCard.answer}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors mb-6"
                      >
                        Show {currentCard.type === 'regular' ? 'Answer' : 'Concept'}
                      </button>
                    )}
                  </>
                )}
                
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousCard}
                    disabled={currentCardIndex === 0}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={handleNextCard}
                    disabled={currentCardIndex === quizCards.length - 1}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No quiz cards yet. Select a note and generate some cards to get started.
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {!showTestResults ? (
            <>
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Question {currentQuestionIndex + 1} of {testQuestions.length}
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({testQuestions[currentQuestionIndex].id.includes('reverse') 
                        ? 'Reverse Card' 
                        : 'Normal Card'})
                    </span>
                  </h2>
                  <span className="text-gray-500">
                    Score: {testScore}
                  </span>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-2">Key Concept:</h3>
                  <p className="text-xl font-semibold mb-4">
                    {testQuestions[currentQuestionIndex].question}
                  </p>
                  
                  <h3 className="text-lg font-medium mb-2">Select the correct definition:</h3>
                  <div className="space-y-3">
                    {testQuestions[currentQuestionIndex].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className={`w-full p-4 text-left rounded-md border transition-colors ${
                          selectedAnswer === option
                            ? 'bg-indigo-100 border-indigo-500'
                            : 'bg-white border-gray-300 hover:border-indigo-300'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleNextQuestion}
                    disabled={!selectedAnswer}
                    className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {currentQuestionIndex === testQuestions.length - 1 ? 'Finish Test' : 'Next Question'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Test Results</h2>
              <p className="text-xl mb-6">
                Your score: {testScore} out of {testQuestions.length}
              </p>
              
              <div className="mb-6">
                <p className="text-lg mb-2">
                  {testScore / testQuestions.length >= 0.7 
                    ? "Great job! You've mastered these concepts!" 
                    : testScore / testQuestions.length >= 0.5
                      ? "Good effort! Keep practicing to improve your understanding."
                      : "Keep studying! Review the concepts and try again."}
                </p>
                
                <div className="mt-4 text-sm text-gray-600">
                  <p>This test included:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>{testQuestions.filter(q => q.id.includes('reverse')).length} questions from reverse cards</li>
                    <li>{testQuestions.filter(q => q.id.includes('normal')).length} questions from normal cards</li>
                  </ul>
                  <p className="mt-2">All questions tested your ability to match key concepts with their definitions.</p>
                  <p className="mt-2">Try reviewing the cards you missed to strengthen your understanding.</p>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={startTest}
                    className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors mr-4"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={endTest}
                    className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Return to Quiz Cards
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuizCards; 
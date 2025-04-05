import { useState } from 'react';
import { extractVideoId, getVideoInfo, analyzeAudioWithOpenAI } from '../lib/YouTubeService';
import { storageService } from '../lib/StorageService';
import { useAuth } from '../lib/AuthContext';
import ReactMarkdown from 'react-markdown';

interface VideoAnalysis {
  id: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  summary: string;
  userId: string;
  createdAt: string;
}

const AudioNotes = () => {
  const { user } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<VideoAnalysis[]>(() => {
    if (!user) return [];
    const saved = localStorage.getItem(`videoAnalyses_${user.id}`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setError(null);
    setIsLoading(true);

    try {
      const videoId = extractVideoId(youtubeUrl);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      const videoInfo = await getVideoInfo(videoId);
      
      // For demo purposes, we'll use a mock transcript
      // In a real app, you would use a speech-to-text service
      const mockTranscript = `This is a mock transcript of the video "${videoInfo.title}". 
        In a real implementation, this would be the actual transcript from the video.`;

      const summary = await analyzeAudioWithOpenAI(mockTranscript);

      const newAnalysis: VideoAnalysis = {
        id: Date.now().toString(),
        videoId,
        title: videoInfo.title,
        thumbnailUrl: videoInfo.thumbnailUrl,
        summary,
        userId: user.id,
        createdAt: new Date().toISOString(),
      };

      const updatedAnalyses = [newAnalysis, ...analyses];
      setAnalyses(updatedAnalyses);
      localStorage.setItem(`videoAnalyses_${user.id}`, JSON.stringify(updatedAnalyses));
      setYoutubeUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (!user) return;
    
    const updatedAnalyses = analyses.filter(analysis => analysis.id !== id);
    setAnalyses(updatedAnalyses);
    localStorage.setItem(`videoAnalyses_${user.id}`, JSON.stringify(updatedAnalyses));
  };

  const handleAddToNotes = (analysis: VideoAnalysis) => {
    if (!user) return;
    
    try {
      // Create a new note from the analysis
      const newNote = {
        id: Date.now().toString(),
        title: `Summary: ${analysis.title}`,
        content: `# ${analysis.title}\n\n${analysis.summary}\n\n[View on YouTube](https://youtube.com/watch?v=${analysis.videoId})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: user.id
      };
      
      // Add the note to the user's notes
      storageService.createNote(newNote);
      
      // Show success message
      alert('Summary added to your notes!');
    } catch (err) {
      setError('Failed to add summary to notes');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Audio Notes</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {analyses.map((analysis) => (
          <div
            key={analysis.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="flex gap-4 p-4">
              <img
                src={analysis.thumbnailUrl}
                alt={analysis.title}
                className="w-48 h-27 object-cover rounded"
              />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold mb-2">{analysis.title}</h2>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-600 mb-2">
                  Analyzed on {new Date(analysis.createdAt).toLocaleDateString()}
                </p>
                <div className="prose max-w-none">
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <div className="markdown-content">
                    <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleAddToNotes(analysis)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add to Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {analyses.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 py-8">
            No analyses yet. Enter a YouTube URL to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioNotes; 
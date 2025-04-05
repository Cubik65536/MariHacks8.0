import axios from 'axios';

interface YouTubeVideoInfo {
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
}

export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export const getVideoInfo = async (videoId: string): Promise<YouTubeVideoInfo> => {
  try {
    const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'snippet,contentDetails',
        id: videoId,
        key: import.meta.env.VITE_YOUTUBE_API_KEY,
      },
    });

    const video = response.data.items[0];
    return {
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnailUrl: video.snippet.thumbnails.high.url,
      duration: video.contentDetails.duration,
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to fetch video information');
  }
};

export const analyzeAudioWithOpenAI = async (transcript: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content analyzer. Your task is to create a comprehensive summary of educational content that includes:
1. Main concepts and their detailed explanations
2. Specific examples and applications
3. Key terminology with definitions
4. Important relationships between concepts
5. Practical applications or implications
6. How to apply the concept taught in a problem step by step
7. Common misconceptions or challenges
8. Additional context or background information where relevant

Format your response in clear sections with appropriate headings. Use bullet points for lists and maintain a professional yet accessible tone.`
          },
          {
            role: 'user',
            content: `Please analyze this transcript and provide a detailed educational summary: ${transcript}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error analyzing audio with OpenAI:', error);
    throw new Error('Failed to analyze audio content');
  }
}; 
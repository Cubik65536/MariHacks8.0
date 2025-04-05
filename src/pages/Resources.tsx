import { useState } from 'react';

interface Resource {
  id: number;
  title: string;
  type: 'video' | 'article' | 'book' | 'website';
  url: string;
  description: string;
  tags: string[];
}

const Resources = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [resources] = useState<Resource[]>([
    {
      id: 1,
      title: "Khan Academy",
      type: "website",
      url: "https://www.khanacademy.org",
      description: "Free online courses, lessons, and practice in math, science, and more",
      tags: ["education", "math", "science", "free"]
    },
    {
      id: 2,
      title: "Coursera",
      type: "website",
      url: "https://www.coursera.org",
      description: "Online learning platform offering courses from top universities",
      tags: ["courses", "university", "certification"]
    },
    {
      id: 3,
      title: "The Feynman Lectures on Physics",
      type: "book",
      url: "https://www.feynmanlectures.caltech.edu",
      description: "Classic physics lectures by Nobel laureate Richard Feynman",
      tags: ["physics", "science", "lectures"]
    },
    {
      id: 4,
      title: "3Blue1Brown",
      type: "video",
      url: "https://www.youtube.com/c/3blue1brown",
      description: "Animated math videos that make complex concepts intuitive",
      tags: ["mathematics", "visualization", "education"]
    },
    {
      id: 5,
      title: "MIT OpenCourseWare",
      type: "website",
      url: "https://ocw.mit.edu",
      description: "Free MIT course materials for self-study",
      tags: ["university", "courses", "free", "stem"]
    },
    {
      id: 6,
      title: "Codecademy",
      type: "website",
      url: "https://www.codecademy.com",
      description: "Interactive coding lessons and projects",
      tags: ["programming", "coding", "interactive"]
    },
    {
      id: 7,
      title: "Scientific American",
      type: "article",
      url: "https://www.scientificamerican.com",
      description: "Latest scientific discoveries and research articles",
      tags: ["science", "research", "news"]
    },
    {
      id: 8,
      title: "Project Gutenberg",
      type: "website",
      url: "https://www.gutenberg.org",
      description: "Free eBooks of public domain literature",
      tags: ["books", "literature", "free"]
    },
    {
      id: 9,
      title: "TED-Ed",
      type: "video",
      url: "https://ed.ted.com",
      description: "Educational videos on various topics",
      tags: ["education", "videos", "lectures"]
    },
    {
      id: 10,
      title: "Wolfram Alpha",
      type: "website",
      url: "https://www.wolframalpha.com",
      description: "Computational knowledge engine for math and science",
      tags: ["mathematics", "science", "computation"]
    }
  ]);

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'article':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Study Resources</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="article">Articles</option>
              <option value="book">Books</option>
              <option value="website">Websites</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map(resource => (
          <div
            key={resource.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-indigo-500">
                  {getTypeIcon(resource.type)}
                </div>
                <h3 className="text-lg font-medium">{resource.title}</h3>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-indigo-600 bg-indigo-100 rounded-full">
                {resource.type}
              </span>
            </div>
            <p className="mt-2 text-gray-600">{resource.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {resource.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center text-indigo-500 hover:text-indigo-600"
            >
              View Resource
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources; 
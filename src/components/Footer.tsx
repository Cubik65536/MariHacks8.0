const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">StudyStack</h3>
            <p className="text-gray-300">
              Your all-in-one AI-powered studying companion
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/dashboard/audio-notes" className="text-gray-300 hover:text-white">Audio Notes</a></li>
              <li><a href="/dashboard/quiz-cards" className="text-gray-300 hover:text-white">Quiz Cards</a></li>
              <li><a href="/dashboard/schedule" className="text-gray-300 hover:text-white">Schedule</a></li>
              <li><a href="/dashboard/resources" className="text-gray-300 hover:text-white">Resources</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300">
              Have questions? Reach out to us at<br />
              <a href="mailto:support@studystack.ixor.dev" className="text-indigo-400 hover:text-indigo-300">
                support@studystack.ixor.dev
              </a>
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} StudyStack. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
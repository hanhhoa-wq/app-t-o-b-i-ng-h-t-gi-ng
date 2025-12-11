
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedContent, SavedPost } from '../types';
import { Copy, Check, Download, Image as ImageIcon, RefreshCw, Bookmark } from 'lucide-react';

interface GeneratedResultProps {
  data: GeneratedContent;
  onRegenerateImage: () => void;
  isRegeneratingImage: boolean;
}

const GeneratedResult: React.FC<GeneratedResultProps> = ({ data, onRegenerateImage, isRegeneratingImage }) => {
  const [copied, setCopied] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(data.postContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadImage = () => {
    if (data.imageBase64) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${data.imageBase64}`;
      link.download = 'seed-post-image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSavePost = () => {
    try {
      const newSavedPost: SavedPost = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        content: data
      };

      const existingData = localStorage.getItem('saved_posts');
      const savedPosts: SavedPost[] = existingData ? JSON.parse(existingData) : [];
      
      // Prepend the new post
      const updatedPosts = [newSavedPost, ...savedPosts];
      
      localStorage.setItem('saved_posts', JSON.stringify(updatedPosts));
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Không thể lưu bài viết. Bộ nhớ trình duyệt có thể đã đầy.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Generated Image Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center flex-wrap gap-2">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-green-600" />
            Hình Ảnh Minh Họa AI
          </h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onRegenerateImage}
              disabled={isRegeneratingImage}
              className={`text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm ${isRegeneratingImage ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <RefreshCw className={`w-4 h-4 ${isRegeneratingImage ? 'animate-spin' : ''}`} />
              {isRegeneratingImage ? 'Đang tạo...' : 'Tạo lại ảnh'}
            </button>
            
            {data.imageBase64 && (
              <button
                onClick={handleDownloadImage}
                disabled={isRegeneratingImage}
                className="text-sm bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải ảnh</span>
              </button>
            )}
          </div>
        </div>
        <div className="bg-gray-100 min-h-[300px] flex items-center justify-center relative">
          {data.imageBase64 ? (
             <div className={`relative w-full h-full max-h-[500px] flex items-center justify-center transition-opacity duration-300 ${isRegeneratingImage ? 'opacity-50' : 'opacity-100'}`}>
                <img 
                  src={`data:image/png;base64,${data.imageBase64}`} 
                  alt="Generated Seed" 
                  className="w-full h-full object-cover max-h-[500px]" 
                />
                {isRegeneratingImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                  </div>
                )}
             </div>
          ) : (
             <div className="p-8 text-center text-gray-500">
               {isRegeneratingImage ? (
                  <div className="flex flex-col items-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                     <p>Đang tạo hình ảnh mới...</p>
                  </div>
               ) : (
                 <>
                   <p className="mb-2">Không thể tạo hình ảnh lúc này.</p>
                   <p className="text-xs">Prompt: {data.imagePrompt.substring(0, 100)}...</p>
                 </>
               )}
             </div>
          )}
        </div>
      </div>

      {/* Generated Text Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex-1">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-semibold text-gray-800">Nội Dung Bài Đăng</h3>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePost}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                isSaved 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span className="hidden sm:inline">Đã lưu</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden sm:inline">Lưu bài</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                copied 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Đã sao chép
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Sao chép
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
          <div className="prose prose-green max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
             <ReactMarkdown>{data.postContent}</ReactMarkdown>
          </div>
        </div>
      </div>

    </div>
  );
};

export default GeneratedResult;

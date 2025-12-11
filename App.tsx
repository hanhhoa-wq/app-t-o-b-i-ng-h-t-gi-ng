
import React, { useState, useEffect } from 'react';

// Import từ thư mục components
import SeedForm from './components/SeedForm';
import GeneratedResult from './components/GeneratedResult';
import HistoryList from './components/HistoryList';

// Import type
import { SeedInput, GenerationState, HistoryItem, GeneratedContent } from './types';

// Import service đúng đường dẫn
import { generateSeedPost, regenerateSeedImage } from './components/geminiService';

// Icon
import { Sprout, History as HistoryIcon, Download as DownloadIcon } from 'lucide-react';


const App: React.FC = () => {
  const [generation, setGeneration] = useState<GenerationState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentInput, setCurrentInput] = useState<SeedInput | null>(null);
  
  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agri_content_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, []);

  // Handle PWA Install Prompt
  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setShowInstallBtn(false);
    }
  };

  // Helper to save history safely (handling quota limits)
  const saveHistoryToStorage = (newHistory: HistoryItem[]) => {
    try {
      localStorage.setItem('agri_content_history', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (e) {
      console.warn('Storage quota exceeded, attempting to save without image data for latest item.');
      // If saving fails (likely due to base64 image size), try saving without the image of the newest item
      if (newHistory.length > 0) {
        const latest = newHistory[0];
        const latestWithoutImage = {
          ...latest,
          result: { ...latest.result, imageBase64: undefined }
        };
        const fallbackHistory = [latestWithoutImage, ...newHistory.slice(1)];
        
        try {
          localStorage.setItem('agri_content_history', JSON.stringify(fallbackHistory));
          setHistory(fallbackHistory);
        } catch (retryError) {
          console.error('Still failed to save history:', retryError);
          // Fallback: don't update storage, just state (session only)
          setHistory(newHistory);
        }
      }
    }
  };

  const addToHistory = (input: SeedInput, result: GeneratedContent) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      input,
      result
    };
    
    // Keep max 50 items
    const updatedHistory = [newItem, ...history].slice(0, 50);
    saveHistoryToStorage(updatedHistory);
  };

  const handleFormSubmit = async (inputData: SeedInput) => {
    setGeneration({ isLoading: true, error: null, data: null });
    try {
      const result = await generateSeedPost(inputData);
      setGeneration({ isLoading: false, error: null, data: result });
      addToHistory(inputData, result);
    } catch (err: any) {
      setGeneration({
        isLoading: false,
        error: "Đã xảy ra lỗi khi tạo nội dung. Vui lòng kiểm tra API Key hoặc thử lại sau.",
        data: null
      });
    }
  };

  const handleRegenerateImage = async () => {
    if (!generation.data?.imagePrompt) return;

    setIsRegeneratingImage(true);
    try {
      const newImageBase64 = await regenerateSeedImage(generation.data.imagePrompt);
      
      if (newImageBase64) {
        const updatedData = {
          ...generation.data,
          imageBase64: newImageBase64
        };
        setGeneration(prev => ({
          ...prev,
          data: updatedData
        }));

        // Note: We deliberately do not update the history here to keep the history 
        // as a log of the initial generation.
      }
    } catch (error) {
      console.error("Failed to regenerate image:", error);
    } finally {
      setIsRegeneratingImage(false);
    }
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setGeneration({
      isLoading: false,
      error: null,
      data: item.result
    });
    setCurrentInput(item.input);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    saveHistoryToStorage(updatedHistory);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">AgriContent AI</h1>
              <p className="text-xs text-green-600 font-medium">Trợ lý bán hạt giống</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg shadow-md transition-all animate-pulse"
              >
                <DownloadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Cài App</span>
              </button>
            )}

            <button
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
            >
              <HistoryIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Lịch sử</span>
            </button>
            <div className="text-sm text-gray-500 hidden md:block border-l border-gray-200 pl-4">
              Powered by Gemini 2.5
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <div className="prose prose-sm text-gray-600 mb-6">
              <p>
                Điền thông tin hạt giống của bạn vào bên dưới. AI sẽ tự động tạo bài đăng Facebook hấp dẫn kèm hình ảnh minh họa để giúp bạn chốt đơn nhanh chóng!
              </p>
            </div>
            <SeedForm 
              onSubmit={handleFormSubmit} 
              isLoading={generation.isLoading} 
              initialValues={currentInput}
            />
            
            {generation.error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-pulse">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700 font-medium">
                      {generation.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7">
            {generation.data ? (
              <GeneratedResult 
                data={generation.data} 
                onRegenerateImage={handleRegenerateImage}
                isRegeneratingImage={isRegeneratingImage}
              />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white/50 rounded-3xl border-2 border-dashed border-green-200 text-center p-8">
                <div className="bg-green-100 p-6 rounded-full mb-6">
                  <Sprout className="w-12 h-12 text-green-500 opacity-80" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Chưa có nội dung</h3>
                <p className="text-gray-500 max-w-md">
                  Hãy điền thông tin bên trái và nhấn "Tạo Bài Đăng Ngay" để xem kết quả.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* History Drawer */}
      <HistoryList 
        history={history}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelect={handleHistorySelect}
        onDelete={handleDeleteHistory}
      />
      
    </div>
  );
};

export default App;

import React from 'react';
import { HistoryItem } from '../types';
import { Clock, Trash2, X, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, isOpen, onClose, onSelect, onDelete }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
            <h2 className="text-lg font-bold text-green-800 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Lịch sử bài đăng
            </h2>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-sm">Chưa có bài đăng nào được lưu.</p>
                <p className="text-xs mt-1">Hãy tạo bài đăng mới ngay!</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-xl p-3 hover:border-green-300 hover:shadow-md transition-all group relative cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center border border-gray-100">
                      {item.result.imageBase64 ? (
                        <img 
                          src={`data:image/png;base64,${item.result.imageBase64}`} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    
                    {/* Content Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {item.input.seedName}
                      </h4>
                      <p className="text-xs text-gray-500 mb-1">
                        {new Date(item.timestamp).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {item.input.strongPoints}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center text-gray-300 group-hover:text-green-500">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 text-center text-xs text-gray-500">
            Lưu trữ trên trình duyệt của bạn
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryList;

import React, { useState, useEffect } from 'react';
import { SeedInput } from '../types';
import { Leaf, DollarSign, Award, Clock, MapPin, Link as LinkIcon, Sparkles, Image as ImageIcon, Package, Save, Search } from 'lucide-react';

interface SeedFormProps {
  onSubmit: (data: SeedInput) => void;
  isLoading: boolean;
  initialValues?: SeedInput | null;
}

const SeedForm: React.FC<SeedFormProps> = ({ onSubmit, isLoading, initialValues }) => {
  const [formData, setFormData] = useState<SeedInput>({
    seedName: '',
    price: '',
    strongPoints: '',
    harvestTime: '',
    suitableSpace: '',
    purchaseLink: '',
    recommendedCombos: '',
    customImagePrompt: '',
    seoKeywords: '',
  });

  const [isAutoSaved, setIsAutoSaved] = useState(false);

  // Load autosave on mount ONLY if initialValues is not provided
  useEffect(() => {
    if (!initialValues) {
      const saved = localStorage.getItem('agri_content_form_autosave');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            ...parsed,
            // Ensure optional fields are handled if missing in saved data
            recommendedCombos: parsed.recommendedCombos || '',
            customImagePrompt: parsed.customImagePrompt || '',
            seoKeywords: parsed.seoKeywords || ''
          }));
        } catch (e) {
          console.error('Error loading autosave:', e);
        }
      }
    }
  }, []); // Run once on mount

  // Sync with initialValues prop (History selection)
  useEffect(() => {
    if (initialValues) {
      setFormData({
        ...initialValues,
        recommendedCombos: initialValues.recommendedCombos || '',
        customImagePrompt: initialValues.customImagePrompt || '',
        seoKeywords: initialValues.seoKeywords || ''
      });
    }
  }, [initialValues]);

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('agri_content_form_autosave', JSON.stringify(formData));
      setIsAutoSaved(true);
      setTimeout(() => setIsAutoSaved(false), 2000); // Hide indicator after 2s
    }, 1000); // Debounce for 1 second
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsAutoSaved(false); // Reset saved status while typing
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleSampleFill = () => {
    setFormData({
      seedName: 'Cải Ngọt Chịu Nhiệt',
      price: '15.000đ/gói 20g',
      strongPoints: 'Nảy mầm 99%, chịu nóng tốt, kháng sâu bệnh, lá to giòn ngọt',
      harvestTime: '25-30 ngày',
      suitableSpace: 'Ban công nhỏ, thùng xốp, sân thượng nắng gắt',
      purchaseLink: 'https://shopee.vn/hat-giong-cai-ngot',
      recommendedCombos: 'Combo rau ăn lá: Cải Ngọt + Mồng Tơi + Rau Dền',
      customImagePrompt: '',
      seoKeywords: 'hạt giống cải ngọt, trồng rau sạch tại nhà, nông sản sạch',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-green-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <Leaf className="w-6 h-6" />
          Thông Tin Sản Phẩm
        </h2>
        <div className="flex gap-3 items-center">
           {isAutoSaved && (
            <span className="text-xs text-gray-400 flex items-center gap-1 transition-opacity duration-500">
              <Save className="w-3 h-3" /> Đã lưu nháp
            </span>
          )}
           <button 
            type="button"
            onClick={handleSampleFill}
            className="text-sm text-green-600 hover:text-green-800 underline decoration-dotted"
          >
            Dùng mẫu thử
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Seed Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên loại hạt giống</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Leaf className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="seedName"
              required
              value={formData.seedName}
              onChange={handleChange}
              placeholder="Ví dụ: Cải ngọt, Xà lách xoăn..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Price & Harvest Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="price"
                required
                value={formData.price}
                onChange={handleChange}
                placeholder="Ví dụ: 15.000đ/gói"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thu hoạch</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="harvestTime"
                required
                value={formData.harvestTime}
                onChange={handleChange}
                placeholder="Ví dụ: 25-30 ngày"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Strong Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Điểm mạnh nổi bật</label>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <Award className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="strongPoints"
              required
              rows={2}
              value={formData.strongPoints}
              onChange={handleChange}
              placeholder="Ví dụ: Dễ nảy mầm, chịu nhiệt tốt, ít sâu bệnh..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Suitable Space */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Không gian phù hợp</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="suitableSpace"
              required
              value={formData.suitableSpace}
              onChange={handleChange}
              placeholder="Ví dụ: Ban công nhỏ, sân thượng, thùng xốp"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Recommended Combos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gợi ý phối hợp / Combo (Tùy chọn - AI tự gợi ý nếu để trống)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="recommendedCombos"
              value={formData.recommendedCombos || ''}
              onChange={handleChange}
              placeholder="Ví dụ: Trồng cùng cà chua... (Hoặc để trống)"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* SEO Keywords */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ khóa SEO (Tùy chọn)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="seoKeywords"
              value={formData.seoKeywords || ''}
              onChange={handleChange}
              placeholder="Ví dụ: trồng rau sạch, hạt giống giá rẻ, làm vườn..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Purchase Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link mua hàng</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="purchaseLink"
              required
              value={formData.purchaseLink}
              onChange={handleChange}
              placeholder="Link Shopee/Lazada/Facebook..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Custom Image Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu cho ảnh minh họa (Tùy chọn)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
              <ImageIcon className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              name="customImagePrompt"
              rows={2}
              value={formData.customImagePrompt || ''}
              onChange={handleChange}
              placeholder="Ví dụ: Phong cách hoạt hình, chụp cận cảnh, nền ban công nhiều nắng..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center py-3.5 px-6 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5'}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang sáng tạo nội dung...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Tạo Bài Đăng Ngay
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SeedForm;
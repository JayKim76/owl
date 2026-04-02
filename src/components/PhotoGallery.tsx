"use client";

import { useState } from "react";
import { Upload, X, Search, Image as ImageIcon } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  title: string;
  date: string;
}

const INITIAL_PHOTOS: Photo[] = [
  { id: "p1", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=600", title: "욕실 배관 누수", date: "2026-04-02" },
  { id: "p2", url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600", title: "보일러 수리 전", date: "2026-04-01" },
  { id: "p3", url: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&q=80&w=600", title: "천장 얼룩 상태", date: "2026-04-01" },
  { id: "p4", url: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&q=80&w=600", title: "외부 방수 공사 완료", date: "2026-03-30" },
];

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPhotos = photos.filter(p => p.title.includes(searchQuery));

  const handleUpload = () => {
    // 임시로 기본 이미지를 추가하는 동작
    const newPhoto: Photo = {
      id: Date.now().toString(),
      url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=600",
      title: "새로운 현장 사진",
      date: new Date().toISOString().split("T")[0],
    };
    setPhotos([newPhoto, ...photos]);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="사진 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-xl hover:bg-slate-900 transition-colors shadow-md shrink-0 text-sm font-medium"
        >
          <Upload size={18} />
          <span className="hidden sm:inline">사진 추가</span>
        </button>
      </div>

      {/* Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ImageIcon className="mx-auto h-12 w-12 mb-3 text-gray-300" />
          <p>검색 결과 또는 사진이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-gray-100"
            >
              {}
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                <p className="text-white text-xs font-semibold truncate">{photo.title}</p>
                <p className="text-gray-300 text-[10px] mt-0.5">{photo.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPhoto(null)}>
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white transition bg-black/40 hover:bg-black/80 rounded-full"
            >
              <X size={24} />
            </button>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="rounded-lg shadow-2xl object-contain max-h-[85vh] w-auto"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur text-white px-6 py-2.5 rounded-full text-sm font-medium shadow-xl">
              {selectedPhoto.title} <span className="text-white/60 ml-2">| {selectedPhoto.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

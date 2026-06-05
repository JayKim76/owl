"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, X, Search, Image as ImageIcon, Camera, Trash2, Check, Plus } from "lucide-react";

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
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 바텀 시트 및 제목 모달 제어 상태
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  
  // 새로 업로드하는 임시 데이터 상태
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  
  // 파일 인풋 참조 객체
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. 컴포넌트 마운트 시 LocalStorage에서 저장된 사진 데이터 로드
  useEffect(() => {
    const loadPhotos = window.setTimeout(() => {
      const savedPhotos = localStorage.getItem("owl_site_photos");
      if (savedPhotos) {
        try {
          setPhotos(JSON.parse(savedPhotos));
        } catch (e) {
          console.error("저장된 사진을 로드하는 중 실패했습니다.", e);
          setPhotos(INITIAL_PHOTOS);
          localStorage.setItem("owl_site_photos", JSON.stringify(INITIAL_PHOTOS));
        }
      } else {
        setPhotos(INITIAL_PHOTOS);
        localStorage.setItem("owl_site_photos", JSON.stringify(INITIAL_PHOTOS));
      }
    }, 0);

    return () => window.clearTimeout(loadPhotos);
  }, []);

  const filteredPhotos = photos.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 2. HTML5 Canvas를 활용하여 모바일 이미지를 압축 및 가볍게 리사이징하는 헬퍼 함수
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800; // 가로 최대 800px로 제한
          const MAX_HEIGHT = 800; // 세로 최대 800px로 제한
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // 75%의 미려한 화질 수준의 JPEG 데이터로 압축 변환
            const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
            resolve(dataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  // 3. 사진 파일이 선택(또는 촬용 완료)되었을 때 처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    try {
      const compressedBase64 = await compressImage(file);
      setTempPhotoUrl(compressedBase64);
      
      // 현재 날짜 시각을 기본값으로 추천 타이틀 생성
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      
      setNewPhotoTitle(`현장 사진 ${year}-${month}-${date} ${hours}:${minutes}`);
      setIsBottomSheetOpen(false); // 바텀 시트 닫기
      setIsTitleModalOpen(true);   // 제목 입력 팝업 켜기
    } catch (err) {
      alert("이미지 최적화 처리 과정에서 에러가 발생했습니다.");
      console.error(err);
    }
    
    // 동일한 파일도 재선택하여 올릴 수 있게 인풋 상태 리셋
    e.target.value = "";
  };

  // 4. 사진을 타이틀과 함께 최종적으로 갤러리에 추가
  const handleAddPhoto = () => {
    if (!tempPhotoUrl) return;

    const newPhoto: Photo = {
      id: `photo_${Date.now()}`,
      url: tempPhotoUrl,
      title: newPhotoTitle.trim() || "제목 없는 현장 사진",
      date: new Date().toISOString().split("T")[0],
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    localStorage.setItem("owl_site_photos", JSON.stringify(updatedPhotos));
    
    setIsTitleModalOpen(false);
    setTempPhotoUrl(null);
    setNewPhotoTitle("");
  };

  // 5. 등록된 사진 데이터 삭제
  const handleDeletePhoto = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (confirm("정말로 이 사진을 목록에서 삭제하시겠습니까?")) {
      const updatedPhotos = photos.filter(p => p.id !== id);
      setPhotos(updatedPhotos);
      localStorage.setItem("owl_site_photos", JSON.stringify(updatedPhotos));
      
      if (selectedPhoto?.id === id) {
        setSelectedPhoto(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 5.1. 숨겨진 파일 및 카메라 전용 캡처용 인풋 */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 5.2. 상단 검색바 및 사진 추가 액션 영역 */}
      <div className="space-y-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-blue-100">현장 기록</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight">현장 사진 바로 촬영</h2>
              <p className="mt-1 text-xs leading-relaxed text-blue-100">
                휴대폰 카메라로 누수 부위나 작업 전후 사진을 즉시 찍어 업로드하세요.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <Camera size={24} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-sm font-extrabold text-blue-700 shadow-sm transition active:scale-95"
            >
              <Camera size={18} />
              바로 촬영
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-3 text-sm font-bold text-white ring-1 ring-white/25 transition hover:bg-white/20 active:scale-95"
            >
              <Upload size={18} />
              사진 선택
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="사진 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm text-gray-800 font-medium"
            />
            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
          </div>
          <button
            onClick={() => setIsBottomSheetOpen(true)}
            className="flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl hover:bg-slate-700 transition-all shadow-md shrink-0 text-sm font-semibold active:scale-95"
          >
            <Plus size={18} />
            <span>추가</span>
          </button>
        </div>
      </div>

      {/* 5.3. 현장 사진 리스트 그리드 */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <ImageIcon className="mx-auto h-12 w-12 mb-3 text-gray-300" />
          <p className="text-sm font-medium">등록된 현장 사진이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-sm bg-gray-100 hover:shadow-md transition-all duration-300 border border-gray-100"
            >
              <img
                src={photo.url}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* 마우스 호버 혹은 기본 상태에서 제공되는 즉시 삭제 아이콘 */}
              <button
                onClick={(e) => handleDeletePhoto(photo.id, e)}
                className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-600 text-white rounded-lg opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 backdrop-blur-xs"
                title="사진 삭제"
              >
                <Trash2 size={14} />
              </button>
              
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-9">
                <p className="text-white text-xs font-bold truncate">{photo.title}</p>
                <p className="text-gray-300 text-[10px] mt-0.5 font-medium">{photo.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5.4. 모바일 및 브라우저 업로드 바텀 시트 */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs animate-in fade-in duration-200" onClick={() => setIsBottomSheetOpen(false)}>
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl p-6 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-2" />
            <h3 className="text-base font-bold text-gray-800 text-center">현장 사진 업로드</h3>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors text-blue-700 active:scale-95"
              >
                <div className="p-3 bg-blue-600 text-white rounded-full shadow-md shadow-blue-200">
                  <Camera size={22} />
                </div>
                <span className="text-sm font-semibold">카메라로 촬영</span>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors text-indigo-700 active:scale-95"
              >
                <div className="p-3 bg-indigo-600 text-white rounded-full shadow-md shadow-indigo-200">
                  <ImageIcon size={22} />
                </div>
                <span className="text-sm font-semibold">갤러리에서 선택</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsBottomSheetOpen(false)}
              className="w-full py-3.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 5.5. 업로드 후 사진 이름 입력 모달 */}
      {isTitleModalOpen && tempPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-sm font-bold text-gray-800">새 사진 이름 설정</h3>
              <button onClick={() => { setIsTitleModalOpen(false); setTempPhotoUrl(null); }} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                <img src={tempPhotoUrl} alt="임시 미리보기" className="w-full h-full object-cover" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">사진 제목</label>
                <input
                  type="text"
                  placeholder="예: 욕실 변기 하단 누수"
                  value={newPhotoTitle}
                  onChange={e => setNewPhotoTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-800 font-semibold"
                  autoFocus
                />
              </div>
            </div>
            
            <div className="px-5 pb-5 pt-1 flex gap-3">
              <button
                onClick={() => { setIsTitleModalOpen(false); setTempPhotoUrl(null); }}
                className="flex-1 py-3 border border-gray-200 text-gray-500 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddPhoto}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check size={14} />
                <span>등록 완료</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5.6. 개별 사진 확대 모달 */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-200" 
            onClick={e => e.stopPropagation()}
          >
            {/* 확대 모달 우측 상단 액션 버튼들 */}
            <div className="absolute -top-12 right-0 flex items-center gap-3">
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="p-2 text-white/80 hover:text-red-500 transition bg-black/40 hover:bg-black/80 rounded-xl flex items-center gap-1 text-xs font-semibold px-3 backdrop-blur-xs"
                title="사진 삭제"
              >
                <Trash2 size={16} />
                <span>삭제하기</span>
              </button>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 text-white/70 hover:text-white transition bg-black/40 hover:bg-black/80 rounded-xl backdrop-blur-xs"
              >
                <X size={20} />
              </button>
            </div>
            
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title}
              className="rounded-2xl shadow-2xl object-contain max-h-[80vh] w-auto border border-white/10"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/75 backdrop-blur-md text-white px-6 py-3 rounded-full text-xs font-bold shadow-2xl flex items-center gap-3 border border-white/10 whitespace-nowrap">
              <span className="text-white">{selectedPhoto.title}</span>
              <span className="text-white/40">|</span>
              <span className="text-white/60">{selectedPhoto.date}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

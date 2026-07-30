"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Clock, Plus, GripVertical, Camera, Upload, Image as ImageIcon, X, Trash2 } from "lucide-react";

type TaskStatus = "todo" | "in-progress" | "done";

export interface TaskPhoto {
  id: string;
  url: string;
  title: string;
  date: string;
  taskId?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  date: string;
  photos?: TaskPhoto[];
}

const INITIAL_TASKS: Task[] = [
  { id: "1", title: "서초 래미안 아파트 101동 누수 탐지", status: "in-progress", date: "2026-04-02", photos: [] },
  { id: "2", title: "송파 다세대 주택 배관 공사", status: "todo", date: "2026-04-03", photos: [] },
  { id: "3", title: "강남 빌라 옥상 방수", status: "done", date: "2026-04-01", photos: [] },
];

export default function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // 모달 제어 상태
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isUploadOptionsOpen, setIsUploadOptionsOpen] = useState(false);
  const [photoTitleInput, setPhotoTitleInput] = useState("");
  const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
  const [isTitleInputModalOpen, setIsTitleInputModalOpen] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 로컬 스토리지에서 작업 데이터 및 사진 데이터 불러오기
  useEffect(() => {
    const savedTasks = localStorage.getItem("owl_site_tasks");
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("작업 데이터를 로드하는데 실패했습니다.", e);
        setTasks(INITIAL_TASKS);
      }
    } else {
      setTasks(INITIAL_TASKS);
      localStorage.setItem("owl_site_tasks", JSON.stringify(INITIAL_TASKS));
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem("owl_site_tasks", JSON.stringify(newTasks));
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      status: "todo",
      date: new Date().toISOString().split("T")[0],
      photos: [],
    };
    const updated = [newTask, ...tasks];
    saveTasks(updated);
    setNewTaskTitle("");
  };

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    saveTasks(updated);
    if (selectedTask && selectedTask.id === id) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const openTaskPhotoModal = (task: Task) => {
    setSelectedTask(task);
    setIsPhotoModalOpen(true);
  };

  // 이미지 압축 헬퍼
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedTask) return;

    const file = files[0];
    try {
      const compressedBase64 = await compressImage(file);
      setTempPhotoUrl(compressedBase64);
      setPhotoTitleInput(`[${selectedTask.title}] 현장 사진`);
      setIsUploadOptionsOpen(false);
      setIsTitleInputModalOpen(true);
    } catch (err) {
      alert("이미지 처리 중 오류가 발생했습니다.");
      console.error(err);
    }
    e.target.value = "";
  };

  const handleConfirmAddPhoto = () => {
    if (!tempPhotoUrl || !selectedTask) return;

    const newPhoto: TaskPhoto = {
      id: `photo_${Date.now()}`,
      url: tempPhotoUrl,
      title: photoTitleInput.trim() || `${selectedTask.title} 현장 사진`,
      date: new Date().toISOString().split("T")[0],
      taskId: selectedTask.id,
    };

    const taskPhotos = selectedTask.photos || [];
    const updatedPhotos = [newPhoto, ...taskPhotos];
    const updatedTask = { ...selectedTask, photos: updatedPhotos };

    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
    saveTasks(updatedTasks);
    setSelectedTask(updatedTask);

    // 전체 현장 사진 (owl_site_photos)에도 동기화 저장
    try {
      const savedPhotos = localStorage.getItem("owl_site_photos");
      let allPhotos = savedPhotos ? JSON.parse(savedPhotos) : [];
      allPhotos = [newPhoto, ...allPhotos];
      localStorage.setItem("owl_site_photos", JSON.stringify(allPhotos));
    } catch (e) {
      console.error("현장 사진 스토리지 동기화 실패:", e);
    }

    setIsTitleInputModalOpen(false);
    setTempPhotoUrl(null);
  };

  const handleDeletePhoto = (photoId: string) => {
    if (!selectedTask || !confirm("이 사진을 삭제하시겠습니까?")) return;

    const updatedPhotos = (selectedTask.photos || []).filter(p => p.id !== photoId);
    const updatedTask = { ...selectedTask, photos: updatedPhotos };
    const updatedTasks = tasks.map(t => t.id === selectedTask.id ? updatedTask : t);
    saveTasks(updatedTasks);
    setSelectedTask(updatedTask);

    // 전체 현장 사진에서도 제거
    try {
      const savedPhotos = localStorage.getItem("owl_site_photos");
      if (savedPhotos) {
        let allPhotos = JSON.parse(savedPhotos);
        allPhotos = allPhotos.filter((p: any) => p.id !== photoId);
        localStorage.setItem("owl_site_photos", JSON.stringify(allPhotos));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const statusMap: Record<TaskStatus, { label: string, color: string, icon: any }> = {
    "todo": { label: "대기 중", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
    "in-progress": { label: "진행 중", color: "bg-blue-50 text-blue-700 border-blue-200 font-bold", icon: Clock },
    "done": { label: "완료", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Add Task */}
      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="새로운 작업 입력..."
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm text-gray-800 font-medium"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          className="p-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition flex items-center justify-center shrink-0"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {(["todo", "in-progress", "done"] as TaskStatus[]).map(status => {
          const statusTasks = tasks.filter(t => t.status === status);
          if (statusTasks.length === 0) return null;

          return (
            <div key={status} className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 px-1 border-b pb-2 flex items-center justify-between">
                {statusMap[status].label}
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{statusTasks.length}</span>
              </h3>
              <div className="space-y-2">
                {statusTasks.map(task => {
                  const isInProgress = task.status === "in-progress";
                  const photoCount = (task.photos || []).length;
                  return (
                    <div
                      key={task.id}
                      className={`bg-white border text-sm p-4 rounded-xl shadow-sm flex flex-col gap-2 transition-all ${
                        isInProgress ? "border-blue-300 ring-1 ring-blue-100 hover:border-blue-400" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`flex items-center gap-3 flex-1 ${isInProgress ? "cursor-pointer" : ""}`}
                          onClick={() => isInProgress && openTaskPhotoModal(task)}
                        >
                          <div className="text-gray-300 cursor-grab active:cursor-grabbing">
                            <GripVertical size={16} />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${task.status === "done" ? "text-gray-400 line-through" : "text-gray-800"}`}>
                                {task.title}
                              </span>
                              {isInProgress && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <Camera size={11} />
                                  사진 업로드
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-gray-400">{task.date}</span>
                              {photoCount > 0 && (
                                <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                                  <ImageIcon size={12} /> 사진 {photoCount}장
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Selector */}
                        <div className="shrink-0 flex items-center gap-2">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                            className={`text-xs px-3 py-1.5 rounded-md border appearance-none outline-none cursor-pointer font-medium ${statusMap[task.status].color}`}
                          >
                            <option value="todo">대기 중</option>
                            <option value="in-progress">진행 중</option>
                            <option value="done">완료</option>
                          </select>
                        </div>
                      </div>

                      {/* In-Progress Task Direct Upload Button Bar */}
                      {isInProgress && (
                        <div className="pt-2 border-t border-blue-50 flex items-center justify-between">
                          <button
                            onClick={() => openTaskPhotoModal(task)}
                            className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Camera size={14} />
                            현장 사진 촬영 / 업로드 ({photoCount}장)
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Photos Modal */}
      {isPhotoModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPhotoModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Camera size={20} />
                <div>
                  <h3 className="font-bold text-base line-clamp-1">{selectedTask.title}</h3>
                  <p className="text-xs text-blue-100">진행 중 작업 현장 사진 관리</p>
                </div>
              </div>
              <button onClick={() => setIsPhotoModalOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition text-white">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">
                  등록된 현장 사진 ({(selectedTask.photos || []).length}장)
                </span>
                <button
                  onClick={() => setIsUploadOptionsOpen(true)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus size={14} /> 사진 추가하기
                </button>
              </div>

              {(selectedTask.photos || []).length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center space-y-3 bg-gray-50">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Camera size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">등록된 사진이 없습니다</p>
                    <p className="text-xs text-gray-400 mt-0.5">현장에서 촬영하거나 선택한 사진을 업로드하세요</p>
                  </div>
                  <button
                    onClick={() => setIsUploadOptionsOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow"
                  >
                    <Upload size={14} /> 사진 업로드하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(selectedTask.photos || []).map((photo) => (
                    <div key={photo.id} className="relative group bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                      <div className="aspect-square relative overflow-hidden bg-slate-900">
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-rose-600 text-white rounded-full transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="p-2.5 bg-white">
                        <p className="text-xs font-bold text-gray-800 truncate">{photo.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{photo.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="px-5 py-2.5 bg-gray-800 text-white font-bold rounded-xl text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Option Selection Bottom Sheet */}
      {isUploadOptionsOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsUploadOptionsOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200">
            <h4 className="text-base font-bold text-gray-800 text-center">사진 업로드 방식 선택</h4>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-5 border-2 border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-2xl flex flex-col items-center gap-2 transition-all"
              >
                <Camera size={28} />
                <span className="text-xs font-bold">바로 촬영하기</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-5 border-2 border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-2xl flex flex-col items-center gap-2 transition-all"
              >
                <Upload size={28} />
                <span className="text-xs font-bold">앨범에서 선택</span>
              </button>
            </div>
            <button
              onClick={() => setIsUploadOptionsOpen(false)}
              className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs mt-2"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Photo Title Input Modal */}
      {isTitleInputModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsTitleInputModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-base font-bold text-gray-800">사진 제목 입력</h4>
            {tempPhotoUrl && (
              <div className="w-full h-40 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <img src={tempPhotoUrl} alt="미리보기" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">사진 메모 / 제목</label>
              <input
                type="text"
                value={photoTitleInput}
                onChange={(e) => setPhotoTitleInput(e.target.value)}
                placeholder="예: 욕실 누수 부위 상세 촬영"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsTitleInputModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl text-xs"
              >
                취소
              </button>
              <button
                onClick={handleConfirmAddPhoto}
                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl text-xs shadow-md"
              >
                업로드 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


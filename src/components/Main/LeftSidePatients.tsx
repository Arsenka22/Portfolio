import { useEffect, useState, useRef } from "react";
import SearchBtn from "../../assets/SearchBtn.svg";
import DefaultPatientPhoto from "../../assets/Patient.png";
import MoreHor from "../../assets/MoreBtnHor.png";
import { fetchPatients, type Patient } from "../../Api/PatientsApi";

export const LeftSidePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startThumbPositionRef = useRef(0);
  const [showThumb, setShowThumb] = useState(false);

  // Фиксированная высота ползунка
  const THUMB_HEIGHT = 100;
  // Отступ трека снизу (используем стандартные значения Tailwind)
  const TRACK_BOTTOM_OFFSET = 5; // соответствует bottom-5 (1.25rem = 20px)

  useEffect(() => {
    const getPatients = async () => {
      try {
        const patientsData = await fetchPatients();
        setPatients(patientsData);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    getPatients();
  }, []);

  // Обработка скролла и позиции ползунка
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkThumbVisibility = () => {
      const shouldShow = container.scrollHeight > container.clientHeight;
      setShowThumb(shouldShow);
    };

    const handleScroll = () => {
      if (!showThumb) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll <= 0) return;
      
      const scrollRatio = scrollTop / maxScroll;
      const thumbMaxPosition = clientHeight - THUMB_HEIGHT - (TRACK_BOTTOM_OFFSET * 4); // 5 = 20px
      const thumbPosition = scrollRatio * thumbMaxPosition;
      
      setScrollPosition(thumbPosition);
    };

    checkThumbVisibility();
    handleScroll();
    
    container.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', checkThumbVisibility);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkThumbVisibility);
    };
  }, [patients, showThumb]);

  // Обработчик начала перетаскивания
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);

    startYRef.current = e.clientY;
    startThumbPositionRef.current = scrollPosition;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  };

  // Обработчики перетаскивания
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const { clientHeight, scrollHeight } = container;
      const maxThumbPosition = clientHeight - THUMB_HEIGHT - (TRACK_BOTTOM_OFFSET * 4);
      
      const deltaY = e.clientY - startYRef.current;
      let newThumbPosition = startThumbPositionRef.current + deltaY;
      
      newThumbPosition = Math.max(0, Math.min(newThumbPosition, maxThumbPosition));
      
      const scrollRatio = newThumbPosition / maxThumbPosition;
      const maxScroll = scrollHeight - clientHeight;
      container.scrollTop = scrollRatio * maxScroll;
      
      setScrollPosition(newThumbPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (loading) {
    return (
      <div className="leftSide-patients w-full max-w-[367px] h-full bg-white p-5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leftSide-patients w-full max-w-[367px] h-full bg-white p-5 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="leftSide-patients w-full max-w-[367px] h-full bg-white p-5 text-gray-500">
        No patients found
      </div>
    );
  }

  return (
    <div className="leftSide-patients w-full max-w-[367px] h-[1054px] bg-white pl-5 rounded-[16px] flex flex-col">
      <div className="leftSide-patients__title w-full flex justify-between items-center pt-5 pb-4 sticky top-0 bg-white z-10">
        <span className="text-2xl font-medium">Patients</span>
        <button className="p-2 hover:bg-gray-100 rounded-full">
          <img src={SearchBtn} alt="Search" className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 pb-4 relative overflow-hidden">
        {/* Трек скролла с фиксированным отступом снизу (bottom-5 = 20px) */}
        {showThumb && (
          <div className="absolute right-2 top-0 bottom-5 w-1.5 bg-gray-200 rounded-full">
            <div
              ref={scrollThumbRef}
              className={`absolute right-0 w-1.5 bg-black rounded-full cursor-pointer transition-colors ${
                isDragging ? 'cursor-grabbing bg-gray-800' : 'hover:bg-gray-700'
              }`}
              style={{
                height: `${THUMB_HEIGHT}px`,
                top: `${scrollPosition}px`,
              }}
              onMouseDown={handleThumbMouseDown}
            />
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto scrollbar-hide pr-4"
        >
          <ul className="leftSide-patients__list flex flex-col gap-4">
            {patients.map((patient, index) => (
              <li 
                key={`${patient.name}-${index}`} 
                className="patients__item flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <img 
                  src={patient.profile_picture || DefaultPatientPhoto} 
                  alt={patient.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DefaultPatientPhoto;
                  }}
                />
                <div className="flex justify-between items-center w-full ml-3">
                  <div className="patients__info">
                    <p className="patients__name font-medium">
                      {patient.name}
                    </p>
                    <p className="patients__details text-gray-500 text-sm">
                      {patient.gender}, {patient.age} years
                      {patient.diagnosis_history?.[0]?.diagnosis && (
                        <span className="ml-2 text-xs text-gray-400">
                          • {patient.diagnosis_history[0].diagnosis}
                        </span>
                      )}
                    </p>
                  </div>
                  <button className="patients__more p-1 hover:bg-gray-200 rounded">
                    <img src={MoreHor} alt="More options" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
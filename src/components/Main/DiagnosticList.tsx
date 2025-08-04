import React, { useState, useEffect, useRef } from 'react';
import { fetchPatients } from '../../Api/PatientsApi'; 

interface MedicalProblem {
  name: string;
  description: string;
  status: string;
}

interface Patient {
  name: string;
  diagnostic_list?: MedicalProblem[];
}

const StatusBadge = ({ status }: { status?: string }) => {
  if (!status) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Неизвестно
      </span>
    );
  }
  
  let bgColor = '';
  let textColor = '';
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'under observation':
      bgColor = 'none';
      textColor = '[#072635]';
      break;
    case 'cured':
      bgColor = 'none';
      textColor = '[#072635]';
      break;
    case 'inactive':
      bgColor = 'none';
      textColor = '[#072635]';
      break;
    case 'untreated':
      bgColor = 'none';
      textColor = '[#072635]';
      break;
    default:
      bgColor = 'none';
      textColor = '[#072635]';
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

export const ProblemsTable: React.FC = () => {
  const [problems, setProblems] = useState<MedicalProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Рефы и состояния для кастомного скролла
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startThumbPositionRef = useRef(0);
  const [showThumb, setShowThumb] = useState(false);
  
  // Фиксированная высота ползунка
  const THUMB_HEIGHT = 100;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const patients = await fetchPatients();
        if (patients.length > 3) {
          const jessica = patients[3];
          if (jessica.diagnostic_list) {
            setProblems(jessica.diagnostic_list);
          } else {
            setError("Нет списка диагностик для пациента по индексу 3");
          }
        } else {
          setError("Пациент по индексу 3 не найден");
        }
      } catch (err) {
        setError("Не удалось загрузить данные");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Обработка скролла и позиции ползунка
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Проверка необходимости скроллбара
    const checkThumbVisibility = () => {
      const shouldShow = container.scrollHeight > container.clientHeight;
      setShowThumb(shouldShow);
    };

    // Расчет позиции ползунка
    const handleScroll = () => {
      if (!showThumb) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const maxScroll = scrollHeight - clientHeight;
      
      if (maxScroll <= 0) return;
      
      const scrollRatio = scrollTop / maxScroll;
      const thumbMaxPosition = clientHeight - THUMB_HEIGHT;
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
  }, [problems, showThumb]);

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
      const maxThumbPosition = clientHeight - THUMB_HEIGHT;
      
      // Рассчитываем новую позицию ползунка
      const deltaY = e.clientY - startYRef.current;
      let newThumbPosition = startThumbPositionRef.current + deltaY;
      
      // Ограничиваем в пределах трека
      newThumbPosition = Math.max(0, Math.min(newThumbPosition, maxThumbPosition));
      
      // Рассчитываем соответствующий scrollTop
      const scrollRatio = newThumbPosition / maxThumbPosition;
      const maxScroll = scrollHeight - clientHeight;
      container.scrollTop = scrollRatio * maxScroll;
      
      // Обновляем позицию ползунка
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
    return <div className="text-center py-4">Загрузка медицинских данных...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4 text-center">{error}</div>;
  }

  return (
    <div className="overflow-x-auto max-w-[766px] h-[349px] bg-white flex flex-col gap-[40px] px-[20px] py-[20px] relative">
      <h3 className='text-2xl font-semibold '>Diagnosis list</h3>
      
      {/* Трек скролла (отображаем только если нужен скролл) */}
      {showThumb && (
        <div className="absolute right-4 top-[80px] bottom-4 w-1.5 bg-gray-200 rounded-full">
          {/* Ползунок */}
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
        className="overflow-y-auto scrollbar-hide pr-2"
        style={{ height: 'calc(100% - 40px)' }}
      >
        <table className="w-full bg-white rounded-lg">
          <thead className="bg-[#F6F7F8] sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-100 rounded-[24px]">
                Problem/Diagnostic
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-100 rounded-[24px]">
                Description
              </th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b border-gray-100 rounded-[24px]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {problems.length > 0 ? (
              problems.map((problem, index) => (
                <tr 
                  key={index} 
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="py-3 px-4 border-b border-gray-100">{problem.name}</td>
                  <td className="py-3 px-4 border-b border-gray-100">{problem.description}</td>
                  <td className="py-3 px-4 border-b border-gray-100">
                    <StatusBadge status={problem.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={3} 
                  className="py-4 px-4 text-center text-gray-500 border-b"
                >
                  Медицинские проблемы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
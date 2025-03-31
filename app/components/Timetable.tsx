// app/components/Timetable.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent, // 重複を削除
  DragStartEvent,
  DragCancelEvent,
  DragOverEvent, // DragOverEvent を追加
  useDraggable, // useDraggable を追加
  useDroppable, // useDroppable を追加
  DragOverlay, // DragOverlay を追加
} from '@dnd-kit/core';
// SortableContext 関連は削除
// import {
//   SortableContext,
//   useSortable,
//   verticalListSortingStrategy,
//   sortableKeyboardCoordinates,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities'; // CSS ヘルパーは不要になる可能性

interface Course {
  name: string;
  credits: number;
}

interface DaySchedule {
  [period: number]: Course | null;
}

interface SemesterTimetable {
  [day: string]: DaySchedule;
}

interface TimetableData {
  [semester: string]: SemesterTimetable;
}

interface TimetableProps {
  semester: string;
  timetable: TimetableData;
  totalCredits: number;
  onRemoveCourse: (day: string, period: number) => void;
  onMoveCourse: (source: {day: string; period: number}, destination: {day: string; period: number}) => void;
}

// --- CourseCard コンポーネント (表示用) ---
const CourseCard = ({ course, onRemoveCourse, day, period }: { course: Course; onRemoveCourse: (day: string, period: number) => void; day: string; period: number }) => {
  return (
    <div className="flex flex-col h-full min-h-[4rem] p-2 rounded-lg bg-[--card-background] border border-[--border] shadow-sm">
      <div className="font-medium text-sm flex-grow line-clamp-3 overflow-hidden">
        {course.name}
      </div>
      <div className="flex items-center justify-between mt-auto pt-1.5">
        <span className="text-xs text-[--muted-foreground]">{course.credits}単位</span>
        <button
          onClick={(e) => {
            e.stopPropagation(); // ドラッグイベントのトリガーを防ぐ
            onRemoveCourse(day, period);
          }}
          className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
          aria-label="科目を削除"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

// --- TimetableCell コンポーネント (ドラッグ＆ドロップ担当) ---
// isDraggableDragging プロパティを追加
const TimetableCell = ({ id, course, isOver, isDragging, isDraggableDragging, onRemoveCourse }: { id: string; course: Course | null; isOver: boolean; isDragging: boolean; isDraggableDragging: boolean; onRemoveCourse: (day: string, period: number) => void }) => {
  const [day, periodStr] = id.split('-');
  const period = parseInt(periodStr);

  // ドロップ可能な設定
  const { setNodeRef: setDroppableNodeRef, isOver: isDroppableOver } = useDroppable({
    id: id,
  });

  // ドラッグ可能な設定 (科目がある場合のみ)
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
    isDragging: isCurrentlyDraggingThisCell, // 名前を変更
  } = useDraggable({
    id: id,
    disabled: !course, // 科目がない場合はドラッグ不可
  });

  // Draggable と Droppable の ref を結合
  const setNodeRef = (node: HTMLElement | null) => {
    setDroppableNodeRef(node);
    if (course) {
      setDraggableNodeRef(node);
    }
  };

  // スタイル設定
  const style: React.CSSProperties = {
    // opacity: isCurrentlyDraggingThisCell ? 0.5 : 1, // 名前を変更
    visibility: isCurrentlyDraggingThisCell ? 'hidden' : 'visible', // ドラッグ元は非表示に (名前を変更)
    cursor: course ? 'grab' : 'default',
    // transform や transition は適用しない
  };

  // ドロップ先のハイライト表示
  // isDragging は親から渡されるグローバルなドラッグ状態、isCurrentlyDraggingThisCell はこのセル自身のドラッグ状態
  const showDashedBorder = isDroppableOver && !isCurrentlyDraggingThisCell; // 自身をドラッグ中は表示しない (名前を変更)
  const borderStyle = showDashedBorder ? 'border-2 border-dashed border-[--primary]' : 'border-2 border-dashed border-transparent';
  const overStyle = showDashedBorder ? 'bg-[--primary-hover]' : '';

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`h-full ${borderStyle} ${overStyle} rounded-lg`}>
      {course ? (
        // 科目がある場合: CourseCard を表示
        <CourseCard course={course} onRemoveCourse={onRemoveCourse} day={day} period={period} />
      ) : (
        // 空欄セルの表示
        <div className="flex items-center justify-center h-full min-h-[4rem] text-[--muted-foreground] text-sm p-2">
          {/* ドラッグ中でなければハイフン表示 (isDragging は外部から渡す) */}
          {!isDragging && '-'}
        </div>
      )}
    </div>
  );
};


// --- Timetable コンポーネント本体 ---

const Timetable: React.FC<TimetableProps> = ({ semester, timetable, totalCredits, onRemoveCourse, onMoveCourse }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor) // sortableKeyboardCoordinates は不要
  );
  const [activeId, setActiveId] = useState<string | null>(null); // ドラッグ中のアイテムID
  const [overId, setOverId] = useState<string | null>(null); // ドラッグオーバー中のアイテムID
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null); // ドラッグ中の科目データ

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id.toString();
    setActiveId(id);
    const [day, periodStr] = id.split('-');
    const course = getCourse(day, parseInt(periodStr));
    setDraggedCourse(course); // ドラッグされた科目をセット
  }, [timetable, semester]); // timetable と semester を依存配列に追加

  // onDragOver を DragOverEvent に変更
  const handleDragOver = useCallback((event: DragOverEvent) => {
     setOverId(event.over ? event.over.id.toString() : null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    setDraggedCourse(null); // ドラッグ終了時にクリア

    if (over && active.id !== over.id) {
      const [sourceDay, sourcePeriod] = active.id.toString().split('-');
      const [destDay, destPeriod] = over.id.toString().split('-');

      // 移動元に科目がある場合のみ移動を実行 (getCourse は不要になるかも)
      // if (getCourse(sourceDay, parseInt(sourcePeriod))) { // このチェックは onMoveCourse 側で行う方が良い場合もある
        onMoveCourse(
          { day: sourceDay, period: parseInt(sourcePeriod) },
          { day: destDay, period: parseInt(destPeriod) }
        );
      // }
    }
  }, [onMoveCourse]); // 依存配列をシンプルに

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setOverId(null);
    setDraggedCourse(null); // ドラッグキャンセル時にもクリア
  }, []);

  const DAYS = ['月', '火', '水', '木', '金'] as const;
  const PERIODS = [1, 2, 3, 4, 5] as const;

  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobileBreakpoint = 768;
      const isMobileView = window.innerWidth < mobileBreakpoint;
      setIsMobile(isMobileView);
      if (isMobileView && viewMode === 'table') {
        setViewMode('list');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [viewMode]);

  const getCourse = (day: string, period: number) => {
    return timetable[semester]?.[day]?.[period] || null;
  };

  const renderViewToggle = () => {
    // (変更なし)
    return (
      <div className="flex mb-4 justify-end">
        <div className="inline-flex rounded-lg border border-[--border] overflow-hidden">
          <button
            className={`px-4 py-2 text-sm transition-colors ${
              viewMode === 'table'
                ? 'bg-[--primary] text-white'
                : 'bg-[--secondary] hover:bg-[--secondary-hover]'
            }`}
            onClick={() => setViewMode('table')}
            aria-label="表形式で表示"
          >
            <span className="hidden sm:inline">表形式</span>
            <span className="sm:hidden">表</span>
          </button>
          <button
            className={`px-4 py-2 text-sm transition-colors ${
              viewMode === 'list'
                ? 'bg-[--primary] text-white'
                : 'bg-[--secondary] hover:bg-[--secondary-hover]'
            }`}
            onClick={() => setViewMode('list')}
            aria-label="リスト形式で表示"
          >
            <span className="hidden sm:inline">リスト形式</span>
            <span className="sm:hidden">リスト</span>
          </button>
        </div>
      </div>
    );
  };

  const renderDaySelector = () => {
    // (変更なし)
    return (
      <div className="flex mb-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <button
          className={`mr-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedDay === null
              ? 'bg-[--primary] text-white'
              : 'bg-[--secondary] hover:bg-[--secondary-hover]'
          }`}
          onClick={() => setSelectedDay(null)}
        >
          全て
        </button>
        {DAYS.map((day) => (
          <button
            key={day}
            className={`mr-2 min-w-[4rem] px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedDay === day
                ? 'bg-[--primary] text-white'
                : 'bg-[--secondary] hover:bg-[--secondary-hover]'
            }`}
            onClick={() => setSelectedDay(day)}
          >
            {day}曜
          </button>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    // (変更なし)
    const displayDays = selectedDay ? [selectedDay] : DAYS;
    return (
      <div className="space-y-6">
        {displayDays.map((day) => (
          <div key={day} className="card overflow-hidden border border-[--border]">
            <div className="py-2 px-4 bg-[--secondary] border-b border-[--border] font-medium">
              {day}曜日
            </div>
            <div className="divide-y divide-[--border]">
              {PERIODS.map((period) => {
                const course = getCourse(day, period);
                return (
                  <div key={period} className="p-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-grow">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[--secondary] text-sm font-medium flex-shrink-0">
                        {period}
                      </span>
                      {course ? (
                        <div className="min-w-0 flex-grow">
                          <div className="font-medium truncate">{course.name}</div>
                          <div className="text-xs text-[--muted-foreground]">{course.credits}単位</div>
                        </div>
                      ) : (
                        <span className="text-[--muted-foreground]">科目なし</span>
                      )}
                    </div>
                    {course && (
                      <button
                        onClick={() => onRemoveCourse(day, period)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors ml-2 flex-shrink-0"
                        aria-label="科目を削除"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    // ドラッグ可能なアイテムのIDリストを作成
    const items = DAYS.flatMap(day =>
      PERIODS.map(period => `${day}-${period}`)
    );

    return (
      <div className="overflow-x-auto">
        {/* DndContext: autoScroll=false を追加 */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver} // onDragOver を追加
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          autoScroll={false} // 自動スクロールを無効化
          collisionDetection={closestCenter} // collisionDetection はそのままで良い場合が多い
        >
          {/* SortableContext は削除 */}
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-[--secondary]">
                <th className="p-3 text-left font-medium text-[--muted-foreground] w-16"></th>
                {DAYS.map((day) => (
                  <th key={day} className="p-3 text-center font-medium text-[--muted-foreground] w-1/5">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIODS.map((period) => (
                <tr key={period} className="min-h-[4.5rem]">
                  <td className="p-3 font-medium text-[--muted-foreground] bg-[--secondary]">
                    {period}限
                  </td>
                  {DAYS.map((day) => {
                    const course = getCourse(day, period);
                    const cellId = `${day}-${period}`;
                    const isCurrentOver = overId === cellId; // このセルがドロップ先か
                    const isCurrentDragging = activeId === cellId; // このセルがドラッグ元か

                    return (
                      <td key={day} className="p-2 align-top">
                        {/* TimetableCell を使用 */}
                        <TimetableCell
                          id={cellId}
                          course={course}
                          isOver={isCurrentOver}
                          isDragging={!!activeId} // グローバルなドラッグ状態
                          isDraggableDragging={isCurrentDragging} // このセル自身がドラッグされているか
                          onRemoveCourse={onRemoveCourse}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* DragOverlay を追加 */}
          <DragOverlay dropAnimation={null}>
            {activeId && draggedCourse ? (
              // ドラッグ中の見た目として CourseCard を表示
              // DragOverlay 内では id や listeners は不要
              <CourseCard
                course={draggedCourse}
                onRemoveCourse={() => {}} // Overlay内では削除不可
                day="" // Overlay内では不要
                period={0} // Overlay内では不要
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    );
  };

  return (
    <div>
      {renderViewToggle()}
      {viewMode === 'list' && renderDaySelector()}
      {viewMode === 'table' ? renderTableView() : renderListView()}
      <div className="mt-4 p-3 bg-[--secondary] rounded-lg flex justify-end">
        <div className="font-medium">
          <span className="text-[--muted-foreground]">合計単位数:</span>{' '}
          <span className="text-[--primary] text-lg">{totalCredits}</span>
        </div>
      </div>
    </div>
  );
};

export default Timetable;

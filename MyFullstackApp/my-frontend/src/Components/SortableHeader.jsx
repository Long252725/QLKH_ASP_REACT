import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableHeader = ({ id, column, onSort, currentSort }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${column.width} flex items-center gap-2 group`}>
      {/* Chỉ có icon này mới có quyền kéo thả */}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-grip-vertical text-slate-400 text-[10px]"></i>
      </div>

      <span className="flex-1">{column.label}</span>

      {column.isSortable && (
        <div className="cursor-pointer" onClick={(e) => { e.stopPropagation();
        
         onSort(); 
         console.log('onSort');
         }}>
          {currentSort === 'HoTenDayDu_asc' && <i className="fa-solid fa-arrow-up-z-a"></i>}
          {currentSort === 'HoTenDayDu_desc' && <i className="fa-solid fa-arrow-down-z-a"></i>}
          {currentSort === '' && <i className="fa-solid fa-sort text-blue-300"></i>}
        </div>
      )}
    </div>
  );
};
export default SortableHeader;
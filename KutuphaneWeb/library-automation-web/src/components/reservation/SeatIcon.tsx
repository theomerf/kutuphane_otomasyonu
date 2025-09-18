import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useBreakpoint } from '../../hooks/useBreakpoint';

type Props = {
  isAvailable: boolean;
  selected?: boolean;
  onClick?: () => void;
  seatNumber?: number;
};

export default function SeatIcon({ isAvailable, selected, onClick, seatNumber }: Props) {
  const { up } = useBreakpoint();
  let color = "#6B7280"; // Default (boş/kapalı)
  
  if (!isAvailable) {
    color = "#DC2626"; // Dolu - kırmızı
  }
  if (selected) {
    color = "#7C3AED"; // Seçili - mor
  }
  if (isAvailable && !selected) {
    color = "#059669"; // Uygun - yeşil
  }

  return (
    <button 
      type="button" 
      onClick={onClick} 
      className={`
        relative transition-all duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-opacity-50
        hover:scale-110 active:scale-95
        ${!isAvailable && !selected ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
      `}
      disabled={!isAvailable && !selected}
    >
      <div className="flex flex-col items-center space-y-1">
        <EventSeatIcon 
          style={{ 
            color: color, 
            fontSize: `${up.lg ? 40 : 32}px`,
            filter: selected ? 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.4))' : 'none'
          }} 
        />
        <span 
          className="text-xs font-medium"
          style={{ color: color }}
        >
          {seatNumber}
        </span>
      </div>
      
      {selected && (
        <div className="absolute -inset-1 rounded-lg border-2 border-purple-400 animate-pulse opacity-60" />
      )}
    </button>
  );
}
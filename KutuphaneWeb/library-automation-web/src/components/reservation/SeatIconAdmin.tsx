import EventSeatIcon from '@mui/icons-material/EventSeat';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';

type Props = {
    hovered?: boolean;
    onHover?: () => void;
    seatNumber?: number;
    onMouseLeave?: () => void;
    handleSeatDelete?: () => void;
};

export default function SeatIconAdmin({ hovered, onHover, seatNumber, onMouseLeave, handleSeatDelete }: Props) {
    const { up } = useBreakpoint();
    const isMobile = !up.md;
    const [showDeleteButton, setShowDeleteButton] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setShowDeleteButton(false);
            }
        }

        if (isMobile && showDeleteButton) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isMobile, showDeleteButton]);

    return (
        <button
            type="button"
            ref={buttonRef}
            aria-pressed={hovered}
            aria-label={seatNumber ? `Seat number ${seatNumber}` : 'Seat icon'}
            onMouseEnter={onHover}
            onClick={isMobile ? () => { onHover; setShowDeleteButton(true); } : undefined}
            onMouseLeave={onMouseLeave}
            className="group relative transition-all duration-200 ease-in-out
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-opacity-50
             hover:scale-110 active:scale-95">

            <div className="flex flex-col items-center space-y-1">
                <EventSeatIcon
                    style={{
                        color: hovered ? "#7C3AED" : "#6B7280",
                        fontSize: `${up.lg ? 40 : 32}px`,
                        filter: hovered ? 'drop-shadow(0 2px 4px rgba(124, 58, 237, 0.4))' : 'none'
                    }}
                />
                <span
                    className="text-xs font-medium"
                    style={{ color: hovered ? "#7C3AED" : "#6B7280" }}
                >
                    {seatNumber}
                </span>
            </div>

            <div className="absolute -inset-1 rounded-lg border-2 border-purple-400 opacity-0 group-hover:opacity-60 group-hover:animate-pulse" />

            {isMobile ? (
                <>{showDeleteButton &&
                    <div className="absolute z-10 top-[-90%] right-[-10%]">
                        <div onClick={handleSeatDelete} title="Sil" className="button !p-2 !bg-red-500"> 
                            <FontAwesomeIcon icon={faTrash} />
                        </div>
                    </div>}
                </>
            ) : (
                <div className="absolute z-10 top-[-90%] right-[-20%] opacity-0 group-hover:opacity-100">
                    <div onClick={handleSeatDelete} title="Sil" className="button !bg-red-500">
                        <FontAwesomeIcon icon={faTrash} />
                    </div>
                </div >
            )
            }

        </button >

    );
}
import SeatIcon from "./SeatIcon";
import type { Table } from "../../types/table";
import type ReservationStatuses from "../../types/reservationStatuses";

type TableRowProps = {
  table: Table;
  selectedSeatId: number | null;
  reservationsStatuses?: ReservationStatuses[];
  onSelectSeat: (seatId: number, seatNumber: number, tableName: string) => void;
};

export default function TableRow({ table, selectedSeatId, reservationsStatuses, onSelectSeat }: TableRowProps) {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <div className="flex flex-row gap-2 lg:gap-6 justify-center">
        {table.seats.map(seat => (
          <SeatIcon
            key={seat.id}
            isAvailable={reservationsStatuses ? reservationsStatuses.findIndex(r => r.seatId === seat.id &&  r.status === "Active") === -1 : true}
            selected={selectedSeatId === seat.id}
            onClick={() => {(reservationsStatuses ? reservationsStatuses.findIndex(r => r.seatId === seat.id && r.status === "Active") === -1 : true) && onSelectSeat(seat.id, seat.seatNumber, table.name)}}
            seatNumber={seat.seatNumber}
          />
        ))}
      </div>
    </div>
  );
}
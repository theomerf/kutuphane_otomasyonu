import type { Table } from "../../types/table";
import type ReservationStatuses from "../../types/reservationStatuses";
import LibraryDeskTop from "./LibraryDesk";
import { useBreakpoint } from "../../hooks/useBreakpoint";

type Props = {
  tables: Table[];
  selectedSeatId: number | null;
  reservationsStatuses?: ReservationStatuses[];
  onSelectSeat: (seatId: number, seatNumber: number, tableName: string) => void;
};

export default function LibrarySeatMap({ tables, selectedSeatId, reservationsStatuses, onSelectSeat }: Props) {
  const { up } = useBreakpoint();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 items-center justify-center w-full p-6">
      {tables.map(table => (
        <div key={table.id} className="flex flex-col items-center space-y-4">
          <LibraryDeskTop
            width={up.lg ? 380 : 300}
            height={up.lg ? 140 : 110}
            table={table}
            reservationsStatuses={reservationsStatuses}
            selectedSeatId={selectedSeatId}
            onSelectSeat={onSelectSeat}
            label={table.name}
            className="drop-shadow-sm"
          />
        </div>
      ))}
    </div>
  );
}
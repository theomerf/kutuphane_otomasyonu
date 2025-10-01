import type { Table } from "../../types/table";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import LibraryDeskTopAdmin from "./LibraryDeskAdmin";
import type { SeatInfo } from "../../pages/Admin/ReservationsManager/Seats/SeatsAdmin";

type Props = {
  tables: Table[];
  hoveredSeat: SeatInfo | null;
  noHoverSeat: () => void;
  handleSeatDelete: (seatId: number) => void;
  onHoverSeat: (seatId: number, seatNumber: number, tableName: string) => void;
};

export default function LibrarySeatMapAdmin({ tables, hoveredSeat, onHoverSeat, noHoverSeat, handleSeatDelete }: Props) {
  const { up } = useBreakpoint();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8 items-center justify-center w-full p-6">
      {tables.map(table => (
        <div key={table.id} className="flex flex-col items-center space-y-4">
          <LibraryDeskTopAdmin
            width={up.lg ? 380 : 300}
            height={up.lg ? 140 : 110}
            table={table}
            hoveredSeat={hoveredSeat}
            handleSeatDelete={handleSeatDelete}
            noHoverSeat={noHoverSeat}
            onHoverSeat={onHoverSeat}
            label={table.name}
            className="drop-shadow-sm"
          />
        </div>
      ))}
    </div>
  );
}
import type Seat from "../types/seat";
import type { Table } from "../types/table";

export function groupSeatsByTable(seats: Seat[]): Table[] {
  const tableMap: Record<string, Seat[]> = {};

  for (const seat of seats) {
    if (!tableMap[seat.location]) tableMap[seat.location] = [];
    tableMap[seat.location].push(seat);
  }

  return Object.entries(tableMap).map(([location, seats]) => ({
    id: location,
    name: `${location.replace("M-", "Masa ")}`,
    seats: seats.sort((a, b) => a.seatNumber - b.seatNumber),
  }));
}
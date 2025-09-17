import type Seat from "./seat";


export interface Table {
  id: string;
  name: string;
  seats: Seat[];
}
export interface Event {
  _id?: string;
  title: string;
  start: string; // ISO string
  end: string;   // ISO string
  userId?: string;
}

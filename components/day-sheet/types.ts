/** Modos do DaySheet (Stitch: A criação, B execução, C visualização). */
export type DaySheetMode = "create" | "execution" | "view";

export type DaySheetViewMeta = {
  dayStatus: "done" | "failed" | "empty";
  dayNote: string;
  pomodoros: number;
};

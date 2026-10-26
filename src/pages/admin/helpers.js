export const indexById = (list) => new Map(list.map((x) => [x.id, x]));

export const byDate = (a, b) =>
  new Date(a.appointment_date) - new Date(b.appointment_date);

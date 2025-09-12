interface ObjectWithId {
  id: number;
  [key: string]: any;
}

export function sortById(array: ObjectWithId[]): any[] {
  return array.sort((a, b) => {
    if (a.id < b.id) return -1;
    if (a.id > b.id) return 1;
    return 0;
  })
}

export interface IRepository<T> {
  save(entity: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findByHash(hash: string): Promise<T | null>;
}

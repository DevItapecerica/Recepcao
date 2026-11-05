export interface SubjectData {
  uuid: string;
  name: string;
  description: string | null;
}

export interface CreateSubjectData {
  name: string;
  description?: string | null;
}

export interface UpdateSubjectData {
  name?: string;
  description?: string | null;
}

export interface ISubjectRepository {
  list(): Promise<SubjectData[]>;

  findById(uuid: string): Promise<SubjectData | null>;

  findByName(name: string): Promise<SubjectData | null>;

  create(data: CreateSubjectData): Promise<SubjectData>;

  update(
    uuid: string,
    data: UpdateSubjectData,
  ): Promise<SubjectData | null>;

  delete(uuid: string): Promise<boolean>;
}
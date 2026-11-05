
export interface AttendantData {
  uuid: string;
  name: string;
  description: string | null;
}

export interface CreateAttendantData {
  name: string;
  description?: string | null;
}

export interface UpdateAttendantData {
  name?: string;
  description?: string | null;
}

export interface IAttendantRepository {
  list(): Promise<AttendantData[]>;

  findById(uuid: string): Promise<AttendantData | null>;

  create(data: CreateAttendantData): Promise<AttendantData>;

  update(
    uuid: string,
    data: UpdateAttendantData,
  ): Promise<AttendantData | null>;

  delete(uuid: string): Promise<boolean>;
}

export class UserEntity {
  constructor(
    public id: string,
    public username: string,
    public email: string,
    public password: string,
    public roleId: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}


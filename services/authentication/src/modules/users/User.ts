import * as bcrypt from 'bcrypt';
import { ObjectType, Field, registerEnumType, InputType } from 'type-graphql';
import { Entity, Column, BeforeInsert } from 'typeorm';
import { IsEmail, Length, IsIn } from 'class-validator';
import { AppBaseEntity } from '../../base/BaseEntity';

export enum USER_ROLE_MAP {
  PUBLIC = 'ROLE_PUBLIC',
  ADMIN = 'ROLE_ADMIN'
}

registerEnumType(USER_ROLE_MAP, {
  name: 'Roles',
  description: 'User authentication roles'
});

@InputType() // generates correct GQL scheams if referencing USER_ROLE_MAP in resolver @Arg(s)
export class UserRolesInput {
  @Field(type => [USER_ROLE_MAP])
  roles: [USER_ROLE_MAP];
}

@ObjectType()
@Entity('users')
export class User extends AppBaseEntity {
  @Field()
  @Column({ unique: true })
  @IsEmail({ require_tld: true }, { message: 'Please provide a valid email.' })
  email: string;

  @Column({ type: 'varchar' })
  @Length(6, 60) // TODO add required lower/uppercase and number
  password: string;

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      // TODO salt as well
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @Field({ nullable: true })
  @Column({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  @Length(2, 30)
  lastName: string;

  @Field()
  @Column({ default: false })
  isEmailVerified: boolean;

  @Field(type => [USER_ROLE_MAP])
  @IsIn(Object.values(USER_ROLE_MAP))
  @Column({
    type: 'enum',
    enum: USER_ROLE_MAP,
    array: true,
    nullable: false,
    default: [String(USER_ROLE_MAP.PUBLIC)],
    readonly: true
  })
  roles: USER_ROLE_MAP[];
}

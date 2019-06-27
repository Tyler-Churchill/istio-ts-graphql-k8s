import {
  Resolver,
  Mutation,
  ArgsType,
  Field,
  Args,
  Ctx,
  Info
} from 'type-graphql';
import { User } from './User';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';
import { MinLength, IsEmail } from 'class-validator';
import { mapAttributes } from '../../helpers/Helpers';
import * as bcrypt from 'bcrypt';
import { AppContext } from '../../middleware/AppContext';

@ArgsType()
export class RegisterUserArguments {
  @Field(type => String)
  @IsEmail()
  email: string;

  @Field(type => String)
  @MinLength(6)
  password: string;
}

@ArgsType()
export class LoginUserArguments {
  @Field(type => String)
  @IsEmail()
  email: string;

  @Field(type => String)
  @MinLength(6)
  password: string;
}

@Resolver(User)
class UserResolver {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  @Mutation(returns => User, { nullable: true })
  async registerByEmail(@Args() options: RegisterUserArguments) {
    const user = new User();
    user.email = options.email;
    user.password = options.password;
    return await this.userRepository.save(user);
  }

  @Mutation(returns => User, { nullable: true })
  async loginByEmail(
    @Args() options: LoginUserArguments,
    @Ctx() ctx: AppContext,
    @Info() info: any
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: options.email },
      select: ['id', 'password', ...mapAttributes(User, info)]
    });
    if (!user) {
      return null;
    }
    const valid = await bcrypt.compare(options.password, user.password);
    if (!valid) {
      return null;
    }
    ctx.req.session!.userId = user.id; // place valid user ID into session
    return user;
  }
}

export default UserResolver;

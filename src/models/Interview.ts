import { Entity, Column, BaseEntity, PrimaryColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Answer } from "./Answers";
import { User } from "./Users";

@Entity({name: "interview"})
export class Interview extends BaseEntity {
  @PrimaryColumn()
  id: string;
  
  @Column()
  role: string;

  @Column()
  profile: string;

  @Column()
  difficulty: string;

  @Column({ default: false })
  completed: boolean;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Answer, (answer) => answer.interview)
  answers: Answer[];
}
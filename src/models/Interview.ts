import { Entity, Column, BaseEntity, PrimaryColumn, OneToMany } from "typeorm";
import { Answer } from "./Answers";

@Entity({name: "interview"})
export class Interview extends BaseEntity {
  @PrimaryColumn()
  id: string;
  
  @Column()
  role: string;

  @Column()
  candidate: string;

  @Column()
  difficulty: string;

  @Column({ default: false })
  completed: boolean;

  @OneToMany(() => Answer, (answer) => answer.interview)
  answers: Answer[];
}
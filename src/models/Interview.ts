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
  category: string; 
  
  @Column()
  subCategory: string; 
  
  @Column("text", { array: true })
  skills: string[];
  
  @Column()
  experience: string;
  
  @Column()
  additionalInfo: string;

  @Column()
  difficulty: string;

  @Column({ default: false })
  completed: boolean;

  @Column({default: ''})
  reason: string;

  @Column({default: ''})
  feedback: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user: User;
}
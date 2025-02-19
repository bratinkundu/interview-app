import { Entity, Column, PrimaryColumn, BaseEntity, ManyToOne, JoinColumn } from "typeorm";
// import { Interview } from "./Interview";

@Entity({name: "answers"})
export class Answer extends BaseEntity{
  @PrimaryColumn()
  id: string;

  @Column()
  question: string;
  
  @Column()
  answer: string;

  @Column()
  confidenceScore: number;

  @Column({type: 'uuid'})
  interviewId: string | null;
  
  // @ManyToOne(() => Interview, (interview) => interview.id)
  // @JoinColumn({ name: "interviewId" })
  // interview: Interview;
}